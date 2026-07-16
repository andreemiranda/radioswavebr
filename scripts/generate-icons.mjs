import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function pngBuffersToIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;
  let offset = headerSize + dirSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(numImages, 4);

  const dirEntries = [];
  const imageBuffers = [];

  for (const png of pngBuffers) {
    const size = png.width >= 256 ? 0 : png.width;
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.data.length;
    dirEntries.push(entry);
    imageBuffers.push(png.data);
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

async function toIco(buffers) {
  const pngs = await Promise.all(
    buffers.map(async (buf) => {
      const meta = await sharp(buf).metadata();
      return { width: meta.width, height: meta.height, data: buf };
    })
  );
  return pngBuffersToIco(pngs);
}

const ICON_MASTER = path.join(process.cwd(), 'public', 'icon-master.svg');
const ICON_MASKABLE = path.join(process.cwd(), 'public', 'icon-master-maskable.svg');
const OUTPUT_DIR = path.join(process.cwd(), 'public');

const sizes = [
  { name: 'favicon-16x16.png', size: 16, source: ICON_MASTER },
  { name: 'favicon-32x32.png', size: 32, source: ICON_MASTER },
  { name: 'favicon-48x48.png', size: 48, source: ICON_MASTER },
  { name: 'favicon-96x96.png', size: 96, source: ICON_MASTER },
  { name: 'apple-touch-icon.png', size: 180, source: ICON_MASTER },
  { name: 'icon-192x192.png', size: 192, source: ICON_MASTER },
  { name: 'icon-192x192-maskable.png', size: 192, source: ICON_MASKABLE },
  { name: 'icon-256x256.png', size: 256, source: ICON_MASTER },
  { name: 'icon-384x384.png', size: 384, source: ICON_MASTER },
  { name: 'icon-512x512.png', size: 512, source: ICON_MASTER },
  { name: 'icon-512x512-maskable.png', size: 512, source: ICON_MASKABLE },
  { name: 'mstile-70x70.png', size: 70, source: ICON_MASTER },
  { name: 'mstile-144x144.png', size: 144, source: ICON_MASTER },
  { name: 'mstile-150x150.png', size: 150, source: ICON_MASTER },
  { name: 'mstile-310x310.png', size: 310, source: ICON_MASTER }
];

// Specials
const wideSizes = [
  { name: 'mstile-310x150.png', width: 310, height: 150, source: ICON_MASTER }
];

const splashScreens = [
  { name: 'apple-splash-750x1334.png', width: 750, height: 1334 },
  { name: 'apple-splash-1170x2532.png', width: 1170, height: 2532 },
  { name: 'apple-splash-1179x2556.png', width: 1179, height: 2556 },
  { name: 'apple-splash-1284x2778.png', width: 1284, height: 2778 },
  { name: 'apple-splash-1290x2796.png', width: 1290, height: 2796 },
  { name: 'apple-splash-1620x2160.png', width: 1620, height: 2160 },
  { name: 'apple-splash-2048x2732.png', width: 2048, height: 2732 }
];

async function generate() {
  console.log('🚀 Starting icon generation...');

  // Standard squares
  for (const item of sizes) {
    await sharp(item.source)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(OUTPUT_DIR, item.name));
    console.log(`✅ Generated ${item.name}`);
  }

  // Wide Tile
  for (const item of wideSizes) {
    await sharp(item.source)
      .resize(item.width, item.height, { fit: 'contain', background: { r: 11, g: 15, b: 25, alpha: 1 } })
      .png()
      .toFile(path.join(OUTPUT_DIR, item.name));
    console.log(`✅ Generated ${item.name}`);
  }

  // Apple Splash screens
  for (const splash of splashScreens) {
    const iconSize = Math.floor(Math.min(splash.width, splash.height) * 0.4);
    const iconBuffer = await sharp(ICON_MASTER)
      .resize(iconSize, iconSize)
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: { r: 11, g: 15, b: 25, alpha: 1 }
      }
    })
    .composite([{ input: iconBuffer }])
    .png()
    .toFile(path.join(OUTPUT_DIR, splash.name));
    console.log(`✅ Generated ${splash.name}`);
  }

  // Favicon.ico
  const icoSizes = [16, 32, 48];
  const buffers = await Promise.all(
    icoSizes.map(size => sharp(ICON_MASTER).resize(size, size).png().toBuffer())
  );
  const icoFile = await toIco(buffers);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.ico'), icoFile);
  console.log('✅ Generated favicon.ico');

  // OG Image 1200x630 for main SEO
  const OG_SVG = path.join(OUTPUT_DIR, 'og-image.svg');
  if (fs.existsSync(OG_SVG)) {
    await sharp(OG_SVG)
      .resize(1200, 630)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'og-image-1200x630.png'));
    
    // Also generate a copy as og-image.png for compatibility
    await sharp(OG_SVG)
      .resize(1200, 630)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'og-image.png'));
      
    console.log('✅ Generated og-image-1200x630.png and og-image.png from SVG source');
  } else {
    await sharp(ICON_MASTER)
      .resize(400, 400)
      .extend({
        top: 115, bottom: 115, left: 400, right: 400,
        background: { r: 11, g: 15, b: 25, alpha: 1 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'og-image-1200x630.png'));
    console.log('✅ Generated placeholder og-image-1200x630.png');
  }

  console.log('✨ All icons generated successfully!');
}

generate().catch(console.error);
