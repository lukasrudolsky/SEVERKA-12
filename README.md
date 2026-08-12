# SEVERKA 12 — prodejní landing page

Statická single-file landing page pro sezónní prodej mobilní klimatizace SEVERKA 12
(12 000 BTU, 6 990 Kč). Fáze 1 podle zadání v [`docs/zadani-claude-code.md`](docs/zadani-claude-code.md),
copy a design systém vychází z prototypu [`docs/severka-landing-prototyp.html`](docs/severka-landing-prototyp.html).

## Obsah repa

| Soubor | Účel |
| --- | --- |
| `index.html` | Kompletní landing page — inline CSS + vanilla JS, žádný build step |
| `img/` | Vygenerované fotky (AVIF + WebP + JPEG, 3 šířky) — **nikdy needituj ručně** |
| `img-source/` | Zdrojová PNG + návod na pojmenování |
| `scripts/build-images.mjs` | Konverze zdrojů do `img/` (`npm run images`) |
| `vercel.json` | Cache a bezpečnostní hlavičky pro nasazení na Vercel |
| `docs/` | Zadání a původní prototyp (referenční, nenasazuje se) |

## Fotky

```bash
npm install
npm run images:check   # co chybí v img-source/
npm run images         # konverze do img/
```

Skript ořezává na poměr podle umístění (hero 3:2 na desktopu a 4:5 na mobilu,
srovnání 2:1, karty 16:10, širokoúhlé 16:9, packshot 1:1 + og 1200×630),
generuje AVIF + WebP + JPEG v kvalitě 80 ve třech šířkách a u hero snižuje
kvalitu AVIF, dokud se nevejde pod 120 kB kvůli LCP. Kde je hlavní motiv mimo
střed, posouvá ořezové okno položka `focus` v tabulce `IMAGES`.

Chybějící zdroj se nahradí označeným zástupným obrázkem správných rozměrů, aby
stránka fungovala a měla CLS = 0.

> **Zdroje jsou zatím jen kopie z chatu** (1408 × 768 px, u těsnicí sady
> 1024 × 1024). Build proto u největších variant nezvětšuje a soubor vygeneruje
> v původní velikosti — vypíše to jako varování. Pro ostrý provoz dodej
> originály z generátoru v plném rozlišení a spusť `npm run images` znovu.

## Hero video

Hero fotku překrývá `img/hero-loznice.webm` (455 kB) s fallbackem
`img/hero-loznice.mp4` (671 kB) — místnost se v něm ochlazuje z teplé do modré,
stejně jako teploměr vedle. Proto se **přehraje jen jednou a zůstane stát na
chladném konci**; smyčka by skákala zpátky do horka a popírala pointu stránky.

Element se vkládá z JS a jen tam, kde dává smysl — ne na mobilu (< 861 px),
ne při `prefers-reduced-motion`, ne v úsporném režimu dat, nikdy bez JS.
V těch případech se nestahuje ani byte a zůstane fotka. Než se rozjede
přehrávání, je vidět fotka pod ním, takže není co blikat.

Překódování zdroje (`npm run images` se videa netýká):

```bash
ffmpeg -i zdroj.mp4 -an -c:v libx264 -profile:v high -crf 27 -preset slow \
  -pix_fmt yuv420p -movflags +faststart img/hero-loznice.mp4
ffmpeg -i zdroj.mp4 -an -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 \
  -deadline good -cpu-used 2 -pix_fmt yuv420p img/hero-loznice.webm
```

`-an` je podstatné: zvuková stopa je u autoplay videa zbytečná zátěž a některé
prohlížeče kvůli ní autoplay zablokují.

## Spuštění a nasazení

Stránka nepotřebuje server ani build — stačí otevřít `index.html` v prohlížeči.

```bash
# lokální náhled (kvůli reálným hlavičkám a fontům)
python3 -m http.server 8000

# nasazení
vercel deploy          # preview
vercel deploy --prod   # produkce
```

## Naměřené výsledky

Lighthouse 13 (headless Chromium, lokální server, mobile i desktop preset):

| Kategorie | Mobile | Desktop |
| --- | --- | --- |
| Performance | 100 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 96 * | 96 * |
| SEO | 100 | 100 |

\* Jediný odečet je „errors in console“ — v testovacím sandboxu není dostupná síť pro
`fonts.googleapis.com`. Po nasazení se fonty načtou a audit projde čistý.

