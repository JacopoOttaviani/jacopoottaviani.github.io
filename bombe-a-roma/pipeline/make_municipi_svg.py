"""Writes ../municipi.json, the 15 municipi as SVG paths for the small map in the charts section of the page, from the OSM
boundaries in municipi.json. Coordinates are projected (equirectangular, scaled by cos 41.9°) onto a 560-wide box and simplified
(Douglas-Peucker, 0.6 px); each municipio gets a label point (the inside point farthest from its edge). The projection is stored
in the file so that app.js places the episodes with the same formula. Rerun only if municipi.json changes.
usage: python3 make_municipi_svg.py"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
mun = json.load(open(os.path.join(HERE, "municipi.json"), encoding="utf-8"))
ROMAN = "I II III IV V VI VII VIII IX X XI XII XIII XIV XV".split()

pts = [p for g in mun.values() for poly in ([g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]) for ring in poly for p in ring]
minlon, maxlon = min(p[0] for p in pts), max(p[0] for p in pts)
minlat, maxlat = min(p[1] for p in pts), max(p[1] for p in pts)
C = math.cos(math.radians(41.9))
W, PAD = 560, 10
K = (W - 2 * PAD) / ((maxlon - minlon) * C)
H = round((maxlat - minlat) * K + 2 * PAD)
proj = lambda lon, lat: (round(PAD + (lon - minlon) * C * K, 1), round(PAD + (maxlat - lat) * K, 1))

def dp(p, tol):
    if len(p) < 3: return p
    a, b = p[0], p[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-9
    best, bi = -1, 0
    for i in range(1, len(p) - 1):
        d = abs(dy * p[i][0] - dx * p[i][1] + b[0] * a[1] - b[1] * a[0]) / L
        if d > best: best, bi = d, i
    return dp(p[:bi + 1], tol)[:-1] + dp(p[bi:], tol) if best > tol else [a, b]

def dp_ring(r, tol):  # a closed ring is split at its farthest point from the start, so both halves have distinct ends
    far = max(range(len(r)), key=lambda i: math.hypot(r[i][0] - r[0][0], r[i][1] - r[0][1]))
    return dp(r[:far + 1], tol)[:-1] + dp(r[far:], tol)

def area(r): return abs(sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1))) / 2

def inside(pt, r):
    x, y = pt; n = False
    for i in range(len(r) - 1):
        (x0, y0), (x1, y1) = r[i], r[i + 1]
        if (y0 > y) != (y1 > y) and x < (x1 - x0) * (y - y0) / (y1 - y0) + x0: n = not n
    return n

def edge_dist(pt, r):
    best = 1e9
    for i in range(len(r) - 1):
        (ax, ay), (bx, by) = r[i], r[i + 1]; dx, dy = bx - ax, by - ay; L = dx * dx + dy * dy or 1e-9
        t = max(0, min(1, ((pt[0] - ax) * dx + (pt[1] - ay) * dy) / L))
        best = min(best, math.hypot(ax + t * dx - pt[0], ay + t * dy - pt[1]))
    return best

out = {"w": W, "h": H, "proj": {"minlon": minlon, "maxlat": maxlat, "c": C, "k": K, "pad": PAD}, "municipi": {}}
for name, g in mun.items():
    r_name = name.replace("Municipio ", "")
    assert r_name in ROMAN, name
    parts, biggest = [], None
    for poly in ([g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]):
        for j, ring in enumerate(poly):
            pr = [proj(*p) for p in ring]
            if pr[0] != pr[-1]: pr.append(pr[0])
            pr = dp_ring(pr, 0.6)
            parts.append("M" + "L".join(f"{x:g},{y:g}" for x, y in pr[:-1]) + "Z")
            if j == 0 and (biggest is None or area(pr) > area(biggest)): biggest = pr
    xs, ys = [p[0] for p in biggest], [p[1] for p in biggest]
    lab = max(((edge_dist(pt, biggest), pt) for pt in ((min(xs) + (max(xs) - min(xs)) * i / 60, min(ys) + (max(ys) - min(ys)) * j / 60)
               for i in range(61) for j in range(61)) if inside(pt, biggest)))[1]
    out["municipi"][r_name] = {"d": "".join(parts), "lx": round(lab[0], 1), "ly": round(lab[1], 1)}
out["municipi"] = {r: out["municipi"][r] for r in ROMAN}
path = os.path.join(HERE, "..", "municipi.json")
open(path, "w", encoding="utf-8").write(json.dumps(out, separators=(",", ":")))
print("municipi.json written,", W, "x", H, ",", os.path.getsize(path), "bytes")
