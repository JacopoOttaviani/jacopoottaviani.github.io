# Pipeline: Dove esplodono le bombe a Roma, quartiere per quartiere

Scripts and inputs that produce `../data/episodi.json` and `../data/episodi.csv`. Article texts are not stored here: `articoli_indice.json` keeps only the link, headline and date of the 297 RomaToday articles read.

1. `scrape_tags.py` collects the cards from the RomaToday topic pages (bomba, bombe, bomba-carta, esplosioni, intimidazioni, attentati, ...); `fetch_articles.py` and `follow_links.py` download the articles and the ones they link to.
2. `episodes_src.py` is the hand-checked list: one record per attack, written from the articles. Edit this file to add an episode.
3. `build_episodes.py articoli_indice.json fonti_esterne.json episodes.json` fills in the headline and date of each source (`check_ext.py` verifies links from other outlets).
4. `geocode.py episodes.json cache.json` (Nominatim, 1 request/s); `overrides.json` holds the coordinates fixed by hand, with the reason in `fonte_geo`; `ovb.py` runs the Overpass lookups (intersections, civic numbers).
5. `finalize.py episodes.json overrides.json cache.json ../data` assigns the municipio (`municipi.json`, OSM boundaries), sets the precision, checks bounds and sources, and writes JSON + CSV.

   `finalize.py` also writes the English edition (`../data/episodes-en.json|csv`, read by `../en/`) through `english.py`: the free text of each episode comes from `translations_en.json`, keyed on `date|address` (the Italian address as published), with the Italian summary it was translated from. If an episode has no entry, or its Italian summary changed, finalize stops and names it: add or update the entry (target, summary, and `address` / `date_note` when they contain Italian words). Category, precision and device come from the tables in `english.py`.

Shortcut without re-geocoding: `python3 finalize.py episodes_geocoded.json overrides.json cache.json ../data` (needs `municipi.json` in the same folder as the episodes file).
6. `make_icon.py` draws the project icon: `logo-inline.svg` for the header (animated by the page CSS) and the static `icon.svg`; the PNGs come from `sips -s format png -Z 32 icon.svg --out icon-32.png` (and `-Z 150` + `--padToHeightWidth 180 180 --padColor FFFFFF` for apple-touch-icon.png).
7. The page is in two languages that share `../app.css` and `../app.js` (strings by `<html lang>`, bump their `?v=` in `../index.html` after a change). `../en/index.html` is generated: after any edit to `../index.html` run `python3 make_en_page.py`, which swaps the Italian text for the English; it stops if a sentence it translates has changed, so update its list too. The English share image `../og-image-en.jpg` is `og-source.html?lang=en`, rendered like the Italian one.
8. The charts section above the method notes (by municipio, with its own year buttons) is drawn by `../app.js` from the episodes; its small map of the municipi reads `../municipi.json`, written by `make_municipi_svg.py` from `municipi.json` (projected SVG paths, label points and the projection used to place the episodes). Rerun it only if the boundaries change.
