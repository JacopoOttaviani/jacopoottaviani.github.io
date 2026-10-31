/* Accent colour picker in the menu bar: Kandinsky's three Bauhaus colours (coral as the red, yellow, cobalt), coral the default,
   the choice remembered in localStorage. The drawings and the CSS tokens are still authored in orange, which is no longer
   in the row, so every accent, the default included, is applied as a pick.
   The <head> one-liner has already set <html data-accent> before the first paint; this builds the dots,
   recolours the Moka drawings and the project banners (they are <img>s) and folds the row into one dot when the bar has no room. */
(function () {
  var ACCENTS = [
    // c accent, t tint (peach); s1, s2 the exploded Moka's shades; x1, x2 the Rome banner's shade and mid-tint
    // the tint t sits at L* 90; s1, s2, x1 are the colour times 0.88, 0.76, 0.83; x2 is the colour 55% into white, times 0.95
    // coral: PANTONE 16-1546 Living Coral, at its usual sRGB conversion
    { id: "coral",  c: "#FF6F61", t: "#FFDAD7", s1: "#E06255", s2: "#C2544A", x1: "#D45C51", x2: "#F2B5AF", en: "Coral",  it: "Corallo" },
    { id: "yellow", c: "#E8A317", t: "#F7E0B2", s1: "#CC8F14", s2: "#B07C11", x1: "#C18713", x2: "#E8CB8F", en: "Yellow", it: "Giallo" },
    { id: "cobalt", c: "#2F6BE0", t: "#D8E3F9", s1: "#295EC5", s2: "#2451AA", x1: "#2759BA", x2: "#99B3E5", en: "Cobalt", it: "Cobalto" }
  ];
  var root = document.documentElement;
  var lang = root.lang === "it" ? "it" : "en";
  var LABEL = lang === "it" ? "Colore d'accento" : "Accent colour";
  var nav = document.querySelector("nav");
  var langItem = nav && nav.querySelector("ul li.lang-item");
  if (!langItem) return;

  function find(id) {
    for (var i = 0; i < ACCENTS.length; i++) if (ACCENTS[i].id === id) return ACCENTS[i];
    return ACCENTS[0];  // nothing stored, or a colour that has left the row (orange, red, ochre): coral
  }
  var stored = root.getAttribute("data-accent");
  var current = find(stored);
  if (current.id !== stored) {
    try { localStorage.removeItem("accent"); } catch (e) {}  // forget the old colour, so the next visit opens in coral straight away
  }

  /* ---------- Moka drawings and project banners: fetch each SVG once, swap its orange family, show it as a blob ---------- */
  var svgs = {};
  function paintImages() {
    var a = current;
    document.querySelectorAll('img[data-accent-src], img[src*="assets/mokapot/"], img[src*="assets/projects/"]').forEach(function (img) {
      var src = img.getAttribute("data-accent-src") || img.getAttribute("src");
      img.setAttribute("data-accent-src", src);
      svgs[src] = svgs[src] || fetch(src).then(function (r) { if (!r.ok) throw r.status; return r.text(); });
      svgs[src].then(function (txt) {
        if (current !== a) return;  // a newer pick got there first
        txt = txt.replace(/#FF7A29/gi, a.c).replace(/#FFDCC2/gi, a.t).replace(/#E66A1F/gi, a.s1).replace(/#C45816/gi, a.s2)
                 .replace(/#D9621F/gi, a.x1).replace(/#F2C3A0/gi, a.x2);
        var url = URL.createObjectURL(new Blob([txt], { type: "image/svg+xml" }));
        var old = img.getAttribute("src");
        img.src = url;
        if (old && old.indexOf("blob:") === 0) URL.revokeObjectURL(old);
      }).catch(function () { img.style.visibility = "visible"; });
    });
  }

  function apply(a, remember) {
    current = a;
    root.setAttribute("data-accent", a.id);
    if (remember) {
      try { localStorage.setItem("accent", a.id); } catch (e) {}
    }
    paintImages();
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

  /* ---------- folded: one dot that opens the three in a box hanging from the bar ---------- */
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
  function crowded() { return nav.scrollWidth > nav.clientWidth + 1 || wraps(); }
  var CLEAR = 7;  // px between the dot and its neighbours when the bar is tight (its ring takes 4.2 of them)
  function fit() {
    pending = 0;
    if (pick.classList.contains("open")) return;
    li.style.margin = "";
    pick.classList.add("folded");
    var h = nav.offsetHeight;
    pick.classList.remove("folded");
    if (nav.offsetHeight > h || crowded()) {
      pick.classList.add("folded");
      // still crowded with one dot (workshops on phones): close the bar's gap around it down to CLEAR, whatever that gap is
      var gap = parseFloat(getComputedStyle(li.parentNode).columnGap) || 0;
      if (crowded() && gap > CLEAR) li.style.margin = "0 " + (CLEAR - gap) + "px";
    }
  }
  function refit() { if (!pending) pending = requestAnimationFrame(fit); }
  window.addEventListener("resize", refit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
  window.addEventListener("load", refit);

  apply(current, false);
  sync();
  fit();
})();
