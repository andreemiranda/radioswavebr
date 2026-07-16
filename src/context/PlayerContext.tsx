import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import Hls from 'hls.js';
import * as dashjs from 'dashjs';
import { RadioStation } from '../types';
import { safeSetItem } from '../lib/storage';
import { CUSTOM_STATIONS } from '../data/customStations';

// Rewrites a raw stream URL through the mixed-content proxy (/api/proxy-audio)
// whenever the page is HTTPS and the target is plain HTTP — browsers block that
// combination outright, which used to surface as a silent "Sem Sinal".
// Used both for the top-level manifest/stream URL and, via the custom loaders
// below, for every HLS segment/DASH sub-request too (HLS/DASH fetch many URLs
// over a stream's lifetime, not just the first one).
const getProxiedUrl = (url: string, retryFlag = false) => {
  // @ts-ignore
  const proxyUrl = import.meta.env.VITE_AUDIO_PROXY_URL;
  if (proxyUrl && window.location.protocol === 'https:' && url.startsWith('http:')) {
    return `${proxyUrl}?url=${encodeURIComponent(url)}${retryFlag ? `&retry=${Date.now()}` : ''}`;
  }
  return url;
};

// hls.js issues a fresh request for the manifest and for every media segment;
// route each one through the mixed-content proxy so a whole HTTP HLS stream
// keeps working on an HTTPS page, not just its first request.
class ProxyingHlsLoader extends Hls.DefaultConfig.loader {
  load(context: any, config: any, callbacks: any) {
    context.url = getProxiedUrl(context.url);
    super.load(context, config, callbacks);
  }
}

// Whether a station comes from the local custom list (vs the Radio Browser API)
const isLocalStation = (station: RadioStation) => station.id.startsWith('custom-');

