import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { CUSTOM_STATIONS } from './src/data/customStations';

// ── Sitemap Generator Plugin ──────────────────────────────────────────────────
// Runs only during `vite build` (apply:'build'). Generates dist/sitemap.xml
// with all pages, images, and every registered radio station. Also writes
// dist/robots.txt with the correct Sitemap: URL based on VITE_SITE_URL.
function generateSitemapPlugin() {
  return {
    name: 'generate-sitemap',
    apply: 'build' as const,
    closeBundle() {
      const siteUrl = (process.env.VITE_SITE_URL || 'https://radioswave.netlify.app').replace(/\/$/, '');
      const today = new Date().toISOString().split('T')[0];

      const esc = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      // ── Pages ──────────────────────────────────────────────────────────────
      const pages = [
        { path: '/',                          priority: '1.0', changefreq: 'daily'  },
        { path: '/politica-de-privacidade',   priority: '0.3', changefreq: 'yearly' },
        { path: '/termos-de-uso',             priority: '0.3', changefreq: 'yearly' },
        { path: '/politica-de-cookies',       priority: '0.3', changefreq: 'yearly' },
        { path: '/aviso-legal',               priority: '0.3', changefreq: 'yearly' },
        { path: '/gerenciamento-consentimento', priority: '0.2', changefreq: 'yearly' },
      ];

      // ── Images (OG, PWA icons, favicon, splash screens) ───────────────────
      const siteImages = [
        { loc: '/og-image-1200x630.png', title: 'Radio Wave Brasil — player de rádios brasileiras ao vivo',
          caption: 'Ouça as melhores rádios do Brasil ao vivo. Sertanejo, Pagode, MPB, Rock, Gospel e muito mais.' },
        { loc: '/og-image.png',          title: 'Radio Wave Brasil - Open Graph Image',
          caption: 'Player de rádio online gratuito' },
        { loc: '/logo.png',              title: 'Radio Wave Brasil - Logotipo',
          caption: 'Logotipo do Radio Wave Brasil' },
        { loc: '/icon-512x512.png',      title: 'Radio Wave Brasil - Ícone PWA 512x512',
          caption: 'Ícone do Progressive Web App' },
        { loc: '/icon-192x192.png',      title: 'Radio Wave Brasil - Ícone PWA 192x192',
          caption: 'Ícone do aplicativo' },
        { loc: '/icon-192x192-maskable.png', title: 'Radio Wave Brasil - Ícone Maskable 192',
          caption: 'Ícone adaptável para Android' },
        { loc: '/icon-512x512-maskable.png', title: 'Radio Wave Brasil - Ícone Maskable 512',
          caption: 'Ícone adaptável grande para Android' },
        { loc: '/apple-touch-icon.png',  title: 'Radio Wave Brasil - Apple Touch Icon',
          caption: 'Ícone para dispositivos Apple' },
        { loc: '/android-chrome-192x192.png', title: 'Radio Wave Brasil - Android Chrome 192',
          caption: 'Ícone para Android Chrome' },
        { loc: '/android-chrome-512x512.png', title: 'Radio Wave Brasil - Android Chrome 512',
          caption: 'Ícone grande para Android Chrome' },
        { loc: '/favicon-32x32.png',     title: 'Radio Wave Brasil - Favicon 32x32',
          caption: 'Favicon do site 32x32' },
        { loc: '/favicon-16x16.png',     title: 'Radio Wave Brasil - Favicon 16x16',
          caption: 'Favicon do site 16x16' },
        { loc: '/mstile-150x150.png',    title: 'Radio Wave Brasil - MS Tile',
          caption: 'Tile para Windows/Edge' },
      ];

      const homeImagesXml = siteImages
        .map(img => `
    <image:image>
      <image:loc>${esc(siteUrl + img.loc)}</image:loc>
      <image:title>${esc(img.title)}</image:title>
      <image:caption>${esc(img.caption)}</image:caption>
    </image:image>`)
        .join('');

      const pagesXml = pages
        .map(p => {
          const isHome = p.path === '/';
          return `  <url>
    <loc>${esc(siteUrl + p.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${isHome ? `
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${esc(siteUrl + '/')}"/>` + homeImagesXml : ''}
  </url>`;
        })
        .join('\n');

      // ── Radio stations ─────────────────────────────────────────────────────
      // Every registered station gets its own <url> entry pointing to the home
      // page (there are no individual station pages yet). Metadata is preserved
      // as XML comments so future per-station URLs can be migrated automatically.
      const seen = new Set<string>();
      const stations = CUSTOM_STATIONS.filter(s => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });

      const radiosXml = stations
        .map(s => {
          const origin = s.id.startsWith('custom-') ? 'cadastro-manual' : 'api';
          const tags   = (s.tags || []).join(',');
          return `  <url>
    <loc>${esc(siteUrl + '/')}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <!-- emissora="${esc(s.name)}" estado="${esc(s.state || 'Brasil')}" pais="${esc(s.country || 'Brazil')}" tags="${esc(tags)}" origem="${origin}" -->
  </url>`;
        })
        .join('\n');

      // ── Write sitemap.xml ─────────────────────────────────────────────────
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="
    http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
    http://www.google.com/schemas/sitemap-image/1.1
    http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">

${pagesXml}

${radiosXml}
</urlset>`;

      fs.writeFileSync('dist/sitemap.xml', xml, 'utf-8');

      // ── Write robots.txt with correct Sitemap URL ─────────────────────────
      const robotsTxt = `User-agent: *
Allow: /

# Bloquear assets desnecessários para crawlers
Disallow: /src/
Disallow: /.env
Disallow: /node_modules/

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Cache hints
Crawl-delay: 1
`;
      fs.writeFileSync('dist/robots.txt', robotsTxt, 'utf-8');

      console.log(`\n✓ sitemap.xml  → dist/sitemap.xml  (${pages.length} páginas + ${stations.length} emissoras)`);
      console.log(`✓ robots.txt   → dist/robots.txt   (Sitemap: ${siteUrl}/sitemap.xml)\n`);
    },
  };
}

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      generateSitemapPlugin(),
      VitePWA({
        // ── Estratégia de registro do Service Worker ──────────────────────
        registerType: 'autoUpdate',
        // autoUpdate: atualiza o SW silenciosamente quando há nova versão
        // sem precisar de prompt de confirmação do usuário

        // ── Inclui o SW no build ──────────────────────────────────────────
        injectRegister: 'auto',

        // ── Dev: habilita SW em desenvolvimento para testes ───────────────
        // devOptions: {
        //   enabled: true,
        //   type: 'module',
        // },

        // ── Workbox: configuração de cache ────────────────────────────────
        workbox: {
          // Arquivos pré-cacheados no install do SW (shell do app)
          globPatterns: [
            '**/*.{js,css,html}',
            '**/*.{svg,png,ico,webp}',
          ],
          // Aumenta o limite para permitir cache das splash screens do iOS (até ~4MB)
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,

          // Estratégias de cache por tipo de recurso
          runtimeCaching: [
            // ── Google Fonts (CSS) ────────────────────────────────────────
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            // ── Google Fonts (arquivos de fonte) ──────────────────────────
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // ── Radio Browser API ─────────────────────────────────────────
            // NetworkFirst: tenta a rede, cai no cache se offline
            {
              urlPattern: /^https:\/\/.*\.api\.radio-browser\.info\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'radio-browser-api',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 2 }, // 2h
                cacheableResponse: { statuses: [0, 200] },
                networkTimeoutSeconds: 10,
              },
            },
            // ── Imagens de estações de rádio (favicons externos) ──────────
            {
              urlPattern: /^https?:\/\/.*\.(png|jpg|jpeg|svg|ico|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'radio-station-images',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 dias
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            // ── Streams de áudio: NUNCA cachear ──────────────────────────
            // Streams ao vivo não podem ser cacheados (são infinitos e dinâmicos)
            {
              urlPattern: /\.(mp3|aac|ogg|m3u8|m3u|pls|asx|wma)(\?.*)?$/i,
              handler: 'NetworkOnly', // sempre da rede, nunca do cache
              options: { cacheName: 'audio-streams' },
            },
          ],

          // Limpa caches antigos de versões anteriores do SW
          cleanupOutdatedCaches: true,

          // Ignora parâmetros de URL ao verificar o cache
          ignoreURLParametersMatching: [/^utm_/, /^fbclid/, /^ref/],

          // Permite navegação offline (SPA fallback)
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
        },

        // ── Web App Manifest ──────────────────────────────────────────────
        manifest: {
          name: 'Radio Wave Brasil',
          short_name: 'RadioWave',
          description: 'Ouça rádios do Brasil ao vivo com streaming rápido, moderno e otimizado. Progressive Web App premium.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          display_override: ['standalone', 'window-controls-overlay'],
          background_color: '#0B0F19',
          theme_color: '#00D4FF',
          lang: 'pt-BR',
          dir: 'ltr',
          orientation: 'portrait-primary',
          categories: ['music', 'entertainment', 'audio', 'lifestyle'],
          
          // ── Ícones ───────────────────────────────────────────────────────
          icons: [
            {
              src: '/logo.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/logo.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],

          // ── Screenshots (PWA Install UI) ─────────────────────────────────
          screenshots: [
            {
              src: '/og-image.png',
              sizes: '1200x630',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Radio Wave Brasil — player de rádios brasileiras'
            }
          ],

          // ── Shortcuts ────────────────────────────────────────────────────
          shortcuts: [
            {
              name: 'Populares',
              short_name: 'Populares',
              description: 'Ouvir as rádios mais populares',
              url: '/?tab=top',
              icons: [{ src: '/logo.png', sizes: '192x192' }]
            },
            {
              name: 'Favoritos',
              short_name: 'Favoritos',
              description: 'Acessar meus favoritos',
              url: '/?tab=favorites',
              icons: [{ src: '/logo.png', sizes: '192x192' }]
            }
          ],
        },
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      // Raise the warning threshold — the HLS/DASH libs are large but are
      // split into their own chunks below so they cache independently.
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Split heavy audio libraries into their own chunks so browsers can
          // cache them independently and they don't bloat the critical path.
          // Even though they're statically imported (eager), the separate files
          // can be pre-cached by the service worker and downloaded in parallel.
          manualChunks(id) {
            if (id.includes('node_modules/hls.js'))    return 'hls';
            if (id.includes('node_modules/dashjs'))    return 'dash';
            if (id.includes('node_modules/react-dom')) return 'react-dom';
            if (id.includes('node_modules/react/'))    return 'react';
            if (id.includes('@tanstack/react-query'))  return 'query';
            if (id.includes('node_modules/axios'))     return 'axios';
          },
        },
      },
    },

    server: {
      port: 5000,
      host: '0.0.0.0',
      allowedHosts: true,
      watch: {
        ignored: [
          '**/.local/**',
          '**/.cache/**',
          '**/.agents/**',
          '**/.git/**',
          '**/node_modules/**',
          '**/attached_assets/**',
        ],
      },
      hmr: process.env.DISABLE_HMR !== 'true'
        ? {
            clientPort: 443,
            protocol: 'wss',
            host: process.env.REPLIT_DEV_DOMAIN,
          }
        : false,
      proxy: {
        '/api': {
          target: 'https://de1.api.radio-browser.info/json',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: true,
        },
      },
    },
  };
});
