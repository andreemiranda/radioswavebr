import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LucideIcon, ArrowLeft, Calendar } from 'lucide-react';
import { Footer } from './Footer';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, lastUpdated, icon: Icon, children }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isBrazil = theme === 'brazil';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-body transition-colors duration-300",
      isBrazil ? "bg-[#F8FAFC] text-[#0F172A]" : "bg-theme-bg text-theme-text-primary"
    )}>
      {/* Header Gradiente */}
      <div className={cn(
        "pt-16 pb-24 px-6 relative overflow-hidden border-b",
        isBrazil 
          ? "bg-gradient-to-br from-[#009C3B] to-[#002776] border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]" 
          : "bg-gradient-to-br from-theme-secondary to-theme-bg border-white/5"
      )}>
        <div className="max-w-4xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/')}
            className={cn(
              "flex items-center gap-2 mb-8 font-black uppercase tracking-widest text-xs transition-all group",
              isBrazil ? "text-white/70 hover:text-white" : "text-theme-text-secondary hover:text-theme-primary"
            )}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao início
          </button>
          
          <div className="flex items-center gap-6 mb-6">
            <div className={cn(
              "p-4 rounded-2xl shadow-xl border transition-all duration-300",
              isBrazil 
                ? "bg-white text-[#009C3B] border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.15)]" 
                : "bg-theme-surface text-theme-primary border-white/10 shadow-accent-glow"
            )}>
              <Icon size={36} className="animate-pulse-slow" />
            </div>
            <div>
              <h1 className={cn(
                "text-3xl md:text-5xl font-display font-black tracking-tighter text-white drop-shadow-sm"
              )}>{title}</h1>
              <div className={cn(
                "flex items-center gap-2 mt-3 text-sm font-bold uppercase tracking-widest",
                isBrazil ? "text-white/60" : "text-theme-text-secondary/60"
              )}>
                <Calendar size={14} />
                Atualizado: {lastUpdated}
              </div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        {isBrazil ? (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFDF00]/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#009C3B]/20 rounded-full blur-[120px] -ml-64 -mb-64"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-theme-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-theme-secondary/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
          </>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-grow px-6 -mt-12 mb-20 relative z-20">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className={cn(
            "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-4 drop-shadow-sm",
            isBrazil ? "text-white/50" : "text-white/30"
          )}>
            <Link to="/" className={cn("transition-colors", isBrazil ? "hover:text-[#FFDF00]" : "hover:text-theme-primary")}>Início</Link>
            <span>/</span>
            <span className={cn(isBrazil ? "text-white" : "text-theme-primary")}>{title}</span>
          </nav>

          <div className={cn(
            "rounded-[2.5rem] p-8 md:p-16 border shadow-2xl transition-all duration-300",
            isBrazil 
              ? "bg-white border-[#E2E8F0] shadow-[0_20px_60px_rgba(0,0,0,0.08),0_10px_20px_rgba(0,0,0,0.04)]" 
              : "bg-theme-surface border-white/5 shadow-player"
          )}>
            <div className={cn(
              "prose max-w-none prose-headings:font-display prose-headings:font-black prose-headings:tracking-tighter prose-p:leading-relaxed prose-p:font-medium prose-li:font-medium prose-strong:font-black",
              isBrazil 
                ? "prose-slate prose-headings:text-[#0F172A] prose-p:text-[#334155] prose-li:text-[#334155] prose-h2:border-l-[6px] prose-h2:border-[#009C3B] prose-h2:pl-6 prose-h2:mt-16 prose-h2:mb-8 prose-h3:text-[#002776] prose-a:text-[#009C3B] prose-a:no-underline hover:prose-a:underline prose-code:bg-[#F1F5F9] prose-code:text-[#002776] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none" 
                : "prose-invert prose-h2:border-l-4 prose-h2:border-theme-primary prose-h2:pl-4 prose-h2:mt-10 prose-a:text-theme-primary prose-a:font-bold hover:prose-a:text-white"
            )}>
              {children}
            </div>

            <div className={cn(
              "mt-20 pt-12 border-t flex justify-center",
              isBrazil ? "border-[#F1F5F9]" : "border-white/5"
            )}>
              <button 
                onClick={() => navigate('/')}
                className={cn(
                  "flex items-center gap-4 font-black px-10 py-5 rounded-2xl transition-all shadow-xl group",
                  isBrazil 
                    ? "bg-[#009C3B] text-white hover:bg-[#002776] hover:scale-105 active:scale-95 shadow-[0_12px_32px_rgba(0,156,59,0.35)]" 
                    : "bg-theme-primary text-white hover:bg-white hover:text-theme-primary hover:scale-105 active:scale-95 shadow-accent-glow"
                )}
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalPageLayout;

