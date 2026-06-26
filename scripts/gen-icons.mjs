// One-off generator for the PWA / home-screen PNG icons. Rasterises the Pinpoint
// map-pin mark (white pin on the brand dark square) into the sizes browsers and
// app launchers expect. Re-run with `node scripts/gen-icons.mjs` if the mark changes.
//
//   public/icon-192.png            standard PWA icon
//   public/icon-512.png            standard PWA icon (large)
//   public/icon-512-maskable.png   Android adaptive icon (extra safe-zone padding)
//   app/apple-icon.png             iOS home screen (Next file convention auto-links it)

import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DARK = "#141412";
const PIN = "#F7F6F3";

// The pin path from public/icon.svg, drawn on a 24x24 viewBox.
const pinPath =
  '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>' +
  '<circle cx="12" cy="9" r="2.5" fill="none"/>';

// Build a full-bleed square SVG with the pin centred at `scale` of the canvas.
function iconSvg(size, scale) {
  const pin = size * scale;
  const offset = (size - pin) / 2;
  // Stroke is in the 24-unit pin space; the group transform scales it to fit.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${DARK}"/>
    <g transform="translate(${offset},${offset}) scale(${pin / 24})" fill="${PIN}" stroke="${PIN}" stroke-width="2.2" stroke-linejoin="round">
      ${pinPath}
    </g>
  </svg>`;
}

async function render(size, scale, outPath) {
  await sharp(Buffer.from(iconSvg(size, scale))).png().toFile(join(root, outPath));
  console.log("wrote", outPath);
}

await render(192, 0.62, "public/icon-192.png");
await render(512, 0.62, "public/icon-512.png");
// Maskable: smaller pin so it survives Android's circular/rounded mask crop.
await render(512, 0.5, "public/icon-512-maskable.png");
await render(180, 0.62, "app/apple-icon.png");
