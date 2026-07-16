import React, { useState, useEffect } from 'react';
import { Settings2, Trash2, Download, ShieldCheck, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

interface ConsentData {
  accepted: boolean;
  timestamp: string;
  version: string;
  categories: {
    essential: boolean;
    functional: boolean;
    thirdParty: boolean;
  }
}

const GerenciamentoConsentimento: React.FC = () => {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [showData, setShowData] = useState(false);
  const [allData, setAllData] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isBrazil = theme === 'brazil';

  useEffect(() => {
    const raw = localStorage.getItem('RadioWaveBR_cookieConsent');
    if (raw) setConsent(JSON.parse(raw));

    // Carregar todos os dados do localStorage para visualização
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
       const key = localStorage.key(i);
       if (key && key.startsWith('RadioWaveBR_')) {
          try {
             data[key] = JSON.parse(localStorage.getItem(key) || '');
          } catch {
             data[key] = localStorage.getItem(key);
          }
       }
    }
    setAllData(data);
  }, []);

  const handleClearAll = () => {
     if (window.confirm('Tem certeza que deseja apagar todos os seus dados e favoritos desta rádio? Esta ação não pode ser desfeita.')) {
        Object.keys(localStorage).forEach(key => {
           if (key.startsWith('RadioWaveBR_')) {
              localStorage.removeItem(key);
           }
        });
        window.location.reload();
     }
  };

  const handleExport = () => {
     const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `meus-dados-radiowave-${new Date().toISOString().split('T')[0]}.json`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
  };

  const handleRevoke = () => {
     localStorage.removeItem('RadioWaveBR_cookieConsent');
     alert('Consentimento revogado. Você será redirecionado para a página inicial.');
     navigate('/');
     window.location.reload();
  };

  return (
    <LegalPageLayout 
      title="Gerenciamento de Privacidade" 
      lastUpdated="06 de maio de 2026" 
      icon={Settings2}
    >
      <div className="space-y-12">
        {/* Status de Consentimento */}
        <section>
          <h2 className="flex items-center gap-4">
            <ShieldCheck size={28} className={isBrazil ? "text-[#009C3B]" : "text-theme-primary"} />
            Status Atual
          </h2>
          <div className={cn(
            "p-8 rounded-3xl border transition-all duration-300",
            consent 
              ? isBrazil 
                ? "bg-green-50 border-green-200" 
                : "bg-green-500/10 border-green-500/20"
              : isBrazil 
                ? "bg-orange-50 border-orange-200" 
                : "bg-orange-500/10 border-orange-500/20"
          )}>
            {consent ? (
              <div className="flex items-center gap-6">
                <CheckCircle2 size={48} className={isBrazil ? "text-green-600" : "text-green-400"} />
                <div>
                  <p className={cn("text-lg font-black", isBrazil ? "text-green-800" : "text-green-200")}>Consentimento Registrado</p>
                  <p className={cn("text-sm font-medium opacity-80", isBrazil ? "text-green-700" : "text-green-300")}>Você aceitou os cookies em: {new Date(consent.timestamp).toLocaleString()}</p>
                  <p className={cn("text-[10px] uppercase font-black tracking-widest mt-2", isBrazil ? "text-green-900/40" : "text-green-400/60")}>Versão {consent.version}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <AlertCircle size={48} className={isBrazil ? "text-orange-600" : "text-orange-400"} />
                <div>
                  <p className={cn("text-lg font-black", isBrazil ? "text-orange-800" : "text-orange-200")}>Consentimento Pendente</p>
                  <p className={cn("text-sm font-medium opacity-80", isBrazil ? "text-orange-700" : "text-orange-300")}>Você ainda não configurou suas preferências de privacidade.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Categorias de Cookies */}
        <section>
          <h2 className="mt-0">Categorias de Dados</h2>
          <div className="space-y-4">
            <div className={cn(
              "flex items-center justify-between p-6 rounded-2xl border transition-all",
              isBrazil ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5"
            )}>
              <div>
                <p className={cn("font-black text-sm md:text-base mb-1", isBrazil ? "text-slate-900" : "text-white")}>🔒 Essenciais (Obrigatórios)</p>
                <p className={cn("text-xs font-medium", isBrazil ? "text-slate-500" : "text-theme-text-secondary")}>Volume, favoritos, última estação e decisão de cookies.</p>
              </div>
              <div className={cn(
                "text-[10px] font-black px-3 py-1 rounded-full border tracking-widest",
                isBrazil ? "bg-green-100 text-green-700 border-green-200" : "bg-theme-primary/20 text-theme-primary border-theme-primary/30"
              )}>ATIVO</div>
            </div>
            
            <div className={cn(
              "flex items-center justify-between p-6 rounded-2xl border transition-all",
              isBrazil ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5"
            )}>
               <div>
                 <p className={cn("font-black text-sm md:text-base mb-1", isBrazil ? "text-slate-900" : "text-white")}>📊 Funcionais (Opcionais)</p>
                 <p className={cn("text-xs font-medium", isBrazil ? "text-slate-500" : "text-theme-text-secondary")}>Lembrar escolha de não exibir banner de instalação PWA.</p>
               </div>
               <div className={cn(
                 "w-12 h-6 rounded-full relative cursor-not-allowed opacity-50",
                 isBrazil ? "bg-slate-200" : "bg-white/10"
               )}>
                  <div className={cn("absolute right-1 top-1 w-4 h-4 rounded-full", isBrazil ? "bg-slate-400" : "bg-white/20")}></div>
               </div>
            </div>
          </div>
        </section>

        {/* Ações de Dados */}
        <section>
           <h2 className="mt-0">Seus Dados e Controles</h2>
           <p className={cn(
             "text-sm mb-8 font-medium leading-relaxed max-w-2xl",
             isBrazil ? "text-slate-600" : "text-theme-text-secondary"
           )}>
             Abaixo você pode visualizar, baixar ou excluir permanentemente todas as informações que o Radio Wave Brasil salvou no seu navegador. <strong>Lembre-se:</strong> uma vez excluídos, seus favoritos não poderão ser recuperados.
           </p>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => setShowData(!showData)}
                className={cn(
                  "flex items-center justify-center gap-3 p-5 transition-all rounded-2xl font-black text-xs uppercase tracking-widest border",
                  isBrazil 
                    ? "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300" 
                    : "bg-white/5 text-white border-white/5 hover:bg-white/10"
                )}
              >
                {showData ? 'Esconder dados' : 'Ver dados'}
              </button>
              
              <button 
                onClick={handleExport}
                className={cn(
                  "flex items-center justify-center gap-3 p-5 transition-all rounded-2xl font-black text-xs uppercase tracking-widest border",
                  isBrazil
                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    : "bg-theme-secondary/10 text-theme-secondary border-theme-secondary/30 hover:bg-theme-secondary/20"
                )}
              >
                <Download size={18} />
                Exportar (JSON)
              </button>
              
              <button 
                onClick={handleRevoke}
                className={cn(
                  "flex items-center justify-center gap-3 p-5 transition-all rounded-2xl font-black text-xs uppercase tracking-widest border",
                  isBrazil
                    ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                    : "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500 hover:text-white"
                )}
              >
                Revogar Acesso
              </button>

              <button 
                onClick={handleClearAll}
                className={cn(
                  "flex items-center justify-center gap-3 p-5 transition-all rounded-2xl font-black text-xs uppercase tracking-widest border",
                  isBrazil
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white"
                )}
              >
                <Trash2 size={18} />
                Apagar tudo
              </button>
           </div>

           {showData && (
              <div className={cn(
                "mt-8 p-8 rounded-3xl overflow-hidden animate-in slide-in-from-top-4 duration-500 border",
                isBrazil ? "bg-slate-900 border-slate-800" : "bg-black/40 border-white/5"
              )}>
                 <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em]">Local Storage Inspector</span>
                    <button onClick={() => setShowData(false)} className="text-white/40 hover:text-white text-xs font-bold transition-all">Sair</button>
                 </div>
                 <pre className="text-green-400 font-mono text-xs overflow-auto max-h-[500px] leading-relaxed custom-scrollbar pr-4">
                    {JSON.stringify(allData, null, 2)}
                 </pre>
              </div>
           )}
        </section>

        {/* Direito de Titular */}
        <section className={cn(
          "p-8 md:p-12 rounded-[2rem] border transition-all",
          isBrazil ? "bg-[#009C3B]/5 border-[#009C3B]/10" : "bg-theme-primary/5 border-theme-primary/10"
        )}>
           <h2 className="mt-0 flex items-center gap-4">
              <Mail size={28} className={isBrazil ? "text-[#009C3B]" : "text-theme-primary"} />
              Exercer seus Direitos
           </h2>
           <p className={cn(
             "text-sm mb-8 leading-relaxed font-medium max-w-2xl",
             isBrazil ? "text-slate-600" : "text-theme-text-secondary"
           )}>
             Caso deseje fazer uma solicitação oficial referente aos seus dados, como portabilidade ou eliminação de logs técnicos, clique no botão abaixo para nos enviar um e-mail.
           </p>
           <a 
             href="mailto:legislativomunicipal@aol.com?subject=[LGPD] Solicitação de Direitos do Titular"
             className={cn(
               "inline-flex items-center gap-3 font-black px-10 py-5 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 group",
               isBrazil 
                 ? "bg-[#009C3B] !text-white shadow-[0_12px_32px_rgba(0,156,59,0.3)]" 
                 : "bg-theme-primary !text-white shadow-accent-glow"
             )}
           >
             <Mail size={20} className="group-hover:rotate-12 transition-transform" />
             Enviar solicitação via E-mail
           </a>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default GerenciamentoConsentimento;

