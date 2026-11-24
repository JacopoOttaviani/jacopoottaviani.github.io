"""Geocode episode addresses with Nominatim (1 req/s, cached, generic UA).
usage: geocode.py episodes.json cache.json
Each episode has `q` = list of queries tried in order, e.g.
  {"street": "via Casilina 953"}   -> structured street query in Roma
  {"q": "Parco degli Acquedotti, Roma"} -> free text
Writes lat/lon/osm_display back into episodes.json under `geo`."""
import json, sys, time, urllib.request, urllib.parse, os

UA = "rome-map-geocoder/1.0"
EP, CACHE = sys.argv[1], sys.argv[2]
cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
BBOX = (41.62, 12.20, 42.15, 12.88)  # Roma Capitale, loose

def nom(params):
    params = dict(params, format="jsonv2", addressdetails=1, limit=3, countrycodes="it",
                  viewbox="12.20,42.15,12.88,41.62", bounded=1)
    key = urllib.parse.urlencode(sorted(params.items()))
    if key in cache:
        return cache[key]
    url = "https://nominatim.openstreetmap.org/search?" + key
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "it"})
    with urllib.request.urlopen(req, timeout=30) as r:
        res = json.loads(r.read().decode())
    cache[key] = res
    json.dump(cache, open(CACHE, "w"), ensure_ascii=False)
    time.sleep(1.1)
    return res

eps = json.load(open(EP))
for e in eps:
    if e.get("geo", {}).get("manual"):
        continue
    hit = None
    for q in e["q"]:
        if "street" in q:
            res = nom({"street": q["street"], "city": "Roma"})
        else:
            res = nom({"q": q["q"]})
        if res:
            r = res[0]
            a = r.get("address", {})
            hit = {"lat": round(float(r["lat"]), 6), "lon": round(float(r["lon"]), 6), "used": q,
                   "osm": r.get("display_name", "")[:160], "type": r.get("addresstype", r.get("type")),
                   "suburb": a.get("suburb") or a.get("quarter") or a.get("neighbourhood") or "", "district": a.get("city_district", ""), "city": a.get("city", a.get("town", "")),
                   "road": a.get("road", ""), "house": a.get("house_number", "")}
            break
    e["geo"] = hit or {}
    print(e["id"], "->", (hit or {}).get("road"), (hit or {}).get("house"), "|", (hit or {}).get("suburb"), "|", (hit or {}).get("used"), file=sys.stderr)
json.dump(eps, open(EP, "w"), ensure_ascii=False, indent=1)