interface PlayerContextType {
  playing: RadioStation | null;
  isPlaying: boolean;
  needsResume: boolean;
  volume: number;
  muted: boolean;
  audioError: boolean;
  allStationsOffline: boolean;
  favorites: RadioStation[];
  playStation: (station: RadioStation) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFavorite: (station: RadioStation) => void;
  isFavorite: (id: string) => boolean;
  retry: () => void;
  /** Called by the UI layer whenever its visible station list changes, so the
   *  auto-skip logic can navigate within the currently displayed sequence. */
  setCurrentList: (stations: RadioStation[]) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- PLAYER STATE ---
  const [playing, setPlaying] = useState<RadioStation | null>(() => {
    try {
      const saved = localStorage.getItem('RadioWaveBR_lastStation');
      return saved ? (JSON.parse(saved) as RadioStation) : null;
    } catch {
      return null;
    }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsResume, setNeedsResume] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => {
    return localStorage.getItem('RadioWaveBR_muted') === 'true';
  });
  const [volume, setVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem('RadioWaveBR_volume');
    return saved ? parseFloat(saved) : 0.8;
  });
  const [audioError, setAudioError] = useState(false);
  // Becomes true when every station in the current group has been tried and
  // failed — prompts the UI to show a friendly "all offline" message.
  const [allStationsOffline, setAllStationsOffline] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasRestoredRef = useRef(false);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeLockRef = useRef<any>(null);
  const lastProgressTimeRef = useRef<number>(Date.now());
  const lastCurrentTimeRef = useRef<number>(0);
  const stallWatchdogRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const dashRef = useRef<any>(null);

  // --- AUTO-SKIP REFS ---
  // Stations (by id) that have already been tried and failed in the current
  // auto-navigation cycle. Cleared whenever a station plays successfully or the
  // user picks a station manually.
  const failedInCycleRef = useRef<Set<string>>(new Set());
  // The visible station list provided by the UI layer (current page/results).
  // Auto-skip uses this to determine which station comes next.
  const currentListRef = useRef<RadioStation[]>([]);
  // Stable refs so stale closures (audio event listeners / intervals) always
  // call the latest version of these functions.
  const autoSkipToNextRef = useRef<() => void>(() => {});
  const scheduleErrorRetryRef = useRef<() => void>(() => {});

  const MAX_AUTO_RETRIES = 5;
  const RETRY_DELAY_MS = 3000;
  const STALL_TIMEOUT_MS = 8000; // if playback doesn't advance for this long, force a reconnect

  // --- FAVORITES STATE ---
  const [favorites, setFavorites] = useState<RadioStation[]>(() => {
    const saved = localStorage.getItem('RadioWaveBR_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const playingRef = useRef(playing);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Attaches a station's stream to the audio element, picking the right engine
  // for whatever format it turns out to be:
  //  - HLS (.m3u8, or Radio-Browser's `hls` flag): hls.js in Chrome/Firefox/Edge
  //    (no native MSE-less HLS support there); Safari plays it natively via src.
  //  - MPEG-DASH (.mpd): dash.js (no browser plays this natively).
  //  - Everything else (MP3/AAC/OGG/Opus/FLAC/WebM Icecast/Shoutcast streams,
  //    the vast majority of radio stations): plain audio.src, proxied when the
  //    stream is HTTP and the page is HTTPS.
  // Any previously attached HLS/DASH engine is torn down first so switching
  // stations or formats never leaves a stale player running in the background.
  const attachSource = (audio: HTMLAudioElement, station: RadioStation, retryFlag = false) => {
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    if (dashRef.current) { dashRef.current.reset(); dashRef.current = null; }

    const rawUrl = station.streamUrl;
    const isHls = !!station.hls || /\.m3u8(\?|$)/i.test(rawUrl);
    const isDash = /\.mpd(\?|$)/i.test(rawUrl);
    const url = getProxiedUrl(rawUrl, retryFlag);

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, loader: ProxyingHlsLoader as any });
        hlsRef.current = hls;
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data?.fatal) scheduleErrorRetryRef.current();
        });
        hls.loadSource(url);
        hls.attachMedia(audio);
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari (and some WebKit-based browsers): native HLS support.
        audio.src = url;
        audio.load();
      } else {
        // No HLS support at all in this browser — surface it as a normal
        // playback failure (clear "Sem Sinal" + retry) instead of dead silence.
        setTimeout(() => scheduleErrorRetryRef.current(), 0);
      }
    } else if (isDash) {
      const player = dashjs.MediaPlayer().create();
      dashRef.current = player;
      // Route every DASH sub-request (manifest + segments) through the same
      // mixed-content proxy used for HLS/direct streams.
      player.extend('RequestModifier', function () {
        return { modifyRequestURL: (requestUrl: string) => getProxiedUrl(requestUrl) };
      }, true);
      player.on(dashjs.MediaPlayer.events.ERROR, () => scheduleErrorRetryRef.current());
      player.initialize(audio, url, false);
    } else {
      // Native playback: MP3, AAC, OGG/Opus, FLAC, WebM — everything a plain
      // <audio> element already understands.
      audio.src = url;
      audio.load();
    }
  };

  // ─── AUTO-SKIP LOGIC ────────────────────────────────────────────────────────
  //
  // Called when a station exhausts all retry attempts.
  // Finds the next station in the same group (local or API), respecting the
  // order currently visible on screen (currentListRef), or falling back to the
  // full CUSTOM_STATIONS list for local stations. Wraps around at end-of-list.
  // Stops with an "all offline" message if every station in the group has been
  // tried and failed in this cycle.
  //
  // IMPORTANT: uses only refs and stable setters — never reads React state
  // directly — so it works correctly even when called from stale closures
  // (audio event handlers, stall watchdog intervals).
  const autoSkipToNext = () => {
    const station = playingRef.current;
    if (!station) return;

    const ts = new Date().toISOString();
    const local = isLocalStation(station);

    // Mark current station as failed in this navigation cycle
    failedInCycleRef.current.add(station.id);
    console.debug(
      `[RadioWave][${ts}] Auto-skip: "${station.name}" failed after ${MAX_AUTO_RETRIES} attempts.`,
      `Failed in cycle: ${failedInCycleRef.current.size}`,
      `Type: ${local ? 'local' : 'API'}`
    );

    // Build the ordered group to navigate within:
    //   Priority 1 – stations of the same type visible in the current UI list
    //   Priority 2 (local only) – full CUSTOM_STATIONS fallback
    let group: RadioStation[] = currentListRef.current.filter(
      s => local === isLocalStation(s)
    );

    if (group.length === 0 && local) {
      group = [...CUSTOM_STATIONS];
      console.debug(`[RadioWave][${ts}] Fallback to full CUSTOM_STATIONS (${group.length} stations)`);
    }

    if (group.length === 0) {
      console.warn(`[RadioWave][${ts}] No navigable group found — stopping auto-cycle.`);
      setAudioError(true);
      setAllStationsOffline(true);
      return;
    }

    // Locate current station in the group (may not be present if it came from
    // a different page; treat it as if it were just before index 0 so we start
    // cycling from the beginning of the group).
    const currentIndex = group.findIndex(s => s.id === station.id);

    // Find the next candidate not already tried in this cycle
    let nextStation: RadioStation | null = null;
    for (let i = 1; i <= group.length; i++) {
      const idx = currentIndex === -1 ? i - 1 : (currentIndex + i) % group.length;
      const candidate = group[idx];
      if (!failedInCycleRef.current.has(candidate.id)) {
        nextStation = candidate;
        console.debug(
          `[RadioWave][${ts}] Auto-skip: "${station.name}" → "${nextStation.name}"`,
          `(${failedInCycleRef.current.size}/${group.length} stations tried)`
        );
        break;
      }
    }

    if (!nextStation) {
      // Every station in the group has been exhausted this cycle
      console.warn(
        `[RadioWave][${ts}] All ${group.length} ${local ? 'local' : 'API'} stations exhausted.`,
        'Stopping auto-cycle to avoid resource waste.'
      );
      setAudioError(true);
      setAllStationsOffline(true);
      return;
    }

    // --- Switch to next station (internal path — does NOT reset failedInCycle) ---
    retryCountRef.current = 0;
    lastProgressTimeRef.current = Date.now();
    lastCurrentTimeRef.current = 0;
    if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }

    // Update the ref immediately so any error retry that fires before React
    // re-renders still targets the correct station.
    playingRef.current = nextStation;
    setPlaying(nextStation);
    setAudioError(false);
    setAllStationsOffline(false);

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    attachSource(audio, nextStation, false);
    audio.play()
      .then(() => setIsPlaying(true))
      .catch((e: any) => {
        if (e.name !== 'AbortError') {
          setAudioError(true);
          setIsPlaying(false);
        }
      });
  };

  // Shared retry path for both the native <audio> 'error' event and fatal
  // hls.js / dash.js errors — schedules a backed-off reconnect attempt.
  // After MAX_AUTO_RETRIES failures, automatically advances to the next station
  // instead of leaving the player in a permanent error state.
  const scheduleErrorRetry = () => {
    if (!playingRef.current) return;
    setIsPlaying(false);

    if (retryCountRef.current < MAX_AUTO_RETRIES) {
      retryCountRef.current += 1;
      console.debug(
        `[RadioWave] Retry ${retryCountRef.current}/${MAX_AUTO_RETRIES} for "${playingRef.current?.name}"`,
        `(delay: ${RETRY_DELAY_MS * retryCountRef.current}ms)`
      );
      retryTimerRef.current = setTimeout(() => {
        forceReconnect(true);
      }, RETRY_DELAY_MS * retryCountRef.current);
    } else {
      // All retries exhausted — hand off to auto-skip
      console.debug(`[RadioWave] All ${MAX_AUTO_RETRIES} retries exhausted for "${playingRef.current?.name}" — triggering auto-skip`);
      autoSkipToNextRef.current();
    }
  };

  // Always keep refs pointing at the latest function versions so stale closures
  // (audio event handlers captured once at mount, interval callbacks) always
  // invoke the current implementations.
  autoSkipToNextRef.current = autoSkipToNext;
  scheduleErrorRetryRef.current = scheduleErrorRetry;

  // Forces a fresh reconnect to the current station's stream (used by both the
  // 'error' handler and the stall watchdog below).
  const forceReconnect = (isRetryAttempt = true) => {
    const audio = audioRef.current;
    const station = playingRef.current;
    if (!audio || !station) return;
    audio.pause();
    attachSource(audio, station, isRetryAttempt);
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setAudioError(false);
        retryCountRef.current = 0;
        // Successful reconnect — this station is fine; reset the failure cycle
        failedInCycleRef.current.clear();
        setAllStationsOffline(false);
      })
      .catch(() => setAudioError(true));
  };

  // Create audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "none";
    
    const hEnded = () => setIsPlaying(false);
    const hPlay = () => {
      setIsPlaying(true);
      setAudioError(false);
      retryCountRef.current = 0;
      lastProgressTimeRef.current = Date.now();
      // Station is streaming — reset the failure cycle tracking
      failedInCycleRef.current.clear();
      setAllStationsOffline(false);
    };
    const hPause = () => setIsPlaying(false);
    const hCanPlay = () => {
      setAudioError(false);
      retryCountRef.current = 0;
      failedInCycleRef.current.clear();
    };
    const hTimeUpdate = () => {
      // Live streams keep advancing currentTime while actually playing audio.
      // Track this so the stall watchdog can tell "playing" apart from "frozen".
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.currentTime !== lastCurrentTimeRef.current) {
        lastCurrentTimeRef.current = audio.currentTime;
        lastProgressTimeRef.current = Date.now();
      }
    };
    const hError = () => scheduleErrorRetryRef.current();

    audio.addEventListener('ended', hEnded);
    audio.addEventListener('play', hPlay);
    audio.addEventListener('pause', hPause);
    audio.addEventListener('canplay', hCanPlay);
    audio.addEventListener('error', hError);
    audio.addEventListener('timeupdate', hTimeUpdate);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('ended', hEnded);
      audio.removeEventListener('play', hPlay);
      audio.removeEventListener('pause', hPause);
      audio.removeEventListener('canplay', hCanPlay);
      audio.removeEventListener('error', hError);
      audio.removeEventListener('timeupdate', hTimeUpdate);
      audio.pause();
      audioRef.current = null;
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
      if (dashRef.current) { dashRef.current.reset(); dashRef.current = null; }
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- STALL WATCHDOG ---
  // Some streams (notably HE-AAC/"aacp" Shoutcast feeds) can stop delivering
  // audible audio a second or two in without ever firing an 'error' event —
  // the connection stays open but playback silently freezes. Detect that by
  // watching for currentTime to stop advancing while we believe we're playing,
  // and force a reconnect just like a real playback error would.
  useEffect(() => {
    if (stallWatchdogRef.current) clearInterval(stallWatchdogRef.current);

    stallWatchdogRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || !isPlaying || !playingRef.current) return;
      if (audio.paused) return;

      const stalledFor = Date.now() - lastProgressTimeRef.current;
      if (stalledFor > STALL_TIMEOUT_MS) {
        lastProgressTimeRef.current = Date.now(); // avoid retry storms
        if (retryCountRef.current < MAX_AUTO_RETRIES) {
          retryCountRef.current += 1;
          console.debug(`[RadioWave] Stall detected for "${playingRef.current?.name}" (${stalledFor}ms). Retry ${retryCountRef.current}/${MAX_AUTO_RETRIES}`);
          forceReconnect(true);
        } else {
          console.debug(`[RadioWave] Stall: all ${MAX_AUTO_RETRIES} retries exhausted for "${playingRef.current?.name}" — triggering auto-skip`);
          autoSkipToNextRef.current();
        }
      }
    }, 2000);

    return () => {
      if (stallWatchdogRef.current) clearInterval(stallWatchdogRef.current);
    };
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- SCREEN WAKE LOCK ---
  // Keeps playback stable through screen lock/screensaver on devices where
  // suspending the display also throttles the media pipeline. Best-effort:
  // silently no-ops where unsupported (desktop browsers, older Safari, etc).
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        // @ts-ignore - Wake Lock API is not in all TS lib versions
        if ('wakeLock' in navigator && isPlaying) {
          // @ts-ignore
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch {
        // Unsupported or denied — playback continues via MediaSession regardless.
      }
    };

    const releaseWakeLock = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release?.().catch(() => {});
        wakeLockRef.current = null;
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    if (playing) {
      safeSetItem('RadioWaveBR_lastStation', JSON.stringify(playing));
    }
  }, [playing]);

  useEffect(() => {
    safeSetItem('RadioWaveBR_volume', String(volume));
    safeSetItem('RadioWaveBR_muted', String(muted));
    
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  useEffect(() => {
    safeSetItem('RadioWaveBR_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Persist wasPlaying so we know if the user was actively listening before refresh
  useEffect(() => {
    safeSetItem('RadioWaveBR_wasPlaying', String(isPlaying));
  }, [isPlaying]);

  // Restore playback on mount: immediately (re)tune the last station the
  // device listened to, regardless of whether it was still playing when the
  // app was last closed — opening the app should feel like turning the radio
  // back on, not resuming a paused state.
  useEffect(() => {
    if (hasRestoredRef.current || !audioRef.current) return;

    if (playing) {
      hasRestoredRef.current = true;
      attachSource(audioRef.current, playing);

      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setNeedsResume(false);
        })
        .catch(() => {
          console.info('[RadioWave] Autoplay blocked. Will resume on first interaction.');
          setNeedsResume(true);
        });
    } else {
      hasRestoredRef.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When needsResume is true, resume playback on the user's first interaction
  useEffect(() => {
    if (!needsResume || !playing || !audioRef.current) return;

    const resume = () => {
      if (!audioRef.current || !needsResume) return;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setNeedsResume(false);
        })
        .catch(() => setNeedsResume(false));
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener('click', resume, true);
      document.removeEventListener('keydown', resume, true);
      document.removeEventListener('touchstart', resume, true);
    };

    document.addEventListener('click', resume, true);
    document.addEventListener('keydown', resume, true);
    document.addEventListener('touchstart', resume, true);

    return cleanup;
  }, [needsResume, playing]);

  // --- DOCUMENT TITLE & META DESCRIPTION (dynamic SEO per station) ---
  useEffect(() => {
    const defaultTitle = 'Radio Wave Brasil - Ouça Rádios Brasileiras Online ao Vivo Grátis';
    const defaultDescription = 'Ouça mais de mil rádios brasileiras ao vivo e de graça: Sertanejo, Pagode, MPB, Rock, Gospel, Funk e Notícias. Player rápido, sem cadastro e sem anúncios.';

    const title = playing
      ? `Radio Wave Brasil - ${playing.name}`
      : defaultTitle;

    const description = playing
      ? `Ouça agora ${playing.name} ao vivo e de graça no Radio Wave Brasil${playing.state ? ` (${playing.state})` : ''}. Player rápido, sem cadastro e sem anúncios.`
      : defaultDescription;

    document.title = title;

    const setMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
  }, [playing]);

  // --- MEDIA SESSION API ---
  useEffect(() => {
    if (!('mediaSession' in navigator) || !playing) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: playing.name,
        artist: playing.country || 'Brasil',
        album: (playing.tags && playing.tags.length > 0) ? playing.tags.join(', ') : 'Rádio Online',
        artwork: [
          {
            src: playing.favicon && playing.favicon.startsWith('http')
              ? playing.favicon
              : '/og-image.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play().then(() => setIsPlaying(true)).catch(console.error);
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });
    } catch (error) {
      console.error('MediaSession Error:', error);
    }

    return () => {
      ['play', 'pause', 'stop'].forEach(action => {
        try { navigator.mediaSession.setActionHandler(action as any, null); } catch (_) {}
      });
    };
  }, [playing]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // --- AUTO-FAVORITE LOGIC ---
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (playing && isPlaying) {
      timer = setTimeout(() => {
        setFavorites(prev => {
          const isFav = prev.some(s => s.id === playing.id);
          if (!isFav) {
            return [...prev, playing];
          }
          return prev;
        });
      }, 60000); 
    }

    return () => clearTimeout(timer);
  }, [playing, isPlaying]);

  // --- ACTIONS ---

  /** Updates the visible station list used by auto-skip to find the next station.
   *  Should be called by the UI layer whenever the displayed list changes. */
  const setCurrentList = (stations: RadioStation[]) => {
    currentListRef.current = stations;
  };

  const playStation = (station: RadioStation) => {
    if (playing?.id === station.id) {
      togglePlay();
    } else {
      // Manual station selection: cancel any in-progress retry/auto-skip,
      // reset all failure tracking, and start fresh for the new station.
      retryCountRef.current = 0;
      lastProgressTimeRef.current = Date.now();
      lastCurrentTimeRef.current = 0;
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
      failedInCycleRef.current.clear();
      setAllStationsOffline(false);
      setPlaying(station);
      setAudioError(false);
      if (audioRef.current) {
        audioRef.current.pause();
        attachSource(audioRef.current, station);
        audioRef.current.volume = muted ? 0 : volume;
        audioRef.current.muted = muted;
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((e) => {
            if (e.name !== 'AbortError') {
              setAudioError(true);
              setIsPlaying(false);
            }
          });
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !playing) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setAudioError(true));
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
  };

  const toggleMute = () => {
    setMuted(prev => !prev);
  };

  const toggleFavorite = (station: RadioStation) => {
    setFavorites(prev => {
      const isFav = prev.some(s => s.id === station.id);
      if (isFav) {
        return prev.filter(s => s.id !== station.id);
      } else {
        return [...prev, station];
      }
    });
  };

  const isFavorite = (id: string) => favorites.some(s => s.id === id);

  const retry = () => {
    if (playing && audioRef.current) {
      retryCountRef.current = 0;
      lastProgressTimeRef.current = Date.now();
      lastCurrentTimeRef.current = 0;
      failedInCycleRef.current.clear();
      setAudioError(false);
      setAllStationsOffline(false);
      audioRef.current.pause();
      attachSource(audioRef.current, playing, true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(false);
        })
        .catch(() => setAudioError(true));
    }
  };

  return (
    <PlayerContext.Provider value={{
      playing,
      isPlaying,
      needsResume,
      volume,
      muted,
      audioError,
      allStationsOffline,
      favorites,
      playStation,
      togglePlay,
      setVolume,
      toggleMute,
      toggleFavorite,
      isFavorite,
      retry,
      setCurrentList,
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
