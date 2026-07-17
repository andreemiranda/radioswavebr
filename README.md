# 📻 Radio Wave Brasil

Player de rádios brasileiras ao vivo. Ouça Sertanejo, Pagode, MPB, Rock, News e muito mais.

🌐 **Acesse:** https://radioswave.netlify.app/

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- TanStack Query (React Query)
- API: [Radio Browser](https://www.radio-browser.info/) (pública, sem chave)

## Desenvolvimento local

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:5173
```

## Deploy

O projeto é deployado automaticamente no Netlify a cada push na branch `main`.

- **Produção:** https://radioswave.netlify.app/
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **API proxy:** `/api/*` → `https://de1.api.radio-browser.info/json/*`
