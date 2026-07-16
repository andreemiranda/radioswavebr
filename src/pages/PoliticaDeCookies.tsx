import React from 'react';
import { Cookie, AlertTriangle } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

const PoliticaDeCookies: React.FC = () => {
  const { theme } = useTheme();
  const isBrazil = theme === 'brazil';

  return (
    <LegalPageLayout 
      title="Política de Cookies" 
      lastUpdated="06 de maio de 2026" 
      icon={Cookie}
    >
      <h2>1. O que são Cookies?</h2>
      <p>
        Cookies são pequenos arquivos de texto ou chaves de dados salvos no seu navegador para "lembrar" suas preferências e ações. No <strong>Radio Wave Brasil</strong>, utilizamos a tecnologia de <code>localStorage</code>, que funciona de forma similar aos cookies, permitindo que suas escolhas persistam mesmo após fechar o navegador.
      </p>

      <h2>2. Por que utilizamos?</h2>
      <p>
        Utilizamos estas tecnologias para garantir que você não precise reconfigurar o app toda vez que acessá-lo. Sem eles, seus favoritos seriam perdidos e seu volume voltaria ao padrão a cada carregamento.
      </p>

      <h2>3. Dados que Armazenamos localmente</h2>
      <p>Abaixo listamos todas as chaves de dados que o Radio Wave Brasil salva no seu dispositivo:</p>

      <div className="overflow-x-auto my-8 border rounded-2xl overflow-hidden shadow-sm">
        <table className={cn(
          "min-w-full border-collapse",
          isBrazil ? "bg-white" : "bg-black/20"
        )}>
          <thead>
            <tr className={isBrazil ? "bg-[#F8FAFC]" : "bg-white/5"}>
              <th className={cn("px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest", isBrazil ? "border-b border-slate-200 text-slate-400" : "border-b border-white/5 text-white/40")}>Chave</th>
              <th className={cn("px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest", isBrazil ? "border-b border-slate-200 text-slate-400" : "border-b border-white/5 text-white/40")}>Finalidade</th>
              <th className={cn("px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-center", isBrazil ? "border-b border-slate-200 text-slate-400" : "border-b border-white/5 text-white/40")}>Essencial?</th>
            </tr>
          </thead>
          <tbody className={isBrazil ? "divide-y divide-slate-100" : "divide-y divide-white/5"}>
            {[
              { key: 'RadioWaveBR_lastStation', purpose: 'Lembra a última rádio que você ouviu.', essential: true },
              { key: 'RadioWaveBR_volume', purpose: 'Armazena o seu nível de volume preferido.', essential: true },
              { key: 'RadioWaveBR_muted', purpose: 'Lembra se você deixou o som no mudo.', essential: true },
              { key: 'RadioWaveBR_favorites', purpose: 'Lista de todas as estações que você favoritou.', essential: true },
              { key: 'RadioWaveBR_cookieConsent', purpose: 'Registra se você aceitou ou recusou esta política.', essential: true },
              { key: 'RadioWaveBR_pwaInstallDismissed', purpose: 'Evita mostrar o banner de instalação toda hora.', essential: false },
            ].map((row, idx) => (
              <tr key={idx} className={isBrazil ? "hover:bg-slate-50/50 transition-colors" : "hover:bg-white/5 transition-colors"}>
                <td className="px-6 py-4 text-sm font-mono"><code className={isBrazil ? "text-blue-700 bg-blue-50 px-1 rounded" : "text-blue-400"}>{row.key}</code></td>
                <td className={cn("px-6 py-4 text-sm font-medium", isBrazil ? "text-slate-600" : "text-white/70")}>{row.purpose}</td>
                <td className="px-6 py-4 text-sm font-black text-center">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] tracking-widest uppercase",
                    row.essential
                      ? isBrazil ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400"
                      : isBrazil ? "bg-slate-100 text-slate-500" : "bg-white/10 text-white/40"
                  )}>
                    {row.essential ? 'Sim' : 'Não'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={cn(
        "p-6 rounded-2xl flex items-start gap-4 border",
        isBrazil ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-theme-accent/10 border-theme-accent/20"
      )}>
        <AlertTriangle className={cn("shrink-0", isBrazil ? "text-amber-500" : "text-theme-accent")} size={24} />
        <p className="text-sm font-medium leading-relaxed m-0">
          <strong>Importante:</strong> Nenhum destes dados é enviado para nossos servidores. Eles permanecem armazenados localmente e exclusivamente no seu próprio navegador.
        </p>
      </div>

      <h2>4. Cookies de Terceiros</h2>
      <p>
        Não utilizamos cookies de rastreamento de terceiros (como Google Analytics ou Facebook Pixel). No entanto, serviços de infraestrutura como o <strong>Netlify</strong> (onde o app está hospedado) podem definir cookies técnicos de segurança inerentes à plataforma.
      </p>

      <h2>5. Como Gerenciar?</h2>
      <p>
        Você pode controlar e apagar seus dados a qualquer momento através da nossa <Link to="/gerenciamento-consentimento" className={isBrazil ? "text-[#009C3B] font-black underline underline-offset-4" : ""}>Central de Consentimento</Link> ou limpando manualmente o histórico/cache do seu navegador.
      </p>
    </LegalPageLayout>
  );
};

export default PoliticaDeCookies;

