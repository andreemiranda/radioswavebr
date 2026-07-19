import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PoliticaDePrivacidade from './pages/PoliticaDePrivacidade';
import TermosDeUso from './pages/TermosDeUso';
import PoliticaDeCookies from './pages/PoliticaDeCookies';
import AvisoLegal from './pages/AvisoLegal';
import GerenciamentoConsentimento from './pages/GerenciamentoConsentimento';
import Offline from './pages/Offline';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import { AudioPlayer } from './components/AudioPlayer';
import { Intro } from './components/Intro';

const AppContent: React.FC = () => {
  const { playing, isPlaying, needsResume, togglePlay, volume, setVolume, muted, toggleMute, audioError, retry } = usePlayer();
  const [showIntro, setShowIntro] = React.useState(() => {
    return !sessionStorage.getItem("intro-shown");
  });

  const handleIntroDone = () => {
    sessionStorage.setItem("intro-shown", "1");
    setShowIntro(false);
  };

  return (
    <>
      {showIntro && <Intro onDone={handleIntroDone} />}
      {/* Scrollable content — bottom padding accounts for the fixed player */}
      <div style={{ paddingBottom: playing
        ? 'calc(var(--player-height, 88px) + var(--mobile-nav-height, 0px))'
        : 'var(--mobile-nav-height, 0px)'
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/politica-de-cookies" element={<PoliticaDeCookies />} />
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/gerenciamento-consentimento" element={<GerenciamentoConsentimento />} />
          <Route path="/offline" element={<Offline />} />
        </Routes>
        <CookieConsentBanner />
      </div>

      {/* AudioPlayer lives outside the scrollable div so no parent overflow,
          transform, or z-index stacking context can ever clip or hide it.
          It is position:fixed and persists across all route changes. */}
      {playing && (
        <AudioPlayer
          station={playing}
          isPlaying={isPlaying}
          needsResume={needsResume}
          onTogglePlay={togglePlay}
          volume={volume}
          onVolumeChange={setVolume}
          muted={muted}
          onToggleMute={toggleMute}
          audioError={audioError}
          onRetry={retry}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </ThemeProvider>
  );
};

export default App;
