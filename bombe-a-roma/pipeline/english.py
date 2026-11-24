"""English edition of the dataset, written by finalize.py next to the Italian one: ../data/episodes-en.json and .csv.
The free text of each episode (target, summary, and the address or date note when they contain Italian words) comes from
translations_en.json, keyed on "date|address" (the Italian address as published), because ids are renumbered when an
episode is back-dated. Each entry keeps the Italian summary it was translated from ("it"): when that summary changes,
or an episode has no entry, the build stops and says which ones to translate. Category, precision and device are
translated from the fixed lists below. Article headlines stay in Italian."""
import json, csv, os, sys

CATEGORY = {"Negozio o locale": "Shop or venue", "Palazzo o androne": "Building or entrance hall", "Abitazione privata": "Private home",
            "Auto": "Car", "Sede politica, sociale o religiosa": "Political, social or religious premises", "Istituzioni": "Institutions",
            "Altro": "Other"}
PRECISION = {"civico": "street number", "incrocio": "junction", "luogo": "place", "via": "street", "stimato": "estimated", "zona": "area"}
DEVICE = {"bomba carta": "paper bomb", "bomba carta di grosse dimensioni": "large paper bomb", "ordigno artigianale": "homemade explosive device",
          "ordigno artigianale (in preparazione)": "homemade explosive device (being assembled)", "ordigno rudimentale": "crude explosive device",
          "ordigno di piccole dimensioni": "small explosive device", "ordigno": "explosive device", "ordigno (ipotesi)": "explosive device (suspected)",
          "ordigno non specificato": "unspecified device", "grosso petardo": "large firecracker", "petardo": "firecracker",
          "«bombone»": "“bombone” (big bomb)"}


def write_english(records, out_dir, translations_file):
    tr = {t["key"]: t for t in json.load(open(translations_file, encoding="utf-8"))}
    out, missing, stale, unknown = [], [], [], []
    for r in records:
        key = r["data"] + "|" + r["indirizzo"]
        t = tr.get(key)
        if not t:
            missing.append(f'{r["id"]} {key}'); continue
        if t["it"] != r["sintesi"]:
            stale.append(f'{r["id"]} {key}')
        if r["nota_data"] and not t.get("date_note"):
            missing.append(f'{r["id"]} {key} (date note)')
        for field, table in (("categoria", CATEGORY), ("precisione", PRECISION), ("ordigno", DEVICE)):
            if r[field] not in table:
                unknown.append(f'{field}: {r[field]}')
        out.append({
            "id": r["id"], "date": r["data"], "time": r["ora"], "date_note": t.get("date_note", ""),
            "neighbourhood": r["quartiere"], "municipio": r["municipio"], "address": t.get("address", r["indirizzo"]),
            "precision": PRECISION.get(r["precisione"], ""), "lat": r["lat"], "lon": r["lon"],
            "category": CATEGORY.get(r["categoria"], ""), "target": t["target"], "device": DEVICE.get(r["ordigno"], ""),
            "devices": r["ordigni"], "injured": r["feriti"], "killed": r["morti"], "summary": t["summary"],
            "sources": [{"outlet": s["testata"], "title": s["titolo"], "date": s["data"], "url": s["url"]} for s in r["fonti"]],
        })
    if missing or stale or unknown:
        print("English edition NOT written. Add or update pipeline/translations_en.json (and the tables in english.py):", file=sys.stderr)
        for label, items in (("no translation", missing), ("Italian summary changed since translation", stale), ("value not in the tables", sorted(set(unknown)))):
            for i in items:
                print(f"  {label}: {i}", file=sys.stderr)
        sys.exit(1)
    json.dump(out, open(os.path.join(out_dir, "episodes-en.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with open(os.path.join(out_dir, "episodes-en.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "date", "time", "date_note", "neighbourhood", "municipio", "address", "precision", "lat", "lon", "category", "target",
                    "device", "devices", "injured", "killed", "summary", "source_outlets", "source_urls"])
        for r in out:
            w.writerow([r["id"], r["date"], r["time"], r["date_note"], r["neighbourhood"], r["municipio"], r["address"], r["precision"], r["lat"], r["lon"],
                        r["category"], r["target"], r["device"], r["devices"], r["injured"], r["killed"], r["summary"],
                        " | ".join(s["outlet"] for s in r["sources"]), " | ".join(s["url"] for s in r["sources"])])
    print(len(out), "records in the English edition")
