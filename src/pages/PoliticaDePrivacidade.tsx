import React from 'react';
import { Shield } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';

const PoliticaDePrivacidade: React.FC = () => {
  return (
    <LegalPageLayout 
      title="Política de Privacidade" 
      lastUpdated="06 de maio de 2026" 
      icon={Shield}
    >
      <h2>1. Introdução</h2>
      <p>
        A sua privacidade é uma prioridade para o <strong>Radio Wave Brasil</strong>. Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações ao utilizar nossa plataforma. Nosso compromisso é com a transparência e o respeito à Lei Geral de Proteção de Dados Pessoais (LGPD).
      </p>

      <h2>2. Identificação do Controlador</h2>
      <p>
        O <strong>Radio Wave Brasil</strong> é um projeto independente desenvolvido por:
      </p>
      <ul>
        <li><strong>Responsável:</strong> André Miranda</li>
        <li><strong>Contato DPO / Canal de Privacidade:</strong> <a href="mailto:legislativomunicipal@aol.com">legislativomunicipal@aol.com</a></li>
      </ul>

      <h2>3. Quais Dados Coletamos</h2>
      <p>
        Operamos com o princípio de minimização de dados. Coletamos apenas o estritamente necessário para o funcionamento do app:
      </p>
      <ul>
        <li>
          <strong>Dados salvos localmente (localStorage):</strong> Armazenamos sua última estação ouvida, volume preferido, configuração de mudo, rádios favoritas e sua decisão sobre o banner de instalação PWA e consentimento de cookies. 
          <em>Estes dados permanecem exclusivamente no seu dispositivo e não são transmitidos para nossos servidores.</em>
        </li>
        <li>
          <strong>Dados de Uso (Radio Browser API):</strong> Nosso app consome a API pública do <code>radio-browser.info</code> para listar as estações. Não enviamos dados pessoais identificáveis a este serviço externo.
        </li>
        <li>
          <strong>Logs de Servidor:</strong> Nosso servidor proxy de áudio pode registrar temporariamente o endereço IP e a URL solicitada por fins estritamente técnicos de segurança e roteamento.
        </li>
      </ul>

      <h2>4. Finalidade do Tratamento</h2>
      <p>Utilizamos os dados coletados para:</p>
      <ul>
        <li>Personalizar sua experiência (lembrar suas rádios favoritas e volume).</li>
        <li>Garantir a execução do serviço de streaming de rádio solicitado.</li>
        <li>Manutenção técnica e segurança do sistema.</li>
      </ul>

      <h2>5. Base Legal (Art. 7º LGPD)</h2>
      <p>O tratamento de dados no Radio Wave Brasil baseia-se em:</p>
      <ul>
        <li><strong>Consentimento (Art. 7º, I):</strong> Para o uso de cookies não-essenciais e personalização.</li>
        <li><strong>Execução de Contrato/Serviço (Art. 7º, V):</strong> Para fornecer as funcionalidades básicas solicitadas por você.</li>
        <li><strong>Legítimo Interesse (Art. 7º, IX):</strong> Para logs técnicos mínimos necessários de segurança.</li>
      </ul>

      <h2>6. Direitos do Titular (Art. 18 LGPD)</h2>
      <p>Você possui direitos garantidos por lei, incluindo:</p>
      <ul>
        <li>Confirmação da existência de tratamento e acesso aos dados.</li>
        <li>Correção de dados incompletos ou inexatos.</li>
        <li>Eliminação de dados tratados com seu consentimento.</li>
        <li>Revogação do consentimento a qualquer momento.</li>
      </ul>
      <p>
        Para exercer seus direitos, envie um e-mail para <a href="mailto:legislativomunicipal@aol.com">legislativomunicipal@aol.com</a>. Responderemos em até 15 dias úteis.
      </p>

      <h2>7. Segurança da Informação</h2>
      <p>
        Implementamos medidas técnicas como comunicação via HTTPS e isolamento de <code>localStorage</code> para proteger seus dados. Como não possuímos contas de usuário com senhas no servidor, o risco de vazamento de credenciais é minimizado.
      </p>

      <h2>8. Alterações nesta Política</h2>
      <p>
        Esta política pode ser atualizada periodicamente. Se houver mudanças significativas, você será avisado através de um comunicado em nossa página principal.
      </p>
    </LegalPageLayout>
  );
};

export default PoliticaDePrivacidade;
