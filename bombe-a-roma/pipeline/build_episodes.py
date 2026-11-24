"""Build episodes.json from episodes_src.E: ids, defaults, sources filled with outlet/headline/date.
usage: build_episodes.py articles.json ext_check.json out.json"""
import json, sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from episodes_src import E

arts = {a["url"]: a for a in json.load(open(sys.argv[1]))}
ext = json.load(open(sys.argv[2]))
OUTLET = {"romatoday.it": "RomaToday", "agenzianova.com": "Agenzia Nova", "ilpost.it": "Il Post", "open.online": "Open",
          "lapresse.it": "LaPresse", "agi.it": "AGI", "dissapore.com": "Dissapore", "quotidiano.net": "QN Quotidiano.net",
          "ilfattoquotidiano.it": "Il Fatto Quotidiano", "editorialedomani.it": "Domani", "internazionale.it": "Internazionale"}

def outlet(u):
    host = re.sub(r"^https?://(www\.)?", "", u).split("/")[0]
    return OUTLET.get(host, host)

def clean_title(t):
    return re.sub(r"\s+[-|]\s+(LaPresse|Agenzia Nova|Open.*)$", "", t).strip()

out, missing = [], []
E = sorted(E, key=lambda e: (e["data"], e.get("ora") or "99"))
for i, e in enumerate(E, 1):
    e = dict(e)
    e["id"] = f"R{i:03d}"
    e.setdefault("ordigni", 1); e.setdefault("feriti", 0); e.setdefault("morti", 0)
    fonti = []
    for u in e["fonti"]:
        if u in arts:
            a = arts[u]
            fonti.append({"testata": "RomaToday", "titolo": a["title"], "data": a["published"][:10], "url": u})
        elif u in ext and ext[u].get("status") == 200:
            fonti.append({"testata": outlet(u), "titolo": clean_title(ext[u]["title"]), "data": ext[u]["date"][:10], "url": u})
        else:
            missing.append((e["id"], u))
    e["fonti"] = fonti
    out.append(e)
json.dump(out, open(sys.argv[3], "w"), ensure_ascii=False, indent=1)
print(len(out), "episodes;", sum(len(e["fonti"]) for e in out), "sources; missing:", missing)
