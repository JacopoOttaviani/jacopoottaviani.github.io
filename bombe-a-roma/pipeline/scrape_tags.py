"""Collect article cards from RomaToday tag pages (all pages) into cards.json."""
import json, re, sys, time, html, urllib.request, os

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
OUT = sys.argv[1]
TAGS = sys.argv[2].split(",")

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read().decode("utf-8", "ignore")
    except Exception as e:
        print("ERR", url, e, file=sys.stderr)
        return ""

card_re = re.compile(r'<header class="c-story__content">(.*?)</header>', re.S)
def parse(h):
    out = []
    for m in card_re.finditer(h):
        b = m.group(1)
        link = re.search(r'<a class="o-link-text" href="([^"]+)"', b)
        if not link:
            continue
        title = re.search(r'<h2[^>]*>(.*?)</h2>', b, re.S)
        kick = re.search(r'c-story__kicker[^>]*>(.*?)</a>', b, re.S)
        summ = re.search(r'c-story__summary[^>]*>(.*?)</p>', b, re.S)
        when = re.search(r'c-story__byline[^>]*>(.*?)</span>', b, re.S)
        clean = lambda x: html.unescape(re.sub(r"\s+", " ", re.sub("<[^>]+>", "", x.group(1)))).strip() if x else ""
        out.append({"url": "https://www.romatoday.it" + link.group(1) if link.group(1).startswith("/") else link.group(1),
                    "title": clean(title), "kicker": clean(kick), "summary": clean(summ), "ago": clean(when)})
    return out

cards = {}
if os.path.exists(OUT):
    for c in json.load(open(OUT)):
        cards[c["url"]] = c
for t in TAGS:
    p = 1
    while p < 60:
        url = f"https://www.romatoday.it/tag/{t}/" + (f"pag/{p}/" if p > 1 else "")
        h = get(url)
        got = parse(h)
        new = 0
        for c in got:
            if c["url"] not in cards:
                c["tags"] = [t]
                cards[c["url"]] = c
                new += 1
            elif t not in cards[c["url"]].setdefault("tags", []):
                cards[c["url"]]["tags"].append(t)
        print(t, p, len(got), "new", new, file=sys.stderr)
        if not got or f"/tag/{t}/pag/{p+1}/" not in h:
            break
        p += 1
        time.sleep(0.4)
json.dump(list(cards.values()), open(OUT, "w"), ensure_ascii=False, indent=1)
print(len(cards), "cards", file=sys.stderr)
