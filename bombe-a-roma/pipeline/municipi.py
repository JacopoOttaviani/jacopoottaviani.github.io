"""Fetch the 15 municipi boundaries from Nominatim (simplified polygons) into municipi.json."""
import json, time, urllib.request, urllib.parse
R = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV"]
out = {}
for r in R:
    p = urllib.parse.urlencode({"q": f"Municipio Roma {r}", "format": "jsonv2", "polygon_geojson": 1, "polygon_threshold": 0.0003, "limit": 5, "countrycodes": "it"})
    res = json.loads(urllib.request.urlopen(urllib.request.Request("https://nominatim.openstreetmap.org/search?" + p, headers={"User-Agent": "rome-map-geocoder/1.0"}), timeout=60).read())
    hit = next((x for x in res if x.get("geojson", {}).get("type") in ("Polygon", "MultiPolygon") and x.get("name") == f"Municipio Roma {r}"), None)
    print(r, hit and hit["display_name"][:60], hit and hit["geojson"]["type"])
    if hit: out[f"Municipio {r}"] = hit["geojson"]
    time.sleep(1.2)
json.dump(out, open("data/municipi.json", "w"))
