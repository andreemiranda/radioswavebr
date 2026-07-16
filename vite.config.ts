import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
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
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            query: ['@tanstack/react-query'],
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
