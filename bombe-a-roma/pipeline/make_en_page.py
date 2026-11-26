"""Writes the English page ../en/index.html from the Italian ../index.html: same markup, scripts and styles (../app.css and
../app.js are shared), with the Italian text swapped for the English below. Run it after every change to index.html;
it stops if a sentence it translates is no longer in the Italian page, so the two never drift apart silently.
usage: python3 make_en_page.py"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, "..", "index.html"), encoding="utf-8").read()
OG_EN = "og-image-en.jpg?v=2026-11-25a"

R = [
    ('<html lang="it">', '<html lang="en">'),
    ('<title>Dove esplodono le bombe a Roma, quartiere per quartiere</title>', '<title>Where bombs go off in Rome, neighbourhood by neighbourhood</title>'),
    ('content="Mappa delle bombe carta e degli ordigni esplosi a Roma dal 2023 a oggi, geolocalizzati dagli articoli di cronaca, con le fonti di ogni episodio."',
     'content="Map of the paper bombs and homemade explosive devices set off in Rome since 2023, geolocated from news reports, with the sources for every episode."'),
    ('<link rel="canonical" href="https://jacopoottaviani.com/bombe-a-roma/">', '<link rel="canonical" href="https://jacopoottaviani.com/bombe-a-roma/en/">'),
    ('<meta property="og:title" content="Dove esplodono le bombe a Roma, quartiere per quartiere">', '<meta property="og:title" content="Where bombs go off in Rome, neighbourhood by neighbourhood">'),
    ('<meta property="og:description" content="Bombe carta e ordigni esplosi in città, luogo per luogo, con le fonti di ogni episodio.">',
     '<meta property="og:description" content="Paper bombs and explosive devices set off in the city, place by place, with the sources for every episode.">'),
    ('<meta property="og:url" content="https://jacopoottaviani.com/bombe-a-roma/">', '<meta property="og:url" content="https://jacopoottaviani.com/bombe-a-roma/en/">'),
    ('<meta property="og:locale" content="it_IT">\n<meta property="og:locale:alternate" content="en_GB">', '<meta property="og:locale" content="en_GB">\n<meta property="og:locale:alternate" content="it_IT">'),
    ('content="https://jacopoottaviani.com/bombe-a-roma/og-image.jpg?v=', 'content="https://jacopoottaviani.com/bombe-a-roma/' + OG_EN + '" data-it-v="', 2),
    ('content="Una bomba carta disegnata con il Colosseo sopra, il titolo «Dove esplodono le bombe a Roma, quartiere per quartiere» e un grafico degli episodi per anno: 8 nel 2023, 8 nel 2024, 20 nel 2025, 34 nel 2026."',
     'content="A paper bomb drawn with the Colosseum on it, the title “Where bombs go off in Rome, neighbourhood by neighbourhood” and a chart of episodes per year: 8 in 2023, 8 in 2024, 20 in 2025, 34 in 2026."'),
    ('href="icon.svg"', 'href="../icon.svg"'), ('href="icon-32.png"', 'href="../icon-32.png"'), ('href="apple-touch-icon.png"', 'href="../apple-touch-icon.png"'),
    ('href="app.css?v=', 'href="../app.css?v='), ('src="app.js?v=', 'src="../app.js?v='),
    # menu bar
    ('text=Dove%20esplodono%20le%20bombe%20a%20Roma%2C%20quartiere%20per%20quartiere&amp;url=https%3A%2F%2Fjacopoottaviani.com%2Fbombe-a-roma%2F&amp;',
     'text=Where%20bombs%20go%20off%20in%20Rome%2C%20neighbourhood%20by%20neighbourhood&amp;url=https%3A%2F%2Fjacopoottaviani.com%2Fbombe-a-roma%2Fen%2F&amp;'),
    ('aria-label="Condividi su X"', 'aria-label="Share on X"'), ('<span>Condividi su X</span>', '<span>Share on X</span>'),
    ('aria-label="Offrimi un caffè su Ko-fi"', 'aria-label="Buy me a coffee on Ko-fi"'), ('<span>Offrimi un caffè</span>', '<span>Buy me a coffee</span>', 2),
    ('<div class="bar-lang" role="group" aria-label="Lingua">', '<div class="bar-lang" role="group" aria-label="Language">'),
    ('<a href="./" hreflang="it" lang="it" aria-current="page" aria-label="Italiano">', '<a href="../" hreflang="it" lang="it" aria-label="Italiano">'),
    ('<a href="en/" hreflang="en" lang="en" aria-label="English">', '<a href="./" hreflang="en" lang="en" aria-current="page" aria-label="English">'),
    ('aria-label="Tema scuro" title="Tema scuro"', 'aria-label="Dark theme" title="Dark theme"'),
    # header
    ('aria-label="Icona del progetto: una bomba carta di carta da pacchi fasciata col nastro, con un piccolo Colosseo disegnato sopra e la miccia accesa"',
     'aria-label="Project icon: a paper bomb of brown parcel paper bound with tape, with a small Colosseum drawn on it and its fuse lit"'),
    ('<h1>Dove esplodono le bombe a Roma, <span class="h1-sub">quartiere per quartiere</span></h1>', '<h1>Where bombs go off in Rome, <span class="h1-sub">neighbourhood by neighbourhood</span></h1>'),
    ('<span>episodi</span>', '<span>episodes</span>'),
    ('<p class="press"><span>Ne hanno parlato</span>', '<p class="press"><span>Featured in</span>'),
    # map, filters, list
    ('aria-label="Mappa degli episodi. L\'elenco a fianco riporta gli stessi episodi in forma di testo."', 'aria-label="Map of the episodes. The list beside it gives the same episodes as text."'),
    ('</span>episodi vicini: clic per ingrandire</span>', '</span>episodes close together: click to zoom in</span>'),
    ('</i>in provincia di Roma</span>', '</i>in the province of Rome</span>'),
    ('aria-label="Filtri"', 'aria-label="Filters"'), ('aria-label="Periodi rapidi"', 'aria-label="Quick periods"'),
    ('aria-label="Riproduci gli episodi mese per mese"', 'aria-label="Play the episodes month by month"'),
    ('aria-label="Inizio del periodo"', 'aria-label="Start of the period"'), ('aria-label="Fine del periodo"', 'aria-label="End of the period"'),
    ('>Cosa è stato colpito</p>', '>What was hit</p>'),
    ('aria-label="Elenco degli episodi"', 'aria-label="List of episodes"'), ('<span>dal più recente</span>', '<span>most recent first</span>'),
    # further reading (the headlines stay in Italian, marked lang="it"; the Camera card's label is ours, so it is translated)
    ('<h2 id="rd-title">Approfondimenti</h2>', '<h2 id="rd-title">Further reading<span class="rd-lang">in Italian</span></h2>'),
    ('<span class="rd-t">Audizione dei presidenti dei Municipi VI e VII</span>', '<span class="rd-t">Hearing of the presidents of Municipi VI and VII</span>'),
    ('>17 novembre 2026</time>', '>17 November 2026</time>'),
    ('>12 novembre 2026</time>', '>12 November 2026</time>'), ('>4 novembre 2026</time>', '>4 November 2026</time>'),
    ('>2 novembre 2026</time>', '>2 November 2026</time>'),
    # method
    ("<h2>Cosa c'è sulla mappa</h2>", "<h2>What's on the map</h2>"),
    ('<p>Bombe carta, grossi petardi e ordigni artigianali fatti esplodere contro un bersaglio a Roma, Ostia e Acilia comprese, dal 1° gennaio 2023 al <span id="upd">24 novembre 2026</span>.</p>',
     '<p>Bombe carta (paper bombs: explosive powder packed in paper and tape), large firecrackers and homemade explosive devices set off against a target in Rome, Ostia and Acilia included, from 1 January 2023 to <span id="upd">24 November 2026</span>.</p>'),
    ("<p>Il pulsante «Provincia» sulla mappa aggiunge gli episodi negli altri comuni della provincia di Roma, raccolti con lo stesso criterio e segnati con un quadrato.</p>",
     "<p>The “Province” button on the map adds the episodes in the rest of the province of Rome, gathered on the same basis and marked with a square.</p>"),
    ("<p>Non tutti gli ordigni hanno la stessa matrice: l'esplosione del marzo 2026 nel casale del Parco degli Acquedotti, per esempio, è un episodio di matrice anarchica. Secondo gli inquirenti, i due anarchici morti stavano preparando l'ordigno.</p>",
     "<p>Not every device has the same origin: the March 2026 explosion in the abandoned farmhouse in the Parco degli Acquedotti, for example, is linked to anarchists. According to investigators, the two anarchists who died were assembling the device.</p>"),
    ("<p>La mappa raccoglie solo gli episodi raccontati dalla stampa. Quelli mai finiti in un articolo mancano.</p>",
     "<p>The map only covers episodes reported in the press. Those that never made it into an article are missing.</p>"),
    ('<p>Se vuoi segnalare un evento da aggiungere alla mappa o migliorare le informazioni presenti sul sito, contattami su <a href="https://jacopoottaviani.com/it/#contact">jacopoottaviani.com</a>.</p>',
     '<p>To report an incident to add to the map, or to help improve the information on this site, get in touch at <a href="https://jacopoottaviani.com/#contact">jacopoottaviani.com</a>.</p>'),
    ("</svg>L'autore</h2>", "</svg>The author</h2>"),
    ("<p><strong>Jacopo Ottaviani</strong> è un data journalist e informatico italiano. I suoi lavori sono usciti, tra gli altri, su The Guardian, Der Spiegel ed El País. Scrive di AI e giornalismo per il Reuters Institute.</p>",
     "<p><strong>Jacopo Ottaviani</strong> is an Italian data journalist and computer scientist. His work has appeared in The Guardian, Der Spiegel and El País, among others. He writes about AI and journalism for the Reuters Institute.</p>"),
    ("<p>Questa mappa è un suo lavoro di data journalism: episodi presi dalla cronaca, verificati sugli articoli, messi sulla mappa e pubblicati come dati aperti.</p>",
     "<p>This map is one of his data journalism projects: episodes taken from the news, checked against the articles, mapped and published as open data.</p>"),
    ('>Altri progetti su jacopoottaviani.com →</a>', '>More projects at jacopoottaviani.com →</a>'),
    ("<h2>Come sono stati localizzati</h2>", "<h2>How they were located</h2>"),
    ("<p>Ogni indirizzo viene dall'articolo ed è stato geocodificato con <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a>.</p>",
     '<p>Each address comes from the article and was geocoded with <a href="https://www.openstreetmap.org/">OpenStreetMap</a>.</p>'),
    ("<p>La scheda dice quanto è preciso il punto: al <strong>civico</strong>, all'<strong>incrocio</strong>, sul <strong>luogo</strong> indicato, <strong>sulla via</strong> quando il numero manca nell'articolo o in OpenStreetMap (a Roma succede spesso), <strong>stimato</strong> tra i civici vicini sulla Casilina, o nella <strong>zona</strong> quando la via non c'è. Per le <strong>abitazioni private</strong> il punto resta sulla via, senza civico.</p>",
     "<p>The card says how precise the point is: at the <strong>street number</strong>, at the <strong>junction</strong>, at the <strong>place</strong> named, <strong>on the street</strong> when the number is missing from the article or from OpenStreetMap (common in Rome), <strong>estimated</strong> between nearby street numbers on the Casilina, or in the <strong>area</strong> when no street is given. For <strong>private homes</strong> the point stays on the street, without a number.</p>"),
    ("<p>Moventi e piste sono quelli riportati dalle fonti, attribuiti come ipotesi degli investigatori.</p>",
     "<p>Motives and leads are those reported by the sources, attributed as investigators' hypotheses.</p>"),
    ("<h2>Fonti e dati</h2>", "<h2>Sources and data</h2>"),
    ("<p>Testate citate nelle schede: 7colli, AGI, Agenzia Nova, Baraonda News, Canale 10, Castelli Notizie, Civonline, Dissapore, Domani, Fiumicino Online, Il Caffè, Il Clandestino, Il Faro online, Il Fatto Quotidiano, Il Messaggero, Il Post, Il Quotidiano del Lazio, Internazionale, LaPresse, Open, QN Quotidiano.net, Quotidiano La Voce, RomaToday, Tiburno.tv. Ogni scheda riporta titolo, data e link di ciascun articolo usato.</p>",
     "<p>Outlets cited in the cards: 7colli, AGI, Agenzia Nova, Baraonda News, Canale 10, Castelli Notizie, Civonline, Dissapore, Domani, Fiumicino Online, Il Caffè, Il Clandestino, Il Faro online, Il Fatto Quotidiano, Il Messaggero, Il Post, Il Quotidiano del Lazio, Internazionale, LaPresse, Open, QN Quotidiano.net, Quotidiano La Voce, RomaToday, Tiburno.tv. Each card gives the headline, date and link of every article used. The articles are in Italian; the summaries on this page are translations.</p>"),
    ("<p>Gli episodi sono stati cercati nelle pagine per argomento di RomaToday («bombe», «esplosioni», «intimidazioni», «attentati») e negli articoli collegati, poi confrontati con le altre testate e con ricerche web per periodo e quartiere. Per la provincia anche negli archivi delle testate locali, dal litorale ai Castelli alla Tiburtina.</p>",
     "<p>The episodes were found through RomaToday's topic pages (“bombe”, “esplosioni”, “intimidazioni”, “attentati”) and the articles linked from them, then checked against the other outlets and against web searches by period and neighbourhood. For the province, also through the archives of local outlets, from the coast to the Castelli Romani and the Tiburtina.</p>"),
    ('<a href="data/episodi.json" download>Dati JSON</a><a href="data/episodi.csv" download>Dati CSV</a><a href="data/provincia.json" download>Provincia JSON</a><a href="data/provincia.csv" download>Provincia CSV</a>',
     '<a href="../data/episodes-en.json" download>JSON data</a><a href="../data/episodes-en.csv" download>CSV data</a><a href="../data/provincia-en.json" download>Province JSON</a><a href="../data/provincia-en.csv" download>Province CSV</a>'),
    # charts by municipio and neighbourhood (above the method notes)
    ('<h2 id="ch-title">Per municipio e quartiere</h2>', '<h2 id="ch-title">By municipio and neighbourhood</h2>'),
    ('aria-label="Filtra i grafici per anno"', 'aria-label="Filter the charts by year"'),
    ('<h3>I municipi</h3>', '<h3>The municipi</h3>'),
    ('<p class="ch-note">Il grigio segue il numero di episodi; ogni punto è un episodio.</p>', '<p class="ch-note">The grey follows the number of episodes; each dot is an episode.</p>'),
    ('<h3>Episodi per municipio</h3>', '<h3>Episodes by municipio</h3>'),
    ('<p class="ch-note">Tutti e 15 i municipi. La scala resta la stessa per ogni anno.</p>', '<p class="ch-note">All 15 municipi. The scale stays the same for every year.</p>'),
    ('<h3>Quartieri con almeno due episodi</h3>', '<h3>Neighbourhoods with at least two episodes</h3>'),
    ('<p class="ch-note" id="ch-q-note">Il nome del quartiere è quello delle cronache; accanto, il municipio.</p>', '<p class="ch-note" id="ch-q-note">Neighbourhood names are those used in the news reports; beside each, its municipio.</p>'),
    ('<p class="ch-foot">I conteggi sono assoluti, non per abitante.</p>', '<p class="ch-foot">The counts are absolute, not per resident.</p>'),
    # footer
    ('<p class="note">Base cartografica OpenFreeMap, © OpenMapTiles, dati © OpenStreetMap contributors · Episodi dagli articoli citati · Aggiornata al 24 novembre 2026</p>',
     '<p class="note">Base map OpenFreeMap, © OpenMapTiles, data © OpenStreetMap contributors · Episodes from the articles cited · Updated 24 November 2026</p>'),
]

out, bad = src, []
for r in R:
    old, new, n = (r + (1,))[:3]
    if out.count(old) != n:
        bad.append(f"expected {n}, found {out.count(old)}: {old[:110]}")
        continue
    out = out.replace(old, new)
# the og:image lines: drop the Italian version number carried over by the swap above
import re
out = re.sub(r'(og-image-en\.jpg\?v=[^"]+)" data-it-v="[^"]*"', r'\1"', out)
if bad:
    print("English page NOT written; these Italian strings changed in index.html, update make_en_page.py:", *bad, sep="\n  ", file=sys.stderr)
    sys.exit(1)
os.makedirs(os.path.join(HERE, "..", "en"), exist_ok=True)
open(os.path.join(HERE, "..", "en", "index.html"), "w", encoding="utf-8").write(out)
print("en/index.html written,", len(R), "replacements")
