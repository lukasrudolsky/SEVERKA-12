/**
 * Konverze fotek pro landing page SEVERKA 12.
 *
 *   node scripts/build-images.mjs          # zkonvertuje, co je v img-source/
 *   node scripts/build-images.mjs --check  # jen vypíše, co chybí
 *
 * Vstup:  img-source/<zdroj>.png  (PNG z generátoru, viz img-source/README.md)
 * Výstup: img/<název>-<šířka>.{avif,webp,jpg}  (kvalita 80, ořez na střed)
 *
 * Když zdroj chybí, vygeneruje se zástupný obrázek stejných rozměrů, aby
 * stránka fungovala a neměla CLS. Zástupné obrázky jsou vizuálně označené —
 * nesmí se nasadit do produkce.
 */
import sharp from 'sharp';
import { mkdir, access, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const SRC = 'img-source';
const OUT = 'img';
const Q = 80;
const HERO_AVIF_LIMIT = 120 * 1024; // akceptační kritérium: hero AVIF ≤ 120 kB

/**
 * focus = kam se posune ořezové okno, 0–1 (0,5 = na střed). Používá se jen
 * tam, kde je hlavní motiv mimo střed — např. mobilní ořez hera na výšku
 * musí udržet v záběru jednotku u okna, ne prázdnou postel.
 * @type {{src:string,name:string,ratio:[number,number],widths:number[],focus?:[number,number],note:string}[]}
 */
const IMAGES = [
  { src: 'hero-loznice',     name: 'hero-loznice',       ratio: [3, 2],  widths: [1600, 1200, 800], note: 'hero, desktop ořez 3:2' },
  { src: 'hero-loznice',     name: 'hero-loznice-4x5',   ratio: [4, 5],  widths: [1200, 800], focus: [0.62, 0.5], note: 'hero, mobilní art direction 4:5' },
  { src: 'packshot',         name: 'packshot',           ratio: [1, 1],  widths: [1200, 800], focus: [0.42, 0.5], note: 'finální CTA blok' },
  { src: 'srovnani-split',   name: 'srovnani-split',     ratio: [2, 1],  widths: [1600, 1200, 800], note: 'sekce Srovnání, nad tabulkou' },
  { src: 'panel-sleep',      name: 'panel-sleep',        ratio: [16, 10], widths: [1200, 800],      note: 'Na rovinu, karta 1' },
  { src: 'tesnici-sada',     name: 'tesnici-sada',       ratio: [16, 10], widths: [1200, 800],      note: 'Na rovinu, karta 3' },
  { src: 'instalace-10min',  name: 'instalace-10min',    ratio: [16, 9], widths: [1600, 1200, 800], note: 'sekce Benefity, pod kartami' },
  { src: 'podkrovi-office',  name: 'podkrovi-office',    ratio: [16, 9], widths: [1600, 1200, 800], note: 'sekce Problém, pod kartami' },
];

// og:image je samostatný ořez 1200×630 z packshotu
const OG = { src: 'packshot', name: 'packshot-og', width: 1200, height: 630, focus: [0.42, 0.5] };

/** Ořez na daný poměr s volitelným posunem okna, pak zmenšení na cílovou šířku. */
async function crop(file, w, h, [rw, rh], focus = [0.5, 0.5]) {
  const { width: sw, height: sh } = await sharp(file).metadata();
  let cw = sw;
  let ch = Math.round((cw * rh) / rw);
  if (ch > sh) { ch = sh; cw = Math.round((ch * rw) / rh); }
  const left = Math.round((sw - cw) * focus[0]);
  const top = Math.round((sh - ch) * focus[1]);
  return sharp(file).extract({ left, top, width: cw, height: ch }).resize(w, h);
}

const checkOnly = process.argv.includes('--check');
const height = (w, [rw, rh]) => Math.round((w * rh) / rw);
const sourceFile = (src) => path.join(SRC, `${src}.png`);

/** Zástupný obrázek — světlé pozadí, přerušovaný rámeček, název souboru. */
function placeholder(w, h, label) {
  const fs = Math.max(13, Math.round(w / 34));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="#DCEBF4"/>
    <rect x="${w * 0.02}" y="${h * 0.03}" width="${w * 0.96}" height="${h * 0.94}" rx="${w * 0.02}"
          fill="none" stroke="#7FA8C4" stroke-width="${Math.max(2, w / 300)}" stroke-dasharray="${w / 40} ${w / 55}"/>
    <text x="50%" y="47%" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif"
          font-size="${fs}" font-weight="700" fill="#0E5A94">${label}</text>
    <text x="50%" y="47%" dy="${fs * 1.6}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif"
          font-size="${fs * 0.8}" fill="#4A6577">zástupný obrázek — nahradit reálnou fotkou</text>
  </svg>`;
  return sharp(Buffer.from(svg));
}

async function encode(pipeline, base, isHero) {
  const jobs = [
    ['webp', (p) => p.webp({ quality: Q })],
    ['jpg', (p) => p.jpeg({ quality: Q, mozjpeg: true })],
  ];
  for (const [ext, enc] of jobs) await enc(pipeline.clone()).toFile(`${base}.${ext}`);

  // AVIF: u hero snižujeme kvalitu, dokud se nevejdeme do limitu pro LCP
  let q = Q;
  for (;;) {
    await pipeline.clone().avif({ quality: q }).toFile(`${base}.avif`);
    const size = statSync(`${base}.avif`).size;
    if (!isHero || size <= HERO_AVIF_LIMIT || q <= 50) {
      if (isHero && size > HERO_AVIF_LIMIT) {
        console.warn(`  ! ${base}.avif má ${(size / 1024).toFixed(0)} kB (limit 120 kB) i při kvalitě ${q}`);
      }
      return;
    }
    q -= 5;
  }
}

async function main() {
  const missing = [];
  for (const img of IMAGES) if (!existsSync(sourceFile(img.src))) missing.push(img.src);

  if (checkOnly) {
    const unique = [...new Set(IMAGES.map((i) => i.src))];
    for (const s of unique) console.log(`${existsSync(sourceFile(s)) ? 'OK     ' : 'CHYBÍ  '} ${sourceFile(s)}`);
    process.exit(missing.length ? 1 : 0);
  }

  await mkdir(OUT, { recursive: true });
  for (const img of IMAGES) {
    const has = existsSync(sourceFile(img.src));
    for (const w of img.widths) {
      const h = height(w, img.ratio);
      const base = path.join(OUT, `${img.name}-${w}`);
      const pipeline = has
        ? await crop(sourceFile(img.src), w, h, img.ratio, img.focus)
        : placeholder(w, h, `${img.name}-${w}`);
      await encode(pipeline, base, img.name.startsWith('hero-'));
    }
    console.log(`${has ? '✓' : '·'} ${img.name.padEnd(20)} ${img.widths.join(', ')} px — ${img.note}${has ? '' : ' (zástupné)'}`);
  }

  const ogBase = path.join(OUT, OG.name);
  const ogPipe = existsSync(sourceFile(OG.src))
    ? await crop(sourceFile(OG.src), OG.width, OG.height, [40, 21], OG.focus)
    : placeholder(OG.width, OG.height, 'packshot-og 1200×630');
  await ogPipe.jpeg({ quality: Q, mozjpeg: true }).toFile(`${ogBase}.jpg`);
  console.log(`${existsSync(sourceFile(OG.src)) ? '✓' : '·'} packshot-og           1200×630 px — og:image / twitter:image`);

  if (missing.length) {
    console.log(`\nChybí zdroje v ${SRC}/: ${[...new Set(missing)].join(', ')}`);
    console.log('Vygenerovaly se zástupné obrázky. Do produkce je nenasazuj.');
  }
}

await main();
