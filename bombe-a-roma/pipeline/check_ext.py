"""Fetch external source URLs; print HTTP status, published date and headline (og:title) for each. usage: check_ext.py urls.txt out.json"""
import sys, re, json, html, urllib.request, time
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
res = {}
for u in [l.strip() for l in open(sys.argv[1]) if l.strip()]:
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=30)
        h = r.read().decode("utf-8", "ignore")
        st = r.status
    except Exception as e:
        res[u] = {"status": str(e)[:40]}
        print("ERR", u, e)
        continue
    d = re.search(r'"datePublished"\s*:\s*"([^"]+)"', h) or re.search(r'article:published_time"\s+content="([^"]+)"', h)
    t = re.search(r'property="og:title"\s+content="([^"]+)"', h) or re.search(r'<title>(.*?)</title>', h, re.S)
    res[u] = {"status": st, "date": d.group(1)[:16] if d else "", "title": html.unescape(t.group(1)).strip() if t else ""}
    print(st, res[u]["date"], "|", res[u]["title"][:100], "|", u[:90])
    time.sleep(0.3)
json.dump(res, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
