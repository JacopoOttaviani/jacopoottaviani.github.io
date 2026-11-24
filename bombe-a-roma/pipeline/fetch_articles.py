"""Fetch RomaToday article pages (cached) and extract date, title, summary, body, in-body links.
usage: fetch_articles.py urls.txt out.json cache_dir"""
import json, re, sys, time, html, os, hashlib, urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
urls_file, out, cache = sys.argv[1:4]
os.makedirs(cache, exist_ok=True)

def get(url):
    fn = os.path.join(cache, hashlib.md5(url.encode()).hexdigest() + ".html")
    if os.path.exists(fn):
        return open(fn, encoding="utf-8", errors="ignore").read()
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            h = r.read().decode("utf-8", "ignore")
    except Exception as e:
        print("ERR", url, e, file=sys.stderr)
        return ""
    open(fn, "w", encoding="utf-8").write(h)
    time.sleep(0.4)
    return h

def text(fragment):
    fragment = re.sub(r"<script.*?</script>|<style.*?</style>|<figure.*?</figure>", "", fragment, flags=re.S)
    fragment = re.sub(r"<(p|h2|h3|li|br|div)[^>]*>", "\n", fragment)
    t = html.unescape(re.sub(r"<[^>]+>", "", fragment))
    t = re.sub(r"[ \t\xa0]+", " ", t)
    return re.sub(r"\n\s*\n+", "\n", t).strip()

res = {}
if os.path.exists(out):
    for a in json.load(open(out)):
        res[a["url"]] = a
for url in [u.strip() for u in open(urls_file) if u.strip()]:
    if url in res:
        continue
    h = get(url)
    if not h:
        continue
    a = {"url": url}
    m = re.search(r'"datePublished"\s*:\s*"([^"]+)"', h)
    a["published"] = m.group(1) if m else ""
    m = re.search(r'<h1[^>]*>(.*?)</h1>', h, re.S)
    a["title"] = text(m.group(1)) if m else ""
    m = re.search(r'class="l-entry__summary[^"]*"[^>]*>(.*?)</(?:p|h2|div)>', h, re.S)
    a["summary"] = text(m.group(1)) if m else ""
    i = h.find('class="c-entry"')
    j = h.find('l-entry__footer', i)
    body = h[i:j] if i > 0 else ""
    a["paywall"] = "riservato agli abbonati" in h
    a["body"] = text(body[body.find(">") + 1:])
    a["links"] = sorted(set(re.findall(r'href="(https://www\.romatoday\.it/[a-z]+/[^"#?]+\.html)"', body)))
    res[url] = a
    print(len(res), a["published"][:10], a["title"][:80], file=sys.stderr)
json.dump(list(res.values()), open(out, "w"), ensure_ascii=False, indent=1)
