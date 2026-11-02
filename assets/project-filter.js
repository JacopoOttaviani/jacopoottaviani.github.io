/* Selected projects: the keyword tabs (one keyword at a time, plus All) and Shuffle, moved by Isotope (assets/vendor/isotope.pkgd.min.js).
   Markup, in index.html and it/index.html: .pf (tabs, status, Shuffle; hidden until this runs) above .cards, whose .cell[data-tags] each wrap one .card.
   The labels live in the markup (EN + IT), so this file has no copy of its own. Without Isotope the cards stay the CSS grid and .pf stays hidden. */
(function () {
  var grid = document.querySelector("#work .cards"), pf = document.querySelector("#work .pf");
  if (!grid || !pf || !window.Isotope) return;

  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cells = [].slice.call(grid.querySelectorAll(".cell"));
  var cards = [].slice.call(grid.querySelectorAll(".card"));
  var tabs = [].slice.call(pf.querySelectorAll(".pf-tab"));
  var status = pf.querySelector(".pf-status"), shuffle = pf.querySelector(".pf-shuffle");
  var OF = pf.getAttribute("data-of") || "of";

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function has(el, k) { return (" " + el.getAttribute("data-tags") + " ").indexOf(" " + k + " ") > -1; }
  function count(k) { return k === "*" ? cells.length : cells.filter(function (c) { return has(c, k); }).length; }

  tabs.forEach(function (t) { t.querySelector("sup").textContent = count(t.getAttribute("data-k")); });

  grid.classList.add("iso");   // the CSS grid gives way to Isotope's masonry
  var iso = new Isotope(grid, {
    itemSelector: ".cell", percentPosition: true, layoutMode: "masonry", masonry: { columnWidth: ".sizer" },
    transitionDuration: calm ? 0 : "0.6s", stagger: calm ? 0 : 45,
    // dealt like a hand: the old cards slide off the table, the new ones rise in one after another
    hiddenStyle:  { opacity: 0, transform: "translateY(80px) rotate(3deg) scale(.92)" },
    visibleStyle: { opacity: 1, transform: "translateY(0) rotate(0deg) scale(1)" }
  });
  pf.hidden = false;

  // the scroll-in entrance (.card.in, set by the page's cardIO) would replay on every card Isotope shows again: once the filter is used, every card counts as seen
  var settled = false;
  function settle() {
    if (settled) return;
    settled = true;
    cards.forEach(function (c) { c.classList.add("in", "seen"); });
  }

  var cur = "*";
  function paint() {
    var label = tabs.filter(function (t) { return t.getAttribute("data-k") === cur; })[0].querySelector("span").textContent;
    status.innerHTML = "<span class=\"pf-n\"><em>" + pad(count(cur)) + "</em>" + OF + " " + cells.length + (cur === "*" ? "" : " · " + label) + "</span>";
    var em = status.querySelector("em"); em.classList.remove("roll"); void em.offsetWidth; em.classList.add("roll");
    tabs.forEach(function (t) { t.setAttribute("aria-pressed", t.getAttribute("data-k") === cur); });
    [].forEach.call(grid.querySelectorAll(".ktags li"), function (li) { li.classList.toggle("on", li.getAttribute("data-k") === cur); });
  }

  pf.addEventListener("click", function (e) {
    var t = e.target.closest(".pf-tab");
    if (!t) return;
    settle();
    cur = t.getAttribute("data-k");
    iso.arrange({ filter: cur === "*" ? "*" : function (el) { return has(el, cur); }, sortBy: "original-order" });
    paint();
  });

  shuffle.addEventListener("click", function () {
    settle();
    iso.shuffle();
    shuffle.classList.add("spin");
    setTimeout(function () { shuffle.classList.remove("spin"); }, 520);
  });

  paint();
})();
