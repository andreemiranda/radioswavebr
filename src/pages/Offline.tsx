import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';

const Offline: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Opcional: navegar de volta automaticamente após alguns segundos ou mostrar aviso
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      navigate('/');
    } else {
      // Pequeno efeito visual de "tentativa"
      const btn = document.getElementById('retry-btn');
      if (btn) {
        btn.classList.add('animate-shake');
        setTimeout(() => btn.classList.remove('animate-shake'), 500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-brasil-light flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-brasil-surface p-10 rounded-[2.5rem] shadow-player border border-white/5"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-brasil-green/20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 bg-brasil-green/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-brasil-green/30">
            <WifiOff size={48} className="text-brasil-green animate-pulse" />
          </div>
        </div>

        <h1 className="text-3xl font-display font-black text-brasil-green mb-4 uppercase tracking-tighter">Estação Fora do Ar</h1>
        
        <p className="text-brasil-text-secondary text-lg font-medium mb-10 leading-relaxed px-2">
          Sua conexão oscilou. Verifique seu sinal para continuar sintonizando as melhores rádios do Brasil.
        </p>

        {isOnline ? (
          <div className="space-y-4">
            <p className="text-brasil-green font-black mb-4 flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
              <span className="w-2 h-2 bg-brasil-green rounded-full animate-ping" />
              Sinal Restabelecido
            </p>
            <Button 
              onClick={() => navigate('/')}
              variant="primary"
              className="w-full h-14 rounded-2xl"
            >
              <Home size={20} className="mr-2" />
              Voltar ao Início
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Button 
              id="retry-btn"
              onClick={handleRetry}
              variant="primary"
              className="w-full h-14 rounded-2xl"
            >
              <RefreshCcw size={20} className="mr-2" />
              Tentar Reconectar
            </Button>
            
            <button 
              onClick={() => navigate('/')}
              className="text-brasil-text-secondary hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all py-3 hover:scale-105"
            >
              Navegar Offline
            </button>
          </div>
        )}
      </motion.div>

      <div className="mt-12 text-brasil-text-secondary/30 text-[10px] font-black uppercase tracking-[0.3em]">
        Radio Wave Brasil • Stable PWA Engine
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Offline;