LCP 1,1 s (mobile) / 0,3 s (desktop) · **CLS 0** · 69 kB přenesených dat na
mobilu, 616 kB na desktopu včetně hero videa. axe-core: **0 porušení** na
1280 px i 360 px (rozbalené FAQ, odkryté sekce). Hero AVIF má 63 kB, limit
120 kB hlídá build skript.

## Rozhodnutí a odchylky od zadání

- **Barva CTA.** Zadání označuje `--glacier` (#1B7FC4) jako barvu CTA, ale bílý text na ní
  má kontrast 4,30 : 1 — pod hranicí AA (4,5 : 1) pro běžný text. Výplň tlačítek a zvýrazněné
  hlavičky tabulky proto používají `--deep` (#0E5A94, 7,22 : 1), hover `--deeper` (#0A4A7A).
  `--glacier` zůstává akcentní barvou (čísla benefitů, ikony, focus ring), kde jde o velký
  text nebo grafiku a limit je 3 : 1.
- Ze stejného důvodu je zlatá u hvězdiček ztmavena na `--star` (#A15C00) a čísla v tmavé
  sekci „Problém“ používají světlejší odstín `--heat` (#F5804F, 5,4 : 1 na tmavém pozadí).
  `--heat` se dál používá jen pro „horko/problém“ momenty.
- **Bez JS a s `prefers-reduced-motion`** stránka rovnou zobrazuje vychlazený stav
  (23,0 °C, ledové pozadí); teploměr i scroll-reveal jsou progresivní vylepšení, obsah není
  nikdy schovaný za JavaScriptem. Animace teploměru proběhne jen jednou.
- Teploměr je pro odečítačky `aria-hidden` (jinak by měnící se číslo hlásil při každém
  snímku) a doplňuje ho jedna statická věta pro screen readery.
- JSON-LD obsahuje `Product` + `Offer` (6 990 Kč, InStock, doprava zdarma, 30 dní na vrácení).
  `aggregateRating` a `review` **záměrně chybí** — recenze na stránce jsou zatím zástupné
  a strukturovaná data s vymyšleným hodnocením jsou porušení pravidel Google.

## Otevřený konflikt: 1330 W vs. 1,0 kW

Na fotce ovládacího panelu (`panel-sleep`) je vytištěno **„1330W“**, stránka ale
na třech místech uvádí **příkon 1,0 kW a provoz 3 Kč/hod** (benefit, karta
„Spotřeba? Spočítaná.“, FAQ „Kolik reálně zaplatím za elektřinu“). To si
odporuje a po potvrzení reálných parametrů zboží by šlo o klamavý údaj.
Stránka se nesmí nasadit, dokud se nevybere jedna z variant:

- **A — opravit fotku:** přegenerovat panel bez textu „1330W“. V kódu se nemění nic.
- **B — opravit copy:** pokud má produkt reálně ~1,3 kW, globálně přepsat
  „3 Kč/hod“ → „4 Kč/hod“, „Příkon 1,0 kW“ → „Příkon 1,3 kW“, noc 24 Kč → 32 Kč
  (hero benefit, karta „Spotřeba? Spočítaná.“, FAQ).

## TODO před ostrým spuštěním

- [ ] Odstranit vodoznak generátoru (✦ vpravo dole) ze všech fotek i z hero videa
- [ ] Doplnit provozovatele v patičce (jméno, IČO, adresa) a odkazy na OP / reklamační řád / GDPR
- [ ] Nahradit zástupné recenze reálnými (Ověřeno zákazníky) — pak lze doplnit `aggregateRating`
- [ ] Nahradit `canonical` a absolutní URL v `og:image` / JSON-LD reálnou doménou
- [ ] Dodat originály fotek v plném rozlišení do `img-source/` a spustit `npm run images`
- [ ] Vyřešit konflikt 1330 W / 1,0 kW (viz výše) — bez toho stránku nenasazovat
- [ ] Ověřit reálný stav skladu v microcopy („Skladem 14 ks“)

## Fáze 2

Migrace na Next.js 15 (App Router) + Stripe Checkout / GoPay. Struktura je připravená
na přenos 1 : 1 — sekce jsou samostatné bloky s vlastním `aria-labelledby`, copy se dá
vytáhnout přímo do komponent. Napojení pokladny: `#order` v `index.html` (dnes prototypový
`alert`). GA4 / Sklik retargeting se přidá až s cookie lištou, prototyp neobsahuje
žádné tracking skripty ani cookies.
