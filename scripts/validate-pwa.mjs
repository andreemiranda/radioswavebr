import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const INDEX_HTML = path.join(process.cwd(), 'index.html');

const requiredFiles = [
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
  'favicon-96x96.png',
  'apple-touch-icon.png',
  'icon-192x192.png',
  'icon-192x192-maskable.png',
  'icon-256x256.png',
  'icon-384x384.png',
  'icon-512x512.png',
  'icon-512x512-maskable.png',
  'mstile-70x70.png',
  'mstile-144x144.png',
  'mstile-150x150.png',
  'mstile-310x310.png',
  'mstile-310x150.png',
  'favicon.ico',
  'manifest.json',
  'browserconfig.xml',
  'robots.txt',
  'sitemap.xml',
  'og-image-1200x630.png'
];

const socialFiles = [
  'social/og-facebook.png',
  'social/og-instagram-square.png',
  'social/og-instagram-stories.png',
  'social/og-x-twitter.png',
  'social/og-whatsapp.png'
];

async function validate() {
  console.log('🔍 Starting PWA Validation...\n');
  let failures = 0;

  const checkFile = (filePath) => {
    const fullPath = path.join(PUBLIC_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`✅ ${filePath} (${(stats.size / 1024).toFixed(1)} KB)`);
      return true;
    } else {
      console.log(`❌ ${filePath} NOT FOUND`);
      failures++;
      return false;
    }
  };

  console.log('--- Core Files ---');
  requiredFiles.forEach(checkFile);

  console.log('\n--- Social Assets ---');
  socialFiles.forEach(checkFile);

  console.log('\n--- Manifest Check ---');
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'manifest.json'), 'utf-8'));
    console.log(`✅ manifest.json is valid JSON (id: ${manifest.id})`);
  } catch (e) {
    console.log('❌ manifest.json is INVALID JSON');
    failures++;
  }

  console.log('\n--- index.html Meta Check ---');
  const html = fs.readFileSync(INDEX_HTML, 'utf-8');
  const requiredMetas = [
    'og:image',
    'twitter:card',
    'manifest.json',
    'canonical',
    'theme-color',
    'apple-mobile-web-app-capable'
  ];

  requiredMetas.forEach(meta => {
    if (html.includes(meta)) {
      console.log(`✅ index.html contains ${meta}`);
    } else {
      console.log(`❌ index.html MISSING ${meta}`);
      failures++;
    }
  });

  if (failures === 0) {
    console.log('\n✨ PWA Validation PASSED! All assets are ready for production.');
  } else {
    console.log(`\n⚠️ PWA Validation FAILED with ${failures} errors.`);
    process.exit(1);
  }
}

validate().catch(console.error);
