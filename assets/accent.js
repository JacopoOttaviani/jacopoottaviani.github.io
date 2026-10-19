/* Accent colour picker in the menu bar: four dots, orange the default, the choice remembered in localStorage.
   The <head> one-liner has already set <html data-accent> before the first paint; this builds the dots,
   recolours the Moka drawings (they are <img>s) and folds the row into one dot when the bar has no room. */
(function () {
  var ACCENTS = [
    { id: "orange", c: "#FF7A29", t: "#FFDCC2", s1: "#E66A1F", s2: "#C45816", en: "Orange", it: "Arancione" },
    { id: "red",    c: "#C8102E", t: "#F7DBE0", s1: "#B00E28", s2: "#980C23", en: "Red",    it: "Rosso" },
    { id: "cobalt", c: "#2F6BE0", t: "#D8E3F9", s1: "#295EC5", s2: "#2451AA", en: "Cobalt", it: "Cobalto" },
    { id: "ochre",  c: "#C98A00", t: "#F1E2BF", s1: "#B17900", s2: "#996900", en: "Ochre",  it: "Ocra" }
  ];
  var root = document.documentElement;
  var lang = root.lang === "it" ? "it" : "en";
  var LABEL = lang === "it" ? "Colore d'accento" : "Accent colour";
  var nav = document.querySelector("nav");
  var langItem = nav && nav.querySelector("ul li.lang-item");
  if (!langItem) return;

  function find(id) {
    for (var i = 0; i < ACCENTS.length; i++) if (ACCENTS[i].id === id) return ACCENTS[i];
    return ACCENTS[0];
  }
  var current = find(root.getAttribute("data-accent"));

  /* ---------- the Moka drawings: fetch each SVG once, swap its orange family, show it as a blob ---------- */
  var svgs = {};
  function paintMokas() {
    var a = current;
    document.querySelectorAll('img[data-moka], img[src^="/assets/mokapot/"]').forEach(function (img) {
      var src = img.getAttribute("data-moka") || img.getAttribute("src");
      img.setAttribute("data-moka", src);
      if (a.id === "orange") {
        if (img.getAttribute("src") !== src) img.src = src;
        return;
      }
      svgs[src] = svgs[src] || fetch(src).then(function (r) { if (!r.ok) throw r.status; return r.text(); });
      svgs[src].then(function (txt) {
        if (current !== a) return;  // a newer pick got there first
        txt = txt.replace(/#FF7A29/gi, a.c).replace(/#FFDCC2/gi, a.t).replace(/#E66A1F/gi, a.s1).replace(/#C45816/gi, a.s2);
        var url = URL.createObjectURL(new Blob([txt], { type: "image/svg+xml" }));
        var old = img.getAttribute("src");
        img.src = url;
        if (old && old.indexOf("blob:") === 0) URL.revokeObjectURL(old);
      }).catch(function () { img.style.visibility = "visible"; });
    });
  }

  function apply(a, remember) {
    current = a;
    if (a.id === "orange") root.removeAttribute("data-accent");
    else root.setAttribute("data-accent", a.id);
    if (remember) {
      try { a.id === "orange" ? localStorage.removeItem("accent") : localStorage.setItem("accent", a.id); } catch (e) {}
    }
    paintMokas();
  }

  /* ---------- the dots ---------- */
  var li = document.createElement("li");
  li.className = "accent-item";
  var pick = document.createElement("div");
  pick.className = "accent-pick";
  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "accent-toggle";
  toggle.title = LABEL;
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "accent-menu");
  var menu = document.createElement("div");
  menu.className = "accent-menu";
  menu.id = "accent-menu";
  menu.setAttribute("role", "radiogroup");
  menu.setAttribute("aria-label", LABEL);
  var dots = ACCENTS.map(function (a) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "radio");
    b.setAttribute("aria-label", a[lang]);
    b.title = a[lang];
    b.style.setProperty("--c", a.c);
    b.addEventListener("click", function () { choose(a, true); });
    menu.appendChild(b);
    return b;
  });
  pick.appendChild(toggle);
  pick.appendChild(menu);
  li.appendChild(pick);
  langItem.parentNode.insertBefore(li, langItem.nextSibling);

  function sync() {
    dots.forEach(function (b, i) {
      var on = ACCENTS[i] === current;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    toggle.style.setProperty("--c", current.c);
    toggle.setAttribute("aria-label", LABEL + ": " + current[lang]);
  }
  function choose(a, fromClick) {
    apply(a, true);
    sync();
    if (fromClick && pick.classList.contains("open")) { close(); toggle.focus(); }
  }

  // arrow keys move round the radio group, as radios do
  menu.addEventListener("keydown", function (e) {
    var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    var i = (ACCENTS.indexOf(current) + step + ACCENTS.length) % ACCENTS.length;
    choose(ACCENTS[i], false);
    dots[i].focus();
  });

  /* ---------- folded: one dot that opens the four in a box hanging from the bar ---------- */
  function open() {
    menu.style.top = (nav.getBoundingClientRect().bottom - li.getBoundingClientRect().top - 2) + "px";
    pick.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    dots[ACCENTS.indexOf(current)].focus();
  }
  function close() {
    pick.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () { pick.classList.contains("open") ? close() : open(); });
  document.addEventListener("click", function (e) { if (!pick.contains(e.target)) close(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && pick.classList.contains("open")) { close(); toggle.focus(); }
  });

  // fold when the row would make the bar taller, overflow it, or sit in a bar whose labels already wrap;
  // measured, so it holds for EN and IT and any later nav change
  var pending = 0;
  function wraps() {
    var links = nav.querySelectorAll("ul a");
    for (var i = 0; i < links.length; i++) {
      var a = links[i], lh = parseFloat(getComputedStyle(a).lineHeight);
      if (a.offsetWidth && lh && a.offsetHeight > lh * 1.5) return true;
    }
    return false;
  }
  function fit() {
    pending = 0;
    if (pick.classList.contains("open")) return;
    pick.classList.add("folded");
    var h = nav.offsetHeight;
    pick.classList.remove("folded");
    if (nav.offsetHeight > h || nav.scrollWidth > nav.clientWidth + 1 || wraps()) pick.classList.add("folded");
  }
  function refit() { if (!pending) pending = requestAnimationFrame(fit); }
  window.addEventListener("resize", refit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
  window.addEventListener("load", refit);

  apply(current, false);  // also clears a stale or unknown stored id
  sync();
  fit();
})();
