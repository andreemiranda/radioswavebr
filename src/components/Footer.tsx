import React from "react";
import { Radio, Github, Twitter, Instagram, Mail, Shield, FileText, Cookie, Scale, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useTheme } from "../context/ThemeContext";

/**
 * Modern footer for Radio Wave Brasil
 * Uses the brasil.green theme as requested
 */
export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const isBrazil = theme === 'brazil';

  return (
    <footer className={cn(
      "px-6 py-16 transition-all duration-300",
      isBrazil 
        ? "bg-[#009C3B] text-white border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.15)]" 
        : "bg-theme-footer text-white border-t border-white/5 py-12"
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                isBrazil 
                  ? "bg-[#FFDF00] text-[#009C3B] shadow-[0_8px_24px_rgba(255,223,0,0.45)]" 
                  : "bg-white/5 border border-white/5 text-theme-primary shadow-sm"
              )}>
                <Radio size={24} />
              </div>
              <div>
                <h2 className="text-xl font-display font-black tracking-tight uppercase">Radio Wave Brasil</h2>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em] mt-1 block opacity-60",
                  isBrazil ? "text-white" : "text-theme-primary"
                )}>Premium Stream</span>
              </div>
            </div>
            <p className={cn(
              "text-sm max-w-sm leading-relaxed mb-8 font-medium",
              isBrazil ? "text-white/70" : "text-white/50"
            )}>
              A melhor experiência de rádios online do Brasil. Streaming premium, interface moderna e performance otimizada para Desktop, Android e iOS. Tudo sintonizado em um só lugar.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className={cn(
              "font-display font-black uppercase tracking-[0.25em] text-[11px] mb-8 opacity-80",
              isBrazil ? "text-[#FFDF00]" : "text-theme-primary"
            )}>Documentos legais</h3>
            <ul className="space-y-4 text-xs font-bold">
              <li>
                <Link to="/politica-de-privacidade" className={cn(
                  "transition-all duration-300 flex items-center gap-3 group",
                  isBrazil ? "text-white/60 hover:text-[#FFDF00]" : "text-white/40 hover:text-white"
                )}>
                  <Shield size={16} className="opacity-40 group-hover:opacity-100" />
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos-de-uso" className={cn(
                  "transition-all duration-300 flex items-center gap-3 group",
                  isBrazil ? "text-white/60 hover:text-[#FFDF00]" : "text-white/40 hover:text-white"
                )}>
                  <FileText size={16} className="opacity-40 group-hover:opacity-100" />
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/politica-de-cookies" className={cn(
                  "transition-all duration-300 flex items-center gap-3 group",
                  isBrazil ? "text-white/60 hover:text-[#FFDF00]" : "text-white/40 hover:text-white"
                )}>
                  <Cookie size={16} className="opacity-40 group-hover:opacity-100" />
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link to="/aviso-legal" className={cn(
                  "transition-all duration-300 flex items-center gap-3 group",
                  isBrazil ? "text-white/60 hover:text-[#FFDF00]" : "text-white/40 hover:text-white"
                )}>
                  <Scale size={16} className="opacity-40 group-hover:opacity-100" />
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link to="/gerenciamento-consentimento" className={cn(
                  "inline-flex px-4 py-2.5 rounded-xl transition-all duration-300 items-center gap-3 group mt-3 uppercase tracking-widest text-[9px] font-black border",
                  isBrazil
                    ? "bg-white/10 border-white/20 text-[#FFDF00] hover:bg-white/20 hover:border-white/30"
                    : "bg-white/5 border border-white/5 hover:bg-white/10 text-theme-primary"
                )}>
                  <Settings2 size={16} />
                  Privacidade & Consentimento
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h3 className={cn(
              "font-display font-black uppercase tracking-[0.25em] text-[11px] mb-8 opacity-80",
              isBrazil ? "text-[#FFDF00]" : "text-theme-primary"
            )}>Conecte-se</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Instagram, href: "https://instagram.com/andremiranda04", label: "Instagram" },
                { icon: Twitter, href: "https://x.com/andremirandaa", label: "Twitter" },
                { icon: Github, href: "https://github.com/andreemiranda/radioswavebrasil", label: "GitHub" },
                { icon: Mail, href: "mailto:legislativomunicipal@aol.com", label: "Email" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  target={social.href.startsWith('mailto') ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 border active:scale-90",
                    isBrazil
                      ? "bg-white/10 border-white/10 text-white hover:bg-[#FFDF00] hover:text-[#009C3B] hover:shadow-[0_8px_20px_rgba(255,223,0,0.4)] hover:-translate-y-1"
                      : "bg-white/5 border-white/5 hover:bg-theme-primary hover:text-white hover:-translate-y-1"
                  )}
                  aria-label={social.label}
                >
                  <social.icon size={22} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={cn(
          "mt-20 pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.25em]",
          isBrazil 
            ? "border-white/10 text-white/40" 
            : "border-theme-border opacity-40"
        )}>
          <div className="flex flex-col md:flex-row items-center gap-6">
             <p>© {new Date().getFullYear()} Radio Wave Brasil</p>
          </div>
          <p className={isBrazil ? "text-[#FFDF00]/60" : "text-theme-primary"}>Desenvolvido por André Miranda</p>
        </div>
      </div>
    </footer>
  );
};

