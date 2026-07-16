import React, { useLayoutEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { RadioStation } from "../types";
import { StationImage } from "./StationImage";
import { cn } from "../lib/utils";
import { useTheme } from "../context/ThemeContext";

interface AudioPlayerProps {
  station: RadioStation;
  isPlaying: boolean;
  onTogglePlay: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  muted: boolean;
  onToggleMute: () => void;
  audioError: boolean;
  onRetry: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  station,
  isPlaying,
  onTogglePlay,
  volume,
  onVolumeChange,
  muted,
  onToggleMute,
  audioError,
  onRetry
}) => {
  const { theme } = useTheme();
  const isBrazil = theme === 'brazil';

  const playerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (playerRef.current) {
        document.documentElement.style.setProperty('--player-height', `${playerRef.current.offsetHeight}px`);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      document.documentElement.style.removeProperty('--player-height');
    };
  }, []);

  return (
    <div 
      ref={playerRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[200]",
        isBrazil ? "animate-from-bottom" : "animate-in slide-in-from-bottom duration-500"
      )}
    >
      {/* Visual progress bar (accentuated for radio live feel) */}
      <div className={cn(
        "absolute top-0 left-0 right-0 z-10 h-1",
        !isBrazil && "bg-white/5"
      )}>
        <div 
          className={cn(
            "h-full transition-all duration-1000 shadow-accent-glow",
            isBrazil 
              ? "bg-gradient-to-r from-[#009C3B] via-[#002776] to-[#009C3B] bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite] shadow-[0_0_12px_rgba(0,39,118,0.5)]" 
              : "bg-theme-primary",
            isPlaying ? "w-full opacity-100" : "w-0 opacity-0"
          )}
          style={{ transitionTimingFunction: 'linear' }}
        />
      </div>

      <div className={cn(
        "px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-6 border-t animate-player-glow",
        isBrazil 
          ? "bg-[#002776]/98 backdrop-blur-2xl text-white border-[#FFDF00]/10" 
          : "bg-theme-surface/90 backdrop-blur-xl text-theme-text-primary shadow-elevation-3 border-theme-border"
      )}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 sm:gap-10">
          
          {/* Station Info */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <StationImage 
              station={station} 
              size={48} 
              className={cn(
                "rounded-xl transition-all duration-300 shrink-0",
                isBrazil 
                  ? "border-2 border-[#009C3B]/15 shadow-[0_4px_16px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,156,59,0.15)] hover:scale-105 hover:shadow-[0_6px_24px_rgba(0,156,59,0.28),0_3px_10px_rgba(0,0,0,0.15)]" 
                  : "border border-theme-border shadow-elevation-1 hover:scale-110 hover:shadow-accent-glow hover:border-theme-primary/40"
              )}
            />
            <div className="min-w-0">
              <h3 className={cn(
                "text-sm font-display font-black leading-tight line-clamp-3 break-words [hyphens:none] [-webkit-hyphens:none]",
                isBrazil ? "text-[#FFDF00]" : "text-theme-text-primary"
              )} title={station.name} lang="pt-BR">{station.name}</h3>
              <p className={cn(
                "text-[10px] font-bold uppercase tracking-wider mt-1 opacity-60",
                isBrazil ? "text-white" : "text-theme-text-secondary"
              )}>
                {station.codec} {(station.bitrate && station.bitrate > 0) ? `· ${station.bitrate}kbps` : '· Digital'}
              </p>
              
              {audioError && (
                <div className="flex items-center gap-2 mt-1.5 py-0.5">
                  <AlertCircle size={10} className="text-red-500" />
                  <span className="text-[9px] font-bold uppercase text-red-500">Sem Sinal</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRetry(); }}
                    className="text-[9px] font-bold uppercase text-theme-primary hover:underline ml-1"
                  >
                    Reconectar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative">
              <button 
                onClick={onTogglePlay}
                className={cn(
                  "w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all duration-250 outline-none shadow-premium-accent shrink-0",
                  isBrazil
                    ? "bg-[#009C3B] text-[#FFDF00] shadow-[0_8px_32px_rgba(0,156,59,0.50),0_4px_16px_rgba(0,156,59,0.30),0_2px_6px_rgba(0,0,0,0.15)] hover:scale-112 hover:shadow-[0_12px_40px_rgba(0,156,59,0.60),0_6px_20px_rgba(0,156,59,0.35)] active:scale-93 active:animate-play-bounce"
                    : "bg-theme-primary text-white shadow-accent-glow hover:scale-112 hover:shadow-premium-accent-hover active:scale-93 active:animate-play-bounce"
                )}
              >
                {isPlaying ? (
                  <Pause size={isBrazil ? 26 : 22} fill="currentColor" />
                ) : (
                  <Play size={isBrazil ? 26 : 22} fill="currentColor" className="ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* Volume & Actions */}
          <div className="hidden md:flex items-center justify-end gap-5 flex-1 min-w-0">
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl border",
              isBrazil 
                ? "bg-white/5 border-white/10 text-[#FFDF00]" 
                : "bg-theme-text-primary/5 border-theme-border"
            )}>
              <button 
                onClick={onToggleMute}
                className={cn(
                  "transition-colors duration-200",
                  isBrazil ? "hover:text-[#002776]" : "text-theme-text-secondary hover:text-theme-primary"
                )}
                title={muted ? "Ativar Áudio" : "Mudo"}
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className={cn(
                  "w-20 h-1 rounded-full appearance-none cursor-pointer",
                  isBrazil ? "bg-[#009C3B]/20 accent-[#009C3B]" : "bg-theme-text-primary/10 accent-theme-primary"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

