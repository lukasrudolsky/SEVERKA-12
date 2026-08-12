# SEVERKA 12 — prodejní landing page

Statická single-file landing page pro sezónní prodej mobilní klimatizace SEVERKA 12
(12 000 BTU, 6 990 Kč). Fáze 1 podle zadání v [`docs/zadani-claude-code.md`](docs/zadani-claude-code.md),
copy a design systém vychází z prototypu [`docs/severka-landing-prototyp.html`](docs/severka-landing-prototyp.html).

## Obsah repa

| Soubor | Účel |
| --- | --- |
| `index.html` | Kompletní landing page — inline CSS + vanilla JS, žádný build step |
| `vercel.json` | Cache a bezpečnostní hlavičky pro nasazení na Vercel |
| `docs/` | Zadání a původní prototyp (referenční, nenasazuje se) |

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

axe-core: **0 porušení** na 1280 px i 360 px (rozbalené FAQ, odkryté sekce).

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

## TODO před ostrým spuštěním

- [ ] Doplnit provozovatele v patičce (jméno, IČO, adresa) a odkazy na OP / reklamační řád / GDPR
- [ ] Nahradit zástupné recenze reálnými (Ověřeno zákazníky) — pak lze doplnit `aggregateRating`
- [ ] Nahradit `og:image` a `canonical` reálnou doménou; nahrát OG obrázek 1200 × 630
- [ ] Reálné fotky do připravených `<picture>` slotů (hledej `FOTO SLOT` v `index.html`):
      AVIF + WebP + JPG fallback, explicitní `width`/`height`, `loading="lazy"` mimo hero
- [ ] Ověřit reálný stav skladu v microcopy („Skladem 14 ks“)

## Fáze 2

Migrace na Next.js 15 (App Router) + Stripe Checkout / GoPay. Struktura je připravená
na přenos 1 : 1 — sekce jsou samostatné bloky s vlastním `aria-labelledby`, copy se dá
vytáhnout přímo do komponent. Napojení pokladny: `#order` v `index.html` (dnes prototypový
`alert`). GA4 / Sklik retargeting se přidá až s cookie lištou, prototyp neobsahuje
žádné tracking skripty ani cookies.
