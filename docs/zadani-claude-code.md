# ZADÁNÍ PRO CLAUDE CODE — Landing page „SEVERKA 12" (mobilní klimatizace)

## Cíl a kontext
Postav prodejní landing page pro sezónní e-shop s mobilní klimatizací (import z Číny, prodej v ČR).
Cílovka: české domácnosti a malé kanceláře bez centrální klimatizace, 28–55 let, nákup řeší
impulzivně během vlny veder. Jediný cíl stránky: **objednávka / předobjednávka**.

Referenční implementace: v repu je soubor `severka-landing.html` (single-file prototyp
z Claude.ai) — použij ho jako závazný vzor copy, struktury a design systému.

## Stack a výstup
- **Fáze 1 (teď):** statická single-file `index.html` (inline CSS + vanilla JS, žádný build step).
  Optimalizace pro nasazení na Vercel/Cloudflare Pages.
- **Fáze 2 (po validaci):** migrace na Next.js 15 (App Router) + napojení na Stripe Checkout
  / GoPay pro předprodej se zálohou. Připrav strukturu tak, aby se copy dalo přenést 1:1.

## Design systém (závazné tokeny)
```css
--ink:     #0C2233;  /* text, patička */
--bg:      #F4F9FC;  /* ledové pozadí */
--surface: #FFFFFF;
--glacier: #1B7FC4;  /* primární, CTA */
--deep:    #0E5A94;  /* hover, odkazy */
--heat:    #E8622C;  /* POUZE pro „horko/problém" momenty */
--mist:    #DCEBF4;  /* dividery, karty */
```
- Typografie: display **Bricolage Grotesque** (nadpisy, čísla), body **Inter / system-ui**.
- Signature prvek: **animovaný teploměr v hero** — počítadlo padá z 32,6 °C na 23,0 °C,
  pozadí hero plynule přechází z teplého do ledového tónu. Respektuj `prefers-reduced-motion`.
- Ostatní animace minimální: jemný scroll-reveal (IntersectionObserver), nic víc.

## Struktura stránky (pořadí sekcí + finální copy je v prototypu)
1. **Sticky header** — logo SEVERKA + CTA „Objednat".
2. **Hero** — H1 „Konečně se v létě vyspíte.", sub s čísly (20 minut, −7 °C, bez montáže),
   CTA + microcopy (skladem, 48 h, 30 dní vrácení), SVG ilustrace produktu, teploměr.
3. **Trust bar** — 4 položky: doručení 48 h · 30 dní na vrácení · 2 roky záruka · CE + EPREL.
4. **Problém** (tmavá sekce, akcent --heat) — tropické noci, home office ve 32 °C.
5. **3 benefity s čísly** — −7 °C za 20 min (35 m²) · 3 Kč/hod · instalace 10 minut.
6. **Srovnávací tabulka** — ventilátor vs. SEVERKA 12 vs. split (cena, chlazení, instalace, pro koho).
7. **„Na rovinu"** — poctivé řešení 3 námitek: hlučnost (54 dB + noční režim),
   spotřeba (3 Kč/hod), hadice (těsnicí sada v hodnotě 590 Kč zdarma). Neslibuj nemožné.
8. **Recenze** — 3 testimonialy s hodnocením (po launchi nahradit reálnými z Ověřeno zákazníky).
9. **FAQ** — nativní `<details>`: okno/těsnění, kondenzát, hluk v noci, spotřeba, reklamace.
10. **Finální CTA blok** + **footer** — provozovatel (jméno, IČO), OP, reklamační řád, GDPR.

## Obrázky
- V prototypu jsou inline SVG ilustrace (produkt, okno s těsněním, ikony) — zachovej styl.
- Připrav `<picture>` sloty pro reálné fotky (hero ložnice, detail panelu, těsnicí sada) —
  WebP + AVIF, lazy-load mimo hero, explicitní width/height proti CLS.

## SEO a výkon
- Title: „Mobilní klimatizace SEVERKA 12 — ochlaďte ložnici o 7 °C bez montáže"
- Meta description ≤ 155 znaků, OG tagy, JSON-LD `Product` (cena 6 990 Kč, availability InStock).
- Lighthouse cíl: Performance ≥ 95, a11y ≥ 95. Fonty `font-display: swap`, preconnect.

## A11y a kvalita
- Viditelný keyboard focus, kontrast min. AA, alt texty, `lang="cs"`.
- Responzivní od 360 px, tabulka na mobilu horizontálně scrollovatelná.

## Co NEDĚLAT
- Žádné buzzwordy („revoluční", „nejlepší na trhu"), žádné falešné countdowny.
- Žádný framework/build ve fázi 1. Žádné cookies/tracking skripty v prototypu
  (GA4/Sklik retargeting se přidá až s cookie lištou ve fázi 2).

## Akceptační kritéria
- [ ] Jeden soubor, funguje otevřením v prohlížeči bez serveru
- [ ] Teploměr animuje jen jednou, s reduced-motion fallbackem (statická hodnota 23,0 °C)
- [ ] Všech 10 sekcí v daném pořadí, copy 1:1 z prototypu
- [ ] Lighthouse ≥ 95 / ≥ 95, validní HTML
- [ ] Po dokončení: `vercel deploy` preview a vrátit URL
