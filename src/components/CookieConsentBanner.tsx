import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, X, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const isBrazil = theme === 'brazil';

  useEffect(() => {
    const consent = localStorage.getItem('RadioWaveBR_cookieConsent');
    if (!consent) {
      // Pequeno delay para não aparecer imediatamente
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: "1.0",
      categories: {
        essential: true,
        functional: true,
        thirdParty: true
      }
    };
    localStorage.setItem('RadioWaveBR_cookieConsent', JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    const consent = {
      accepted: false,
      timestamp: new Date().toISOString(),
      version: "1.0",
      categories: {
        essential: true,
        functional: false,
        thirdParty: false
      }
    };
    localStorage.setItem('RadioWaveBR_cookieConsent', JSON.stringify(consent));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[400] p-4 md:p-8 animate-in slide-in-from-bottom duration-700">
      <div className={cn(
        "max-w-5xl mx-auto rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.5)] border overflow-hidden transition-all duration-300",
        isBrazil 
          ? "bg-[#009C3B] border-white/20 text-white" 
          : "bg-[#0A0F1A] border-white/10 text-white"
      )}>
        <div className="p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10 relative">
          <div className={cn(
            "p-5 rounded-2xl shrink-0 shadow-lg",
            isBrazil ? "bg-white text-[#009C3B]" : "bg-theme-primary/20 text-theme-primary"
          )}>
            <Shield size={32} strokeWidth={2.5} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-display font-black mb-2 tracking-tight">Privacidade & Cookies</h3>
            <p className={cn(
              "text-sm leading-relaxed font-medium",
              isBrazil ? "text-white/90" : "text-white/80"
            )}>
              Usamos cookies essenciais para salvar suas preferências (volume, favoritos, última estação). 
              Cookies opcionais nos ajudam a melhorar sua experiência. Ao continuar, você concorda com nossa{' '}
              <Link to="/politica-de-cookies" className={cn(
                "underline underline-offset-4 decoration-2 font-black transition-all",
                isBrazil ? "text-[#FFDF00] hover:text-white" : "text-theme-primary hover:text-white"
              )}>
                Política de Cookies
              </Link>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <Link 
              to="/gerenciamento-consentimento"
              className={cn(
                "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl border transition-all",
                isBrazil 
                  ? "border-white/20 hover:bg-white/10 text-white" 
                  : "border-white/10 hover:bg-white/5 text-white/60 hover:text-white"
              )}
            >
              <Settings2 size={16} />
              Configurar
            </Link>
            <button
              onClick={handleRejectNonEssential}
              className={cn(
                "text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all",
                isBrazil ? "hover:bg-white/10 text-white/70 hover:text-white" : "hover:bg-white/5 text-white/50 hover:text-white"
              )}
            >
              Recusar
            </button>
            <button
              onClick={handleAcceptAll}
              className={cn(
                "text-sm font-black px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl flex-1 md:flex-none",
                isBrazil 
                  ? "bg-[#FFDF00] text-[#009C3B] hover:bg-white shadow-[0_12px_32px_rgba(255,223,0,0.3)]" 
                  : "bg-theme-primary text-slate-900 hover:bg-white shadow-[0_12px_32px_rgba(0,212,255,0.3)]"
              )}
            >
              Aceitar Tudo
            </button>
          </div>

          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors p-2"
            aria-label="Fechar banner"
          >
            <X size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
