import React from 'react';
import { Scale } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';

const AvisoLegal: React.FC = () => {
  return (
    <LegalPageLayout 
      title="Aviso Legal" 
      lastUpdated="06 de maio de 2026" 
      icon={Scale}
    >
      <h2>1. Identificação</h2>
      <p>
        O <strong>Radio Wave Brasil</strong> é um aplicativo web de acesso gratuito, desenvolvido por André Miranda como um projeto independente de código aberto para a comunidade brasileira.
      </p>

      <h2>2. Natureza do Serviço</h2>
      <p>
        Este site atua como um agregador e interface de reprodução para rádios que já disponibilizam suas transmissões publicamente na internet. Não somos uma emissora de rádio e não detemos direitos sobre as transmissões de áudio acessadas.
      </p>

      <h2>3. Limitação de Responsabilidade</h2>
      <p>
        Sob nenhuma circunstância o Radio Wave Brasil ou seu desenvolvedor serão responsáveis por:
      </p>
      <ul>
        <li>Indisponibilidade temporária ou definitiva de qualquer rádio.</li>
        <li>Conteúdo, opiniões, publicidades ou músicas transmitidas pelas emissoras.</li>
        <li>Interrupções do serviço devido a falhas na Radio Browser API ou provedores de internet.</li>
        <li>Qualquer dano direto ou indireto resultante do uso desta plataforma.</li>
      </ul>

      <h2>4. Propriedade da API</h2>
      <p>
        Os metadados das estações (nomes, logotipos, tags) são fornecidos via <strong>Radio Browser API</strong> (radio-browser.info), um projeto comunitário mantido por voluntários. Não garantimos a precisão absoluta das informações contidas na API.
      </p>

      <h2>5. Links para Terceiros</h2>
      <p>
        Fornecemos links para redes sociais e sites oficiais das rádios. Não temos controle sobre esses sites e não nos responsabilizamos por suas políticas de privacidade ou conteúdos.
      </p>

      <h2>6. Direitos Autorais</h2>
      <p>
        Se você é o proprietário de uma rádio listada e deseja que ela seja removida, por favor, entre em contato via <a href="mailto:legislativomunicipal@aol.com">legislativomunicipal@aol.com</a> ou solicite a remoção diretamente na Radio Browser API.
      </p>

      <h2>7. Contato</h2>
      <p>
        Canal oficial para questões legais: <a href="mailto:legislativomunicipal@aol.com">legislativomunicipal@aol.com</a>.
      </p>
    </LegalPageLayout>
  );
};

export default AvisoLegal;
