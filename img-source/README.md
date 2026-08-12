# img-source — zdrojové PNG

Sem patří **originální PNG z generátoru** (nekomprimované, co nejvyšší rozlišení).
Konverzi na AVIF + WebP + JPEG ve třech šířkách dělá `npm run images`
(`scripts/build-images.mjs`) — výstup jde do `img/` a přepíše zástupné obrázky.

Pojmenuj soubory přesně takto:

| Soubor | Obsah | Kam se na stránce dostane |
| --- | --- | --- |
| `loznice-noc.png` | ložnice v noci — postel, lampička, jednotka u okna | hero (3:2 desktop, 4:5 mobil) |
| `packshot.png` | jednotka + hadice do okna na světlém pozadí | finální CTA blok, `og:image`, JSON-LD |
| `srovnani-split.png` | split ventilátor vs. klimatizace (červená/modrá) | sekce Srovnání, nad tabulkou |
| `panel-sleep.png` | detail ovládacího panelu, prst, SLEEP MODE | „Na rovinu“, karta 1 |
| `tesnici-sada.png` | těsnicí sada v okně (zip, hadice) | „Na rovinu“, karta 3 |
| `instalace-10min.png` | muž s jednotkou u krabice | sekce Benefity, pod kartami |
| `podkrovi-office.png` | podkrovní home office (žena u notebooku) | sekce Problém, pod kartami |

Ořez řeší build skript (`fit: cover`, střed) — dodej obrázky tak, aby snesly
ořez na uvedené poměry, hlavní motiv drž blíž středu. Hero se navíc ořezává
na 4:5 pro mobil, takže musí fungovat i na výšku.

```bash
npm install
npm run images:check   # vypíše, které zdroje chybí
npm run images         # zkonvertuje vše do img/
```

Dokud tu zdroje nejsou, `img/` obsahuje **zástupné obrázky** s přerušovaným
rámečkem a názvem souboru. Slouží jen k tomu, aby stránka měla správné rozměry
a nulový CLS — do produkce se nesmí nasadit.

## Než se fotky nasadí

Na fotce ovládacího panelu je vytištěno **„1330W“**, zatímco stránka uvádí
příkon 1,0 kW a provoz 3 Kč/hod. Rozpor je popsaný v `README.md` v sekci
„Otevřený konflikt“ — musí se vyřešit dřív, než se stránka nasadí.
