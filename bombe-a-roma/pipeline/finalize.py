"""Merge geocoding + manual fixes into the published dataset.
usage: finalize.py episodes.json overrides.json nominatim_cache.json out_dir
- precision: a civic number counts only if Nominatim actually matched the house number; otherwise 'via'
- municipio: from Nominatim (city_district), via a cached reverse lookup when missing
- checks: every point inside Roma Capitale's loose bbox, every record has >= 1 source"""
import json, sys, csv, time, urllib.request, urllib.parse, os

eps = json.load(open(sys.argv[1]))
ovr = json.load(open(sys.argv[2]))
CACHE = sys.argv[3]
cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
out_dir = sys.argv[4]
UA = "rome-map-geocoder/1.0"

def reverse(lat, lon):
    key = f"rev:{lat:.6f},{lon:.6f}"
    if key not in cache:
        p = urllib.parse.urlencode({"lat": lat, "lon": lon, "format": "jsonv2", "zoom": 16, "addressdetails": 1})
        req = urllib.request.Request("https://nominatim.openstreetmap.org/reverse?" + p, headers={"User-Agent": UA, "Accept-Language": "it"})
        cache[key] = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
        json.dump(cache, open(CACHE, "w"), ensure_ascii=False)
        time.sleep(1.1)
    return cache[key].get("address", {})

MUN = json.load(open(os.path.join(os.path.dirname(sys.argv[1]), "municipi.json")))

def inside(lat, lon, ring):
    c, j = False, len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]; xj, yj = ring[j]
        if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c

def municipio(lat, lon):
    for name, g in MUN.items():
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            if inside(lat, lon, poly[0]) and not any(inside(lat, lon, h) for h in poly[1:]):
                return name
    return ""

def roman(district):
    return district.replace("Municipio Roma ", "Municipio ") if district.startswith("Municipio") else ""

out, problems = [], []
for e in eps:
    g = e.get("geo") or {}
    o = ovr.get(e["id"], {})
    lat, lon = o.get("lat", g.get("lat")), o.get("lon", g.get("lon"))
    prec = o.get("precisione", e["precisione"])
    if "lat" not in o and e["precisione"] == "civico" and not g.get("house"):
        prec = "via"  # civic number not in OpenStreetMap: the point is on the street, not at the door
    if "lat" not in o and e["precisione"] in ("incrocio", "luogo") and "street" in (g.get("used") or {}):
        prec = "via"  # the intersection / named place was not found: fell back to the street
    if lat is None:
        problems.append((e["id"], "no coordinates")); continue
    if not (41.62 < lat < 42.15 and 12.20 < lon < 12.88):
        problems.append((e["id"], "outside Rome bbox"))
    district = o.get("municipio") or municipio(lat, lon)
    if not district:
        problems.append((e["id"], "outside every municipio"))
    if not e["fonti"]:
        problems.append((e["id"], "no sources"))
    rec = {k: e[k] for k in ("id", "data", "ora", "quartiere", "indirizzo")}
    rec["nota_data"] = e.get("nota_data", "")
    rec["municipio"] = district
    rec.update({"lat": round(lat, 6), "lon": round(lon, 6), "precisione": prec, "categoria": e["cat"], "bersaglio": e["bersaglio"],
                "ordigno": e["ordigno"], "ordigni": e["ordigni"], "feriti": e["feriti"], "morti": e["morti"],
                "sintesi": e["sintesi"], "fonti": e["fonti"]})
    if o.get("indirizzo"):
        rec["indirizzo"] = o["indirizzo"]
    out.append(rec)

os.makedirs(out_dir, exist_ok=True)
json.dump(out, open(os.path.join(out_dir, "episodi.json"), "w"), ensure_ascii=False, indent=1)
with open(os.path.join(out_dir, "episodi.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["id", "data", "ora", "nota_data", "quartiere", "municipio", "indirizzo", "precisione", "lat", "lon", "categoria", "bersaglio",
                "ordigno", "ordigni", "feriti", "morti", "sintesi", "fonti_testate", "fonti_url"])
    for r in out:
        w.writerow([r["id"], r["data"], r["ora"], r["nota_data"], r["quartiere"], r["municipio"], r["indirizzo"], r["precisione"], r["lat"], r["lon"],
                    r["categoria"], r["bersaglio"], r["ordigno"], r["ordigni"], r["feriti"], r["morti"], r["sintesi"],
                    " | ".join(s["testata"] for s in r["fonti"]), " | ".join(s["url"] for s in r["fonti"])])
from collections import Counter
print(len(out), "records;", "precision", Counter(r["precisione"] for r in out), "years", Counter(r["data"][:4] for r in out))
print("no municipio:", [r["id"] for r in out if not r["municipio"]])
print("problems:", problems)

# the English edition (../en/ reads it): stops here if an episode has no translation or its summary changed
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from english import write_english
write_english(out, out_dir, os.path.join(os.path.dirname(os.path.abspath(__file__)), "translations_en.json"))
