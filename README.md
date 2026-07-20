# 📻 Radio Wave Brasil

Player de rádios brasileiras ao vivo. Ouça Sertanejo, Pagode, MPB, Rock, Gospel, Funk, Notícias e muito mais.

🌐 **Demo:** https://radioswave.netlify.app/

## Stack

- React 19 + TypeScript
- Vite 6 + Tailwind CSS v4
- TanStack Query (React Query)
- Express (servidor + proxy de áudio)
- PWA (Workbox, instalável em Android e Desktop)
- API: [Radio Browser](https://www.radio-browser.info/) — pública, sem chave de API

## Requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 18 LTS (recomendado: 20 LTS ou 22 LTS) |
| npm | 9+ |

---

## Desenvolvimento local

```bash
# 1. Clone e instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento (Express + Vite HMR)
npm run dev
# Acesse: http://localhost:5000
```

---

## Build de produção

```bash
# Gera a pasta dist/
npm run build

# Executa a aplicação compilada localmente
npm run start
# Acesse: http://localhost:5000
```

---

## Variáveis de ambiente

O projeto usa três arquivos `.env`:

| Arquivo | Quando carregado |
|---|---|
| `.env` | Sempre (valores padrão) |
| `.env.development` | Apenas em `npm run dev` |
| `.env.production` | Apenas em `npm run build` |

### Variáveis disponíveis

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_SITE_URL` | URL raiz do domínio de produção (sem barra final). Embutida no build (canonical, Open Graph, JSON-LD). | `https://radioswavebr.netlify.app` |
| `VITE_API_BASE_URL` | Prefixo da API — deixe vazio para usar o proxy Express em `/api` | `` |
| `VITE_AUDIO_PROXY_URL` | Endpoint do proxy de áudio (mescla HTTP→HTTPS) | `/api/proxy-audio` |
| `PORT` | Porta do servidor Express | `5000` |

**Para deploy em domínio próprio:** defina `VITE_SITE_URL` com a URL correta **antes** de rodar `npm run build`, para que as metatags de SEO/OG sejam geradas com o domínio certo.

```bash
VITE_SITE_URL=https://meusite.com.br npm run build
```

---

## Deploy no Replit

1. O workflow **"Start application"** roda `npm run dev` (`tsx server.ts`) na porta 5000.
2. Nenhuma variável de ambiente secreta é necessária — a API Radio Browser é pública.
3. Para publicação: use **Replit Deploy** (autoscale já configurado no `.replit`).

---

## Deploy em outros servidores Node.js

O servidor Express (`server.ts`) funciona em qualquer ambiente compatível:

### PM2 / VPS / cPanel Node.js

```bash
npm install
npm run build
# PM2:
pm2 start "npm run start" --name radio-wave-brasil
# Ou diretamente:
npm run start
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "start"]
```

### Nginx como reverse proxy

```nginx
server {
    listen 80;
    server_name meusite.com.br;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Railway / Render / DigitalOcean App Platform

- **Build command:** `npm run build`
- **Start command:** `npm run start`
- **Port:** `5000` (ou a variável `PORT` do ambiente)

---

## Estrutura do projeto

```
radio-wave-brasil/
├── src/
│   ├── components/       # AudioPlayer, RadioCard, FilterPanel, etc.
│   ├── context/          # PlayerContext (playback), ThemeContext
│   ├── pages/            # Home, páginas legais, Offline
│   ├── services/         # radioService (cliente HTTP)
│   ├── data/             # customStations (lista curada local)
│   ├── lib/              # utils, storage
│   └── types/            # Interfaces TypeScript
├── public/               # Assets estáticos (favicons, PWA icons, ads.txt)
├── server.ts             # Express: proxy API + proxy áudio + static/Vite
├── vite.config.ts        # Build, PWA, chunks
├── index.html            # HTML com metatags SEO/OG (usa %VITE_SITE_URL%)
└── dist/                 # Build de produção (gerado por npm run build)
```

---

## Monetização (ads.txt)

O arquivo `public/ads.txt` está pré-configurado como placeholder. Quando o Publisher ID do Google AdSense for obtido, basta descomentar e preencher a linha correspondente — sem nenhuma alteração estrutural necessária.

---

## Problemas comuns

| Problema | Solução |
|---|---|
| Erro de CORS ao chamar a API | O proxy Express em `/api` já resolve isso. Não chame a API diretamente do frontend em produção. |
| Rádio não toca (Sem Sinal) | O player tenta reconectar automaticamente até 5 vezes e avança para a próxima estação. |
| PWA não atualiza | O Service Worker usa `autoUpdate` — a atualização ocorre silenciosamente na próxima visita. |
| OG/SEO com URL errada | Defina `VITE_SITE_URL` antes do build (ver seção "Variáveis de ambiente"). |
| Port já em uso | Defina `PORT=outra_porta` antes de `npm run start`. |
