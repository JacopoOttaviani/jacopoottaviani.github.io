/* light/dark button in the menu bar: the choice is remembered (localStorage "theme", shared by the Italian and English pages)
   and applied before paint by the script in <head>; without a choice the page follows the system */
(function () {
  const btn = document.getElementById("theme-btn");
  if (!btn) return;
  const root = document.documentElement, sys = matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => root.dataset.theme === "dark" || (root.dataset.theme !== "light" && sys.matches);
  const sync = () => btn.setAttribute("aria-pressed", isDark());
  btn.addEventListener("click", () => {
    const t = isDark() ? "light" : "dark";
    root.dataset.theme = t;
    try { localStorage.setItem("theme", t); } catch (e) {}
    sync();
  });
  sys.addEventListener("change", sync);
  sync();
})();

(async function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) document.querySelector(".logo")?.pauseAnimations?.();
  const YEARS = [2023, 2024, 2025, 2026];
  const CATS = ["Negozio o locale", "Palazzo o androne", "Abitazione privata", "Auto", "Sede politica, sociale o religiosa", "Istituzioni", "Altro"];
  /* ── language: <html lang> picks the strings and the dataset; the English page (en/) reads the English edition of the data
     (pipeline/english.py) and maps it onto the same fields. Categories and precision stay Italian codes inside the script. ── */
  const EN = document.documentElement.lang === "en";
  const CAT_EN = { "Negozio o locale": "Shop or venue", "Palazzo o androne": "Building or entrance hall", "Abitazione privata": "Private home",
    "Auto": "Car", "Sede politica, sociale o religiosa": "Political, social or religious premises", "Istituzioni": "Institutions", "Altro": "Other" };
  const PREC_EN = { civico: "street number", incrocio: "junction", luogo: "place", via: "street", stimato: "estimated", zona: "area" };
  const T = EN ? {
    data: "../data/episodes-en.json",
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    mon: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    days: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    prec: {
      civico: "Point at the street number given.",
      incrocio: "Point at the junction given by the sources.",
      luogo: "Point at the place given by the sources.",
      via: "Approximate point on the street: the number is not reported, not on the map, or it is a private home.",
      stimato: "Point estimated between nearby street numbers in OpenStreetMap: it may be a few hundred metres out.",
      zona: "Approximate area: the sources do not give the street."
    },
    cat: CAT_EN,
    loadError: "The data could not be loaded.",
    reset: "Back to the starting view", resetLabel: "Back to the starting view: the whole of Rome",
    nameField: "name:en",
    one: "episode", many: "episodes",
    devices: (n, what) => `${n} devices (${what})`, devicesShort: n => `${n} devices`,
    injured: n => `${n} injured`, noInjured: "no one injured", dead: n => `${n} dead`,
    dateNote: " Date: ", openCard: ". Open the card", openMap: ". Show on the map",
    clusterLabel: (eps, years) => `Group of ${eps} close together (${years}). Zoom in`,
    clusterTip: (eps, years) => `<b>${eps}</b> close together<br>${years}<br>click to zoom in`,
    group: "Group", groupTitle: "Group episodes that are close together",
    all: "All", last6: "Last 6 months", none: "no episodes",
    play: "Play the episodes month by month", pause: "Pause",
    geo: "../municipi.json", chAll: "All years",
    chSubAll: (e, upd) => `${e} from 2023 to ${upd}`, chSubYear: (e, y) => `${e} in ${y}`, chSubLast: (e, y, upTo) => `${e} in ${y}, up to ${upTo}`,
    chLegend: ["no episodes", "1–2", "3–7", "8 or more"],
    chEmpty: y => `No neighbourhood with two or more episodes in ${y}.`, chSingles: n => `One episode each (${n} neighbourhoods):`,
    chMapLabel: "Map of the 15 municipi of Rome with the number of episodes in each: ", chMunLabel: "Episodes by municipio: ",
    chQLabel: "Neighbourhoods with at least two episodes: "
  } : {
    data: "data/episodi.json",
    months: ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"],
    mon: ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"],
    days: ["dom","lun","mar","mer","gio","ven","sab"],
    prec: {
      civico: "Punto al numero civico indicato.",
      incrocio: "Punto all'incrocio indicato dalle fonti.",
      luogo: "Punto sul luogo indicato dalle fonti.",
      via: "Punto indicativo sulla via: il civico non è riportato, non è nella mappa, o si tratta di un'abitazione privata.",
      stimato: "Punto stimato tra i numeri civici vicini presenti in OpenStreetMap: può spostarsi di qualche centinaio di metri.",
      zona: "Zona approssimativa: le fonti non indicano la via."
    },
    cat: {},
    loadError: "Non è stato possibile caricare i dati.",
    reset: "Torna alla vista iniziale", resetLabel: "Torna alla vista iniziale: tutta Roma",
    nameField: "name:it",
    one: "episodio", many: "episodi",
    devices: (n, what) => `${n} ordigni (${what})`, devicesShort: n => `${n} ordigni`,
    injured: n => `${n} ${n === 1 ? "ferito" : "feriti"}`, noInjured: "nessun ferito", dead: n => `${n} ${n === 1 ? "morto" : "morti"}`,
    dateNote: " Data: ", openCard: ". Apri la scheda", openMap: ". Apri sulla mappa",
    clusterLabel: (eps, years) => `Gruppo di ${eps} vicini (${years}). Ingrandisci`,
    clusterTip: (eps, years) => `<b>${eps}</b> vicini<br>${years}<br>clic per ingrandire`,
    group: "Raggruppa", groupTitle: "Raggruppa gli episodi vicini",
    all: "Tutto", last6: "Ultimi 6 mesi", none: "nessun episodio",
    play: "Riproduci gli episodi mese per mese", pause: "Metti in pausa",
    geo: "municipi.json", chAll: "Tutti gli anni",
    chSubAll: (e, upd) => `${e} dal 2023 al ${upd}`, chSubYear: (e, y) => `${e} nel ${y}`, chSubLast: (e, y, upTo) => `${e} nel ${y}, fino al ${upTo}`,
    chLegend: ["nessun episodio", "1–2", "3–7", "8 o più"],
    chEmpty: y => `Nessun quartiere con due o più episodi nel ${y}.`, chSingles: n => `Un episodio ciascuno (${n} quartieri):`,
    chMapLabel: "Mappa dei 15 municipi di Roma con il numero di episodi in ciascuno: ", chMunLabel: "Episodi per municipio: ",
    chQLabel: "Quartieri con almeno due episodi: "
  };
  const CAT_CODE = Object.fromEntries(Object.entries(CAT_EN).map(([k, v]) => [v, k]));
  const PREC_CODE = Object.fromEntries(Object.entries(PREC_EN).map(([k, v]) => [v, k]));
  const fromEN = d => ({ id: d.id, data: d.date, ora: d.time, nota_data: d.date_note, quartiere: d.neighbourhood, municipio: d.municipio,
    indirizzo: d.address, precisione: PREC_CODE[d.precision], lat: d.lat, lon: d.lon, categoria: CAT_CODE[d.category], bersaglio: d.target,
    ordigno: d.device, ordigni: d.devices, feriti: d.injured, morti: d.killed, sintesi: d.summary,
    fonti: d.sources.map(f => ({ testata: f.outlet, titolo: f.title, data: f.date, url: f.url })) });
  const MESI = T.months, MES = T.mon, GIORNI = T.days, PREC = T.prec;
  const css = getComputedStyle(document.documentElement);
  const col = y => `var(--y${y})`;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtDate = (iso, long) => {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return long ? `${GIORNI[dt.getUTCDay()]} ${d} ${MESI[m - 1]} ${y}` : `${d} ${MES[m - 1]} ${y}`;
  };

  let data;
  try {
    data = await (await fetch(T.data, { cache: "no-cache" })).json();
    if (EN) data = data.map(fromEN);
  } catch (e) {
    document.getElementById("list").innerHTML = `<li style="padding:18px">${T.loadError}</li>`;
    return;
  }
  data.forEach(d => { d.anno = +d.data.slice(0, 4); });

  /* months from January 2023 to November 2026: the time filter works on their index */
  const months = [];
  for (let y = 2023; y <= 2026; y++) for (let m = 1; m <= 12; m++) { if (y === 2026 && m > 11) break; months.push(`${y}-${String(m).padStart(2, "0")}`); }
  const LAST = months.length - 1;
  data.forEach(d => { d.mi = months.indexOf(d.data.slice(0, 7)); });

  const state = { lo: 0, hi: LAST, cats: new Set(CATS), cluster: true };
  const inTime = d => d.mi >= state.lo && d.mi <= state.hi;
  const visible = d => inTime(d) && state.cats.has(d.categoria);

  /* ── map: MapLibre + OpenFreeMap (no key), positron in light mode, dark in dark mode ── */
  const dark = matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => document.documentElement.dataset.theme === "dark" || (document.documentElement.dataset.theme !== "light" && dark.matches);
  const styleURL = () => `https://tiles.openfreemap.org/styles/${isDark() ? "dark" : "positron"}`;
  const lons = data.map(d => d.lon), lats = data.map(d => d.lat);
  const map = new maplibregl.Map({
    container: "map", style: styleURL(),
    bounds: [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
    fitBoundsOptions: { padding: 40 }, minZoom: 8, maxZoom: 18, dragRotate: false, pitchWithRotate: false, scrollZoom: false,
    attributionControl: { compact: true }
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
  map.getContainer().append(document.getElementById("map-legend"));
  new ResizeObserver(() => map.resize()).observe(map.getContainer());
  // back to the starting view: the whole city with every episode
  const homeBounds = [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]];
  map.addControl({
    onAdd() {
      const c = document.createElement("div");
      c.className = "maplibregl-ctrl maplibregl-ctrl-group zoom-reset";
      c.innerHTML = `<button type="button" title="${T.reset}" aria-label="${T.resetLabel}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><circle cx="12" cy="12" r="2.4"/></svg></button>`;
      c.querySelector("button").addEventListener("click", () => {
        card.remove(); tt.remove();
        map.fitBounds(homeBounds, { padding: 40, duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700 });
      });
      return c;
    },
    onRemove() {}
  }, "top-left");
  // the system theme or the menu-bar button switches the base map; diff:false reloads the style, so "style.load" below adds the episodes back
  let styleNow = styleURL();
  const restyle = () => { if (styleURL() !== styleNow) { styleNow = styleURL(); map.setStyle(styleNow, { diff: false }); } };
  dark.addEventListener("change", restyle);
  new MutationObserver(restyle).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  // place names in the page language where OpenStreetMap has them (the style defaults to Latin/English names)
  map.on("styledata", () => {
    for (const l of map.getStyle().layers) {
      if (l.type !== "symbol") continue;
      if (/^label_country/.test(l.id) && map.getLayoutProperty(l.id, "visibility") !== "none") { map.setLayoutProperty(l.id, "visibility", "none"); continue; }  // "Città del Vaticano" would cover "Roma"
      const tf = map.getLayoutProperty(l.id, "text-field");
      if (tf && JSON.stringify(tf).includes("name") && !JSON.stringify(tf).includes(T.nameField)) {
        map.setLayoutProperty(l.id, "text-field", ["coalesce", ["get", T.nameField], ["get", "name"]]);
      }
    }
  });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const narrow = () => innerWidth <= 900;
  const plural = n => `${n} ${n === 1 ? T.one : T.many}`;

  // one marker per place: episodes at the same point share it
  const places = new Map();
  data.forEach(d => {
    const k = d.lat.toFixed(5) + "," + d.lon.toFixed(5);
    if (!places.has(k)) places.set(k, []);
    places.get(k).push(d);
  });

  const popupHTML = eps => eps.slice().sort((a, b) => b.data.localeCompare(a.data)).map(d => {
    const meta = [d.ordigni > 1 ? T.devices(d.ordigni, esc(d.ordigno)) : esc(d.ordigno)];
    meta.push(d.feriti ? T.injured(d.feriti) : T.noInjured);
    if (d.morti) meta.push(T.dead(d.morti));
    const src = d.fonti.map(f => `<li><a href="${esc(f.url)}" target="_blank" rel="noopener"><b>${esc(f.testata)}</b> · <span lang="it">${esc(f.titolo)}</span></a> <time datetime="${esc(f.data)}">${fmtDate(f.data)}</time></li>`).join("");
    return `<article class="pop">
      <p class="pd">${fmtDate(d.data, true)}${d.ora ? " · " + esc(d.ora) : ""}${d.nota_data ? ` <span title="${esc(d.nota_data)}">*</span>` : ""}</p>
      <h3>${esc(d.bersaglio)}</h3>
      <p class="pl">${esc(d.indirizzo)} — ${esc(d.quartiere)}${d.municipio ? " · " + esc(d.municipio) : ""}</p>
      <p class="pm"><span>${meta.join("</span><span>")}</span></p>
      <p class="px">${esc(d.sintesi)}</p>
      <p class="pp">${PREC[d.precisione] || ""}${d.nota_data ? T.dateNote + esc(d.nota_data) + "." : ""}</p>
      <ul class="src">${src}</ul>
    </article>`;
  }).join("");

  const card = new maplibregl.Popup({ className: "card", offset: 14, maxWidth: "320px", focusAfterOpen: false });
  const tt = new maplibregl.Popup({ className: "tt", offset: 14, closeButton: false, closeOnClick: false });
  const showTip = (lngLat, html) => { if (!card.isOpen() || !card.getLngLat().equals(lngLat)) tt.setLngLat(lngLat).setHTML(html).addTo(map); };

  /* place markers: built once, put on the map by the clustering below when their place is not inside a cluster */
  const markers = [], byKey = new Map();
  places.forEach((eps, key) => {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "mk-btn";
    const m = new maplibregl.Marker({ element: btn }).setLngLat([eps[0].lon, eps[0].lat]);
    const shownEps = () => eps.filter(visible).sort((a, b) => b.data.localeCompare(a.data));
    const label = () => shownEps().map(d => `${fmtDate(d.data)} · ${d.quartiere} · ${d.bersaglio}`);
    m.eps = eps; m.key = key;
    m.open = moved => {
      tt.remove();
      if (narrow() && !moved) {  // phones: bring the point to the upper part of the map so the card fits below it
        map.once("moveend", () => m.open(true));
        map.easeTo({ center: m.getLngLat(), offset: [0, -map.getContainer().clientHeight * 0.32], duration: reduced.matches ? 0 : 400 });
        return;
      }
      card.setLngLat(m.getLngLat()).setHTML(popupHTML(shownEps())).addTo(map);
    };
    m.refresh = () => {
      const shown = shownEps(), n = shown.length;
      const top = shown[0] || eps[0];
      const cls = ["mk", n > 1 ? "multi" : "", eps[0].precisione === "zona" ? "zone" : ""].join(" ");
      btn.innerHTML = `<span class="${cls}" style="--c:${col(top.anno)};--tc:var(--t${top.anno})">${n > 1 ? n : ""}</span>`;
      btn.dataset.label = label().join("; ") + T.openCard;
      btn.setAttribute("aria-label", btn.dataset.label);
      btn.style.zIndex = top.anno - 2020;  // newer years drawn above older ones; clusters at 10, cards at 20
    };
    btn.addEventListener("click", e => { e.stopPropagation(); m.open(); });
    btn.addEventListener("mouseenter", () => showTip(m.getLngLat(), label().map(esc).join("<br>")));
    btn.addEventListener("mouseleave", () => tt.remove());
    markers.push(m); byKey.set(key, m);
  });

  /* ── clustering: MapLibre clusters the visible places; clusters and places are drawn as HTML markers ── */
  const CLUSTER_MAX = 14;  // from zoom 15 every place is shown on its own
  const geojson = () => ({
    type: "FeatureCollection",
    features: [...places].map(([key, eps]) => {
      const shown = eps.filter(visible), props = { key, n: shown.length };
      YEARS.forEach(y => { props["y" + y] = shown.filter(d => d.anno === y).length; });
      return { type: "Feature", geometry: { type: "Point", coordinates: [eps[0].lon, eps[0].lat] }, properties: props };
    }).filter(f => f.properties.n)
  });
  const clusterProps = { n: ["+", ["get", "n"]] };
  YEARS.forEach(y => { clusterProps["y" + y] = ["+", ["get", "y" + y]]; });
  let clusterCache = new Map(), onMap = new Map();
  map.on("style.load", () => {
    if (map.getSource("ep")) return;
    onMap.forEach((m, id) => { if (id[0] === "c") { m.remove(); onMap.delete(id); } });  // after a style switch the cluster ids start over
    clusterCache = new Map();
    map.addSource("ep", { type: "geojson", data: geojson(), cluster: true, clusterRadius: 42, clusterMaxZoom: CLUSTER_MAX, clusterProperties: clusterProps });
    map.addLayer({ id: "ep-anchor", type: "circle", source: "ep", paint: { "circle-radius": 0, "circle-opacity": 0, "circle-stroke-opacity": 0 } });  // keeps the source loaded
  });

  function clusterMarker(p, coords) {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "cl-btn";
    const n = p.n, size = Math.round(Math.min(58, 24 + 7 * Math.sqrt(n)));
    let acc = 0;
    const stops = YEARS.filter(y => p["y" + y]).map(y => { const a = acc; acc += p["y" + y] / n * 100; return `var(--y${y}) ${a.toFixed(1)}% ${acc.toFixed(1)}%`; });
    btn.innerHTML = `<span class="cl" style="--s:${size}px;background:conic-gradient(${stops.join(",")})"><b>${n}</b></span>`;
    const byYear = YEARS.slice().reverse().filter(y => p["y" + y]).map(y => `${y}: ${p["y" + y]}`).join(" · ");
    const m = new maplibregl.Marker({ element: btn }).setLngLat(coords);
    btn.dataset.label = T.clusterLabel(plural(n), byYear);
    btn.addEventListener("click", async e => {
      e.stopPropagation(); tt.remove();
      let z = map.getZoom() + 2;
      try { z = await map.getSource("ep").getClusterExpansionZoom(p.cluster_id); } catch (err) {}
      map.easeTo({ center: coords, zoom: Math.min(z + 0.3, 17), duration: reduced.matches ? 0 : 500 });
    });
    btn.addEventListener("mouseenter", () => showTip(m.getLngLat(), T.clusterTip(plural(n), byYear)));
    btn.addEventListener("mouseleave", () => tt.remove());
    return m;
  }
  function drawMarkers() {
    const next = new Map();
    if (!state.cluster) {
      markers.forEach(m => { if (m.eps.some(visible)) next.set("p" + m.key, m); });
    } else {
    if (!map.getSource("ep") || !map.isSourceLoaded("ep")) return;
    for (const f of map.querySourceFeatures("ep")) {
      const p = f.properties;
      if (p.cluster) {
        const id = "c" + p.cluster_id;
        if (next.has(id)) continue;
        if (!clusterCache.has(id)) clusterCache.set(id, clusterMarker(p, f.geometry.coordinates));
        next.set(id, clusterCache.get(id));
      } else if (byKey.has(p.key) && !next.has("p" + p.key)) {
        next.set("p" + p.key, byKey.get(p.key));
      }
    }
    }
    for (const [id, m] of onMap) if (!next.has(id)) m.remove();
    for (const [id, m] of next) if (!onMap.has(id)) {
      m.addTo(map);
      m.getElement().setAttribute("aria-label", m.getElement().dataset.label);  // addTo resets it to "Map marker"
    }
    onMap = next;
  }
  map.on("render", drawMarkers);
  // a map control to turn the grouping on and off
  map.addControl({
    onAdd() {
      const c = document.createElement("div");
      c.className = "maplibregl-ctrl maplibregl-ctrl-group cl-toggle";
      c.innerHTML = `<button type="button" aria-pressed="true" title="${T.groupTitle}"><span class="cl-demo" aria-hidden="true"><b></b></span>${T.group}</button>`;
      const b = c.querySelector("button");
      b.addEventListener("click", () => {
        state.cluster = !state.cluster;
        b.setAttribute("aria-pressed", state.cluster);
        tt.remove(); drawMarkers();
      });
      return c;
    },
    onRemove() {}
  }, "top-right");
  function refreshClusters() {
    const src = map.getSource("ep");
    if (!src) return;
    onMap.forEach((m, id) => { if (id[0] === "c") { m.remove(); onMap.delete(id); } });
    clusterCache = new Map();
    src.setData(geojson());
  }

  /* ── bersaglio chips ── */
  const catsEl = document.getElementById("cats");
  const chip = (label, n, on, onclick) => {
    const b = document.createElement("button");
    b.className = "chip"; b.type = "button"; b.setAttribute("aria-pressed", on);
    b.innerHTML = `<span>${esc(label)}</span><span class="n">${n}</span>`;
    b.addEventListener("click", onclick);
    return b;
  };
  const toggle = (set, v, all) => {
    // first click isolates one value; then clicks add/remove; emptying resets to all
    if (set.size === all.length) { set.clear(); set.add(v); }
    else if (set.has(v)) { set.delete(v); if (!set.size) all.forEach(x => set.add(x)); }
    else set.add(v);
  };
  function renderChips() {
    catsEl.innerHTML = "";
    CATS.filter(c => data.some(d => d.categoria === c)).forEach(c => catsEl.append(chip(T.cat[c] || c, data.filter(d => d.categoria === c && inTime(d)).length, state.cats.has(c), () => { toggle(state.cats, c, CATS); update(); })));
  }

  /* ── time filter: monthly histogram with two range handles ── */
  const track = document.getElementById("tf-track"), hist = document.getElementById("tf-hist"), tip = document.getElementById("tip");
  const loIn = document.getElementById("tf-lo"), hiIn = document.getElementById("tf-hi");
  [loIn, hiIn].forEach(i => { i.max = LAST; });
  const TW = 16, HB = 62;  // range thumb width (its centre travels TW/2 .. width-TW/2), bar area height
  const monthName = i => { const [y, m] = months[i].split("-").map(Number); return `${MESI[m - 1]} ${y}`; };
  const PRESETS = [[T.all, 0, LAST], ...YEARS.map(y => [String(y), months.indexOf(`${y}-01`), y === 2026 ? LAST : months.indexOf(`${y}-12`)]), [T.last6, LAST - 5, LAST]];
  const presetsEl = document.getElementById("tf-presets");
  PRESETS.forEach(([label, lo, hi]) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = label; b.dataset.lo = lo; b.dataset.hi = hi;
    b.addEventListener("click", () => { stopPlay(); setRange(lo, hi); });
    presetsEl.append(b);
  });
  function setRange(lo, hi) {
    state.lo = Math.max(0, Math.min(lo, hi)); state.hi = Math.min(LAST, Math.max(lo, hi));
    update();
  }
  loIn.addEventListener("input", () => { stopPlay(); if (+loIn.value > state.hi) loIn.value = state.hi; setRange(+loIn.value, state.hi); });
  hiIn.addEventListener("input", () => { stopPlay(); if (+hiIn.value < state.lo) hiIn.value = state.lo; setRange(state.lo, +hiIn.value); });
  [loIn, hiIn].forEach(i => {
    i.addEventListener("focus", () => hist.querySelector(i === loIn ? ".h-lo" : ".h-hi")?.classList.add("focus"));
    i.addEventListener("blur", () => hist.querySelectorAll(".handle").forEach(h => h.classList.remove("focus")));
  });
  function renderTime() {
    const W = track.clientWidth, step = Math.max(0, (W - TW) / LAST), bw = Math.max(2, step - 2);  // the track can measure 0 while the layout changes
    const x = i => TW / 2 + i * step;
    const counts = months.map((k, i) => data.filter(d => d.mi === i && state.cats.has(d.categoria)).length);
    const max = Math.max(1, ...counts);
    let s = `<rect class="sel" x="${x(state.lo) - step / 2}" y="0" width="${(state.hi - state.lo + 1) * step}" height="${HB}"/>`;
    YEARS.forEach(y => { const i = months.indexOf(`${y}-01`); s += `<line class="tick" x1="${x(i) - step / 2}" x2="${x(i) - step / 2}" y1="0" y2="${HB + 4}"/><text class="axis" x="${x(i) - step / 2 + 3}" y="${HB + 15}">${y}</text>`; });
    months.forEach((k, i) => {
      const h = counts[i] ? Math.max(3, counts[i] / max * (HB - 6)) : 0, y = +k.slice(0, 4);
      const fill = i >= state.lo && i <= state.hi ? col(y) : "var(--bar-off)";
      if (h) s += `<rect class="bar" x="${(x(i) - bw / 2).toFixed(1)}" y="${(HB - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${fill}"/>`;
    });
    s += `<line class="base" x1="0" x2="${W}" y1="${HB + .5}" y2="${HB + .5}"/>`;
    [["h-lo", state.lo, -1], ["h-hi", state.hi, 1]].forEach(([c, i, side]) => {
      const hx = x(i) + side * step / 2;
      const focused = document.activeElement === (c === "h-lo" ? loIn : hiIn) ? " focus" : "";
      s += `<g class="handle ${c}${focused}"><line x1="${hx}" x2="${hx}" y1="0" y2="${HB}"/><rect x="${hx - 4}" y="${HB / 2 - 9}" width="8" height="18" rx="1"/></g>`;
    });
    months.forEach((k, i) => { s += `<rect class="hit" data-i="${i}" x="${x(i) - step / 2}" y="0" width="${step}" height="${HB}"/>`; });
    hist.setAttribute("viewBox", `0 0 ${W} ${track.clientHeight}`);
    hist.innerHTML = s;
    loIn.value = state.lo; hiIn.value = state.hi;
    loIn.style.zIndex = state.lo >= LAST - 1 ? 3 : 2; hiIn.style.zIndex = state.lo >= LAST - 1 ? 2 : 3;  // keep both handles grabbable at the ends
    loIn.setAttribute("aria-valuetext", monthName(state.lo)); hiIn.setAttribute("aria-valuetext", monthName(state.hi));
    hist.querySelectorAll(".hit").forEach(r => {
      const i = +r.dataset.i;
      r.addEventListener("mouseenter", () => {
        tip.innerHTML = `${monthName(i)} · <b>${counts[i]}</b> ${counts[i] === 1 ? T.one : T.many}`;
        tip.style.left = Math.min(W - 80, Math.max(80, x(i))) + "px"; tip.style.top = "-6px"; tip.style.display = "block";
      });
      r.addEventListener("mouseleave", () => { tip.style.display = "none"; });
      r.addEventListener("click", () => { stopPlay(); setRange(i, i); });  // a click on a month selects that month
    });
    const n = data.filter(visible).length;
    document.getElementById("tf-range").innerHTML = (state.lo === state.hi ? monthName(state.lo) : `${monthName(state.lo)} – ${monthName(state.hi)}`) + `<small>${plural(n)}</small>`;
    presetsEl.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.lo === state.lo && +b.dataset.hi === state.hi));
  }
  addEventListener("resize", renderTime);

  /* ── play: the period grows month by month from its start; each month's episodes explode on the map ── */
  const playBtn = document.getElementById("tf-play");
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17l14-8.5z"/></svg>';
  const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h5v17H5zM14 3.5h5v17h-5z"/></svg>';
  const STAR = "M0,-12 L2.6,-4.2 L10.4,-6 L5,0 L10.4,6 L2.6,4.2 L0,12 L-2.6,4.2 L-10.4,6 L-5,0 L-10.4,-6 L-2.6,-4.2Z";
  const playMonth = document.createElement("div");
  playMonth.className = "play-month"; playMonth.setAttribute("aria-hidden", "true");
  map.getContainer().append(playMonth);
  let timer = null, playEnd = LAST;
  playBtn.innerHTML = PLAY;
  function boom(d) {
    const el = document.createElement("div");
    el.className = "boom"; el.style.setProperty("--c", col(d.anno));
    el.innerHTML = `<span class="ring"></span><svg viewBox="-13 -13 26 26"><path d="${STAR}"/></svg>`;
    const m = new maplibregl.Marker({ element: el }).setLngLat([d.lon, d.lat]).addTo(map);
    el.removeAttribute("aria-label"); el.setAttribute("aria-hidden", "true");
    setTimeout(() => m.remove(), reduced.matches ? 700 : 1500);
  }
  function showMonth(i) {
    const eps = data.filter(d => d.mi === i && state.cats.has(d.categoria));
    playMonth.innerHTML = `${monthName(i)}<small>${eps.length ? plural(eps.length) : T.none}</small>`;
    playMonth.classList.add("on");
    eps.forEach(boom);
  }
  function stopPlay() {
    if (!timer) return;
    clearInterval(timer); timer = null;
    playBtn.innerHTML = PLAY; playBtn.setAttribute("aria-pressed", "false"); playBtn.setAttribute("aria-label", T.play);
    setTimeout(() => { if (!timer) playMonth.classList.remove("on"); }, 1200);
  }
  function startPlay() {
    // plays the selected period from its first month (the whole period if a single month is selected)
    const start = state.lo === state.hi ? 0 : state.lo;
    playEnd = state.lo === state.hi ? LAST : state.hi;
    playBtn.innerHTML = PAUSE; playBtn.setAttribute("aria-pressed", "true"); playBtn.setAttribute("aria-label", T.pause);
    setRange(start, start); showMonth(start);
    timer = setInterval(() => {
      if (state.hi >= playEnd) { stopPlay(); return; }
      setRange(state.lo, state.hi + 1); showMonth(state.hi);
    }, 650);
  }
  playBtn.addEventListener("click", () => (timer ? stopPlay() : startPlay()));

  /* ── list ── */
  const listEl = document.getElementById("list");
  // "Tor Bella Monaca (Torre Gaia)": the main name large, the detail in brackets on a smaller line
  const quartiereHTML = q => { const m = q.match(/^(.*?)\s*\((.+)\)$/); return m ? `${esc(m[1])}<small>${esc(m[2])}</small>` : esc(q); };
  function renderList(shown) {
    document.getElementById("list-n").textContent = plural(shown.length);
    listEl.innerHTML = shown.slice().sort((a, b) => (b.data + (b.ora || "")).localeCompare(a.data + (a.ora || ""))).map(d =>
      `<li class="item" data-id="${d.id}"><button type="button" aria-label="${esc(fmtDate(d.data, true) + ", " + d.quartiere + ": " + d.bersaglio + T.openMap)}">
        <span class="sw" style="--c:${col(d.anno)}"></span><span class="d">${fmtDate(d.data)}</span>
        <span class="q">${quartiereHTML(d.quartiere)}</span>
        <span class="t">${esc(d.bersaglio)}</span><span class="s">${esc(d.indirizzo)} · ${esc(d.ordigni > 1 ? T.devicesShort(d.ordigni) : d.ordigno)}</span>
      </button></li>`).join("");
  }
  listEl.addEventListener("click", e => {
    const li = e.target.closest(".item"); if (!li) return;
    const m = markers.find(m => m.eps.some(d => d.id === li.dataset.id)); if (!m) return;
    listEl.querySelectorAll(".item.on").forEach(x => x.classList.remove("on")); li.classList.add("on");
    if (narrow()) document.getElementById("map").scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth", block: "start" });
    map.once("moveend", () => m.open(true));
    map.flyTo({ center: m.getLngLat(), zoom: Math.max(map.getZoom(), CLUSTER_MAX + 1.2), offset: [0, narrow() ? -map.getContainer().clientHeight * 0.32 : 0], duration: reduced.matches ? 0 : 900, essential: false });
  });

  /* ── header counters: count up from zero on load, then slide to each new value ── */
  function countTo(el, to) {
    const from = el.dataset.v === undefined ? 0 : +el.dataset.v, first = el.dataset.v === undefined;
    el.dataset.v = to;
    cancelAnimationFrame(el._raf);
    if (reduced.matches || from === to) { el.textContent = to; return; }
    const dur = first ? 1600 : 450, t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);  // ease-out
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  /* ── update ── */
  function update() {
    const shown = data.filter(visible);
    card.remove(); tt.remove();
    markers.forEach(m => m.refresh());
    refreshClusters();
    countTo(document.getElementById("t-n"), shown.length);
    countTo(document.getElementById("t-f"), shown.reduce((s, d) => s + (d.feriti || 0), 0));
    countTo(document.getElementById("t-m"), shown.reduce((s, d) => s + (d.morti || 0), 0));
    renderChips(); renderTime(); renderList(shown);
  }
  update();

  /* ── charts by municipio and by neighbourhood, above the method notes, with their own year buttons (one year at a time,
     independent of the map filters). Neighbourhood names are the ones in the data, with the part in brackets dropped
     ("Acilia (San Giorgio)" counts as Acilia; "Tuscolano (Don Bosco)" as Don Bosco). The bar scales stay those of all the
     years, so years compare. ── */
  const sec = document.getElementById("grafici");
  if (!sec) return;
  const ROM = "I II III IV V VI VII VIII IX X XI XII XIII XIV XV".split(" ");
  const NS = "http://www.w3.org/2000/svg";
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const epN = n => `${n} ${n === 1 ? T.one : T.many}`;
  const qName = q => q === "Tuscolano (Don Bosco)" ? "Don Bosco" : q.replace(/\s*\(.*\)$/, "");
  const LASTY = YEARS[YEARS.length - 1];
  const upd = (document.getElementById("upd")?.textContent || "").trim();
  let sel = "all";
  const act = () => sel === "all" ? YEARS : [+sel];
  const cnt = o => act().reduce((s, y) => s + (o[y] || 0), 0);
  const all = o => YEARS.reduce((s, y) => s + (o[y] || 0), 0);
  const byM = Object.fromEntries(ROM.map(r => [r, {}])), byQ = new Map(), perYear = {};
  for (const d of data) {
    const r = String(d.municipio).replace("Municipio ", ""), q = qName(d.quartiere);
    perYear[d.anno] = (perYear[d.anno] || 0) + 1;
    if (byM[r]) byM[r][d.anno] = (byM[r][d.anno] || 0) + 1;
    if (!byQ.has(q)) byQ.set(q, { q, r });
    const o = byQ.get(q); o[d.anno] = (o[d.anno] || 0) + 1;
  }
  const nice = v => { for (const s of [1, 2, 3, 5, 10, 20, 50]) { const m = Math.max(s, Math.ceil(v / s) * s); if (m / s <= 6) return [m, s]; } return [v, v]; };
  const [munMax, munStep] = nice(Math.max(...ROM.map(r => all(byM[r]))));
  const [qMax, qStep] = nice(Math.max(...[...byQ.values()].map(all)));

  const chTip = document.createElement("div"); chTip.className = "ch-tip"; document.body.append(chTip);
  const show = (e, html) => {
    chTip.innerHTML = html; chTip.style.display = "block";
    const w = chTip.offsetWidth, h = chTip.offsetHeight; let x = e.clientX + 14, y = e.clientY + 14;
    if (x + w > innerWidth - 8) x = e.clientX - w - 14; if (y + h > innerHeight - 8) y = e.clientY - h - 14;
    chTip.style.left = x + "px"; chTip.style.top = y + "px";
  };
  const hide = () => { chTip.style.display = "none"; };
  const yrs = o => sel !== "all" ? "" : "<br>" + YEARS.filter(y => o[y]).map(y => `${y}: ${o[y]}`).join(" · ");

  const yb = document.getElementById("ch-years");
  yb.innerHTML = [["all", T.chAll, data.length], ...YEARS.map(y => [String(y), String(y), perYear[y] || 0])]
    .map(([k, l, n]) => `<button type="button" class="ych" data-y="${k}" aria-pressed="${k === "all"}">${k === "all" ? "" : `<span class="sw" style="--c:${col(k)}"></span>`}${l} <span class="n">${n}</span></button>`).join("");
  yb.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; sel = b.dataset.y; render(); });

  /* the municipi map: grey by number of episodes (0, 1-2, 3-7, 8+), a dot per episode in its year colour; ../municipi.json comes
     from pipeline/make_municipi_svg.py with the projection used below. Text, dots and edges are resized to keep their pixel size. */
  const bin = n => n === 0 ? 0 : n <= 2 ? 1 : n <= 7 ? 2 : 3;
  document.getElementById("ch-legend").innerHTML = T.chLegend.map((l, i) => `<span><i style="--c:var(--m${i})"></i>${l}</span>`).join("");
  let geo = null;
  try { geo = await (await fetch(T.geo, { cache: "no-cache" })).json(); } catch (e) { document.getElementById("ch-map-cell").hidden = true; }
  const mapSvg = document.getElementById("ch-map"), M = {};
  if (geo) {
    mapSvg.setAttribute("viewBox", `0 0 ${geo.w} ${geo.h}`);
    const P = geo.proj, xy = d => [P.pad + (d.lon - P.minlon) * P.c * P.k, P.pad + (P.maxlat - d.lat) * P.k];
    const g = el("g", {}, mapSvg);
    for (const r of ROM) {
      const a = el("g", { class: "ch-m", tabindex: 0 }, g);
      const p = el("path", { d: geo.municipi[r].d }, a);
      const html = () => {
        const o = byM[r], n = cnt(o), qs = [...byQ.values()].filter(q => q.r === r && cnt(q)).map(q => esc(q.q));
        return `<b>Municipio ${r}</b><br>${epN(n)}${n ? yrs(o) + `<br><span class="q">${qs.join(", ")}</span>` : ""}`;
      };
      a.addEventListener("mousemove", e => show(e, html())); a.addEventListener("mouseleave", hide);
      M[r] = { a, p };
    }
    const pg = el("g", {}, mapSvg);
    M.pts = data.filter(d => isFinite(d.lat) && isFinite(d.lon)).map(d => { const [x, y] = xy(d); return { y: d.anno, c: el("circle", { class: "ch-pt", cx: x.toFixed(1), cy: y.toFixed(1), fill: col(d.anno) }, pg) }; });
    const lg = el("g", {}, mapSvg);
    for (const r of ROM) {
      const m = geo.municipi[r], t = el("text", { class: "ch-lab", x: m.lx, y: m.ly }, lg);
      t.append(r + " "); M[r].n = el("tspan", { class: "n" }, t); M[r].t = t;
    }
  }
  function scaleMap() {
    if (!geo) return;
    const w = mapSvg.getBoundingClientRect().width; if (!w) return;
    const s = geo.w / w;
    for (const r of ROM) {
      const m = M[r];
      m.p.setAttribute("stroke-width", 1.2 * s);
      m.t.setAttribute("font-size", 12 * s); m.t.setAttribute("stroke-width", 3 * s); m.t.setAttribute("y", geo.municipi[r].ly + 4 * s);
    }
    M.pts.forEach(p => { p.c.setAttribute("r", 3.4 * s); p.c.setAttribute("stroke-width", 1.2 * s); });
  }

  /* horizontal bars stacked by year, drawn at the width of their cell; the label column is measured from the labels themselves */
  function bars(svg, rows, max, step, withSub, label) {
    svg.innerHTML = "";
    svg.style.display = rows.length ? "" : "none";
    if (!rows.length) return;
    const W = Math.max(260, Math.round(svg.parentNode.getBoundingClientRect().width)), bh = 18, gap = 10, top = 22, R = 30;
    const H = top + rows.length * (bh + gap);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H);
    svg.setAttribute("aria-label", label + rows.map(r => `${r.label} ${cnt(r)}`).join(", "));
    const grid = el("g", {}, svg);
    const R_ = rows.map((r, i) => {
      const y = top + i * (bh + gap), g = el("g", { class: "ch-row" }, svg);
      el("rect", { class: "ch-bg", x: -6, y: y - gap / 2, width: W + 6, height: bh + gap, fill: "transparent" }, g);
      const t = el("text", { class: "ch-ax", y: y + bh / 2 + 4 }, g); t.textContent = r.label;
      let s = null; if (withSub) { s = el("text", { class: "ch-ax m", y: y + bh / 2 + 4, "text-anchor": "end" }, g); s.textContent = r.sub; }
      return { r, y, g, t, s };
    });
    const lw = Math.max(...R_.map(o => o.t.getComputedTextLength()));
    const sw = withSub ? Math.max(...R_.map(o => o.s.getComputedTextLength())) : 0;
    const L = Math.ceil(lw + (withSub ? sw + 16 : 0) + 10), sc = (W - L - R) / max;
    for (let v = 0; v <= max; v += step) {
      const x = L + v * sc;
      el("line", { class: "ch-gl", x1: x, x2: x, y1: top - 6, y2: H }, grid);
      const t = el("text", { class: "ch-ax", x, y: 12, "text-anchor": "middle" }, grid); t.textContent = v;
    }
    R_.forEach(({ r, y, g, t, s }, i) => {
      if (withSub) { t.setAttribute("x", 0); s.setAttribute("x", L - 10); } else { t.setAttribute("x", L - 10); t.setAttribute("text-anchor", "end"); }
      const n = cnt(r);
      if (n) {
        const w = n * sc, id = `${svg.id}-c${i}`, cp = el("clipPath", { id }, g);
        el("path", { d: `M${L},${y}h${w - 4}a4,4 0 0 1 4,4v${bh - 8}a4,4 0 0 1 -4,4h${-(w - 4)}z` }, cp);
        const bg = el("g", { "clip-path": `url(#${id})` }, g), ys = act().filter(k => r[k]);
        let x = L;
        ys.forEach((k, j) => { const ww = r[k] * sc; el("rect", { x, y, width: Math.max(0, ww - (j < ys.length - 1 ? 2 : 0)), height: bh, fill: col(k) }, bg); x += ww; });
      }
      const tt = el("text", { class: "ch-tot", x: L + n * sc + 6, y: y + bh / 2 + 4 }, g); tt.textContent = n;
      g.addEventListener("mousemove", e => show(e, `<b>${esc(r.full)}</b><br>${epN(n)}${n ? yrs(r) : ""}`)); g.addEventListener("mouseleave", hide);
    });
  }

  function draw() {
    scaleMap();
    const mrows = ROM.map(r => ({ ...byM[r], r, label: "Municipio " + r, full: "Municipio " + r })).sort((a, b) => cnt(b) - cnt(a) || ROM.indexOf(a.r) - ROM.indexOf(b.r));
    bars(document.getElementById("ch-mun"), mrows, munMax, munStep, false, T.chMunLabel);
    const q2 = [...byQ.values()].filter(q => cnt(q) >= 2).sort((a, b) => cnt(b) - cnt(a) || a.q.localeCompare(b.q, "it")).map(q => ({ ...q, label: q.q, sub: q.r, full: `${q.q} (Municipio ${q.r})` }));
    bars(document.getElementById("ch-q"), q2, qMax, qStep, true, T.chQLabel);
    const em = document.getElementById("ch-q-empty"); em.hidden = q2.length > 0; em.textContent = T.chEmpty(sel);
    const ones = [...byQ.values()].filter(q => cnt(q) === 1).sort((a, b) => a.q.localeCompare(b.q, "it")), gm = {};
    ones.forEach(q => (gm[q.r] = gm[q.r] || []).push(esc(q.q)));
    document.getElementById("ch-singles").innerHTML = ones.length ? `<b>${T.chSingles(ones.length)}</b> ` + ROM.filter(r => gm[r]).map(r => `${gm[r].join(", ")} (${r})`).join("; ") + "." : "";
  }
  function render() {
    yb.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.y === sel));
    const e = epN(act().reduce((s, y) => s + (perYear[y] || 0), 0));
    document.getElementById("ch-sub").textContent = sel === "all" ? T.chSubAll(e, upd)
      : +sel === LASTY && upd ? T.chSubLast(e, sel, upd.replace(/\s*\d{4}$/, "")) : T.chSubYear(e, sel);
    if (geo) {
      for (const r of ROM) { const k = cnt(byM[r]); M[r].p.setAttribute("fill", `var(--m${bin(k)})`); M[r].n.textContent = k; M[r].a.setAttribute("aria-label", `Municipio ${r}: ${epN(k)}`); }
      const on = new Set(act()); M.pts.forEach(p => { p.c.style.display = on.has(p.y) ? "" : "none"; });
      mapSvg.setAttribute("aria-label", T.chMapLabel + ROM.map(r => `${r} ${cnt(byM[r])}`).join(", "));
    }
    draw();
  }
  render();
  let lastW = 0;
  new ResizeObserver(() => { const w = sec.clientWidth; if (w !== lastW) { lastW = w; draw(); } }).observe(sec);
})();
