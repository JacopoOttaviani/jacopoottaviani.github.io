"""Builds the province layer: ../data/provincia.json|csv (Italian) and ../data/provincia-en.json|csv (English), read by app.js
behind the "Provincia" map button. The Rome dataset and its R ids are not touched.
usage: python3 provincia.py
Inputs, all in this folder:
- provincia_src.py   the hand-checked list (same rules as episodes_src.py, plus `comune`)
- articoli_indice.json  headline and date of the RomaToday sources; provincia_fonti.json  outlet, headline and date of the others
- provincia_geo.json  coordinates keyed on "date|address", with where each one comes from (`fonte_geo`). A key that is missing is
  looked up once on Nominatim (free text, Italy) and saved here: check it before publishing, since the lookup is not bounded to a comune
- provincia_en.json   English text keyed like the coordinates, with the Italian summary it was translated from ("it"); the build
  stops if an entry is missing or its Italian summary changed. Category, precision and device come from the tables in english.py
Ids are P001, P002... by date and time, so adding an episode can renumber them: nothing else is keyed on them."""
import csv, json, os, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from provincia_src import E
from english import CATEGORY, PRECISION, DEVICE

OUT = os.path.join(HERE, "..", "data")
P = lambda f: os.path.join(HERE, f)
arts = {a["url"]: a for a in json.load(open(P("articoli_indice.json"), encoding="utf-8"))}
ext = json.load(open(P("provincia_fonti.json"), encoding="utf-8"))
geo = json.load(open(P("provincia_geo.json"), encoding="utf-8")) if os.path.exists(P("provincia_geo.json")) else {}
tr = {t["key"]: t for t in json.load(open(P("provincia_en.json"), encoding="utf-8"))}


def nominatim(q):
    p = urllib.parse.urlencode({"q": q, "format": "jsonv2", "limit": 1, "countrycodes": "it"})
    req = urllib.request.Request("https://nominatim.openstreetmap.org/search?" + p, headers={"User-Agent": "rome-map-geocoder/1.0", "Accept-Language": "it"})
    res = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
    time.sleep(1.1)
    return res[0] if res else None


problems, out = [], []
for e in sorted(E, key=lambda e: (e["data"], e.get("ora") or "99")):
    k = e["data"] + "|" + e["indirizzo"]
    if k not in geo:
        for q in e["q"]:
            hit = nominatim(q["q"])
            if hit:
                geo[k] = {"lat": round(float(hit["lat"]), 6), "lon": round(float(hit["lon"]), 6), "fonte_geo": "Nominatim: " + hit["display_name"][:120]}
                print("geocoded, check it:", k, "->", geo[k]["fonte_geo"], file=sys.stderr)
                break
        else:
            problems.append(f"no coordinates: {k}"); continue
    fonti = []
    for u in e["fonti"]:
        if u in arts:
            fonti.append({"testata": "RomaToday", "titolo": arts[u]["title"], "data": arts[u]["published"][:10], "url": u})
        elif u in ext:
            fonti.append({**ext[u], "url": u})
        else:
            problems.append(f"source without headline: {u}")
    g = geo[k]
    out.append({"id": "", "data": e["data"], "ora": e["ora"], "quartiere": e["quartiere"], "indirizzo": e["indirizzo"], "nota_data": e.get("nota_data", ""),
                "comune": e["comune"], "municipio": "", "lat": g["lat"], "lon": g["lon"], "precisione": e["precisione"], "categoria": e["cat"],
                "bersaglio": e["bersaglio"], "ordigno": e["ordigno"], "ordigni": e.get("ordigni", 1), "feriti": e.get("feriti", 0), "morti": e.get("morti", 0),
                "sintesi": e["sintesi"], "fonti": fonti})
for i, r in enumerate(out, 1):
    r["id"] = f"P{i:03d}"
json.dump(geo, open(P("provincia_geo.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# English edition
en = []
for r in out:
    k = r["data"] + "|" + r["indirizzo"]
    t = tr.get(k)
    if not t:
        problems.append(f"no English entry: {r['id']} {k}"); continue
    if t["it"] != r["sintesi"]:
        problems.append(f"Italian summary changed since translation: {r['id']} {k}")
    if r["nota_data"] and not t.get("date_note"):
        problems.append(f"no English date note: {r['id']} {k}")
    for field, table in (("categoria", CATEGORY), ("precisione", PRECISION), ("ordigno", DEVICE)):
        if r[field] not in table:
            problems.append(f"{field} not in the english.py tables: {r[field]}")
    en.append({"id": r["id"], "date": r["data"], "time": r["ora"], "date_note": t.get("date_note", ""), "neighbourhood": r["quartiere"],
               "comune": r["comune"], "municipio": "", "address": t.get("address", r["indirizzo"]), "precision": PRECISION.get(r["precisione"], ""),
               "lat": r["lat"], "lon": r["lon"], "category": CATEGORY.get(r["categoria"], ""), "target": t["target"], "device": DEVICE.get(r["ordigno"], ""),
               "devices": r["ordigni"], "injured": r["feriti"], "killed": r["morti"], "summary": t["summary"],
               "sources": [{"outlet": s["testata"], "title": s["titolo"], "date": s["data"], "url": s["url"]} for s in r["fonti"]]})
if problems:
    print("Province data NOT written:", *problems, sep="\n  ", file=sys.stderr)
    sys.exit(1)

json.dump(out, open(os.path.join(OUT, "provincia.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
with open(os.path.join(OUT, "provincia.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["id", "data", "ora", "nota_data", "comune", "quartiere", "indirizzo", "precisione", "lat", "lon", "categoria", "bersaglio",
                "ordigno", "ordigni", "feriti", "morti", "sintesi", "fonti_testate", "fonti_url"])
    for r in out:
        w.writerow([r["id"], r["data"], r["ora"], r["nota_data"], r["comune"], r["quartiere"], r["indirizzo"], r["precisione"], r["lat"], r["lon"],
                    r["categoria"], r["bersaglio"], r["ordigno"], r["ordigni"], r["feriti"], r["morti"], r["sintesi"],
                    " | ".join(s["testata"] for s in r["fonti"]), " | ".join(s["url"] for s in r["fonti"])])
json.dump(en, open(os.path.join(OUT, "provincia-en.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
with open(os.path.join(OUT, "provincia-en.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["id", "date", "time", "date_note", "comune", "neighbourhood", "address", "precision", "lat", "lon", "category", "target",
                "device", "devices", "injured", "killed", "summary", "source_outlets", "source_urls"])
    for r in en:
        w.writerow([r["id"], r["date"], r["time"], r["date_note"], r["comune"], r["neighbourhood"], r["address"], r["precision"], r["lat"], r["lon"],
                    r["category"], r["target"], r["device"], r["devices"], r["injured"], r["killed"], r["summary"],
                    " | ".join(s["outlet"] for s in r["sources"]), " | ".join(s["url"] for s in r["sources"])])
print(len(out), "province records,", sum(len(r["fonti"]) for r in out), "sources; Italian and English written")
