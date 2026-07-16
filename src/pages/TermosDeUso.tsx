import React from 'react';
import { FileText } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';

const TermosDeUso: React.FC = () => {
  return (
    <LegalPageLayout 
      title="Termos de Uso" 
      lastUpdated="06 de maio de 2026" 
      icon={FileText}
    >
      <h2>1. Aceitação dos Termos</h2>
      <p>
        Ao acessar e utilizar o <strong>Radio Wave Brasil</strong>, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deve utilizar o serviço.
      </p>

      <h2>2. Descrição do Serviço</h2>
      <p>
        O Radio Wave Brasil é um agregador gratuito de rádios online brasileiras, desenvolvido sem fins lucrativos. O serviço utiliza a API pública <code>Radio Browser</code> para listar e fornecer acesso a transmissões públicas de rádio via internet.
      </p>

      <h2>3. Uso Permitido</h2>
      <p>
        O serviço deve ser utilizado apenas para fins pessoais e não comerciais. É expressamente proibido:
      </p>
      <ul>
        <li>Realizar extração automatizada de dados (scraping).</li>
        <li>Tentar burlar medidas de segurança ou engenharia reversa do código.</li>
        <li>Utilizar o app para transmitir conteúdo ilegal ou prejudicial.</li>
      </ul>

      <h2>4. Conteúdo de Terceiros</h2>
      <p>
        As transmissões de áudio (streams) acessadas são de propriedade e responsabilidade total das respectivas emissoras de rádio. O Radio Wave Brasil não hospeda, não controla e não se responsabiliza pelo conteúdo transmitido, publicidades ou opiniões expressas pelas rádios.
      </p>

      <h2>5. Propriedade Intelectual</h2>
      <p>
        O código-fonte deste aplicativo é de código aberto e está disponível no GitHub. No entanto, a identidade visual, o logotipo, o nome "Radio Wave Brasil" e o design da interface são de propriedade de <strong>André Miranda</strong>.
      </p>

      <h2>6. Isenção de Responsabilidade</h2>
      <p>
        O serviço é fornecido "como está", sem garantias de qualquer tipo. Não garantimos que a transmissão de qualquer rádio será ininterrupta ou livre de erros. Não nos responsabilizamos por quaisquer danos decorrentes do uso ou da impossibilidade de uso do serviço.
      </p>

      <h2>7. Modificações</h2>
      <p>
        Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas através da interface do aplicativo com 15 dias de antecedência.
      </p>

      <h2>8. Lei Aplicável</h2>
      <p>
        Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro de domicílio do desenvolvedor.
      </p>

      <h2>9. Contato</h2>
      <p>
        Para dúvidas sobre estes termos, entre em contato via <a href="mailto:legislativomunicipal@aol.com">legislativomunicipal@aol.com</a>.
      </p>
    </LegalPageLayout>
  );
};

export default TermosDeUso;
