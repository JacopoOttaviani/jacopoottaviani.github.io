"""Overpass with a small bbox (s,w,n,e). modes: inter A B | civics STREET | name REGEX. Generic UA."""
import sys, json, urllib.request, urllib.parse
UA = "rome-map-geocoder/1.0"
EPS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]
def run(q):
    data = urllib.parse.urlencode({"data": "[out:json][timeout:25];" + q}).encode()
    for ep in EPS:
        try:
            return json.loads(urllib.request.urlopen(urllib.request.Request(ep, data=data, headers={"User-Agent": UA}), timeout=40).read())
        except Exception as e:
            print("  (", ep.split('/')[2], e, ")")
    return {"elements": []}
mode, bb = sys.argv[1], sys.argv[2]
if mode == "inter":
    q = f'way({bb})["highway"]["name"="{sys.argv[3]}"]->.a;way({bb})["highway"]["name"="{sys.argv[4]}"]->.b;node(w.a)->.na;node(w.b)->.nb;node.na.nb;out;'
    for el in run(q)["elements"]: print(el["lat"], el["lon"])
elif mode == "civics":
    q = f'nwr({bb})["addr:street"="{sys.argv[3]}"]["addr:housenumber"];out center;'
    for el in run(q)["elements"]:
        c = el.get("center", el); print(el["tags"]["addr:housenumber"], c["lat"], c["lon"], el["tags"].get("name", ""))
elif mode == "name":
    q = f'nwr({bb})["name"~"{sys.argv[3]}",i];out center 20;'
    for el in run(q)["elements"]:
        c = el.get("center", el); t = el.get("tags", {}); print(c["lat"], c["lon"], t.get("name"), t.get("amenity", ""), t.get("highway", ""))
