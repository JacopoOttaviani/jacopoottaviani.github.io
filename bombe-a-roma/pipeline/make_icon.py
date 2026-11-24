"""Project icon, version 2 "bomba carta" (chosen 2026-11-24): a hand-wrapped paper tube, taped across,
with a small Colosseum printed on it (added at his request) and a burning fuse.
Writes logo-inline.svg (classes coloured by the page tokens; the fuse and spark are SMIL animations,
paused by the page script under prefers-reduced-motion) and icon.svg (static, fixed colours, for favicons).
PNGs: sips -s format png -Z 32 icon.svg --out icon-32.png ; sips -s format png -Z 150 icon.svg --out a.png &&
      sips --padToHeightWidth 180 180 --padColor FFFFFF a.png --out apple-touch-icon.png"""
import math

def star(r_out, r_in, n, jitter=0.0, seed=1):
    import random
    rnd = random.Random(seed)
    pts = []
    for k in range(2 * n):
        r = (r_out if k % 2 == 0 else r_in) * (1 + rnd.uniform(-jitter, jitter) if jitter else 1)
        a = -math.pi / 2 + math.pi * k / n
        pts.append(f"{r*math.cos(a):.1f},{r*math.sin(a):.1f}")
    return "M" + " L".join(pts) + "Z"

BODY = "M29 39 Q 27 63 30 89 Q 48 93 67 88 Q 70 63 67 38 Q 48 35 29 39 Z"        # slightly uneven tube
TUFT = "M31 40 L 35 30 L 40 35 L 44 26 L 48 33 L 53 25 L 56 34 L 61 29 L 65 39 Q 48 36 31 40 Z"  # twisted paper end
FUSE = "M48 31 C 47 21 58 22 58 14 C 58 7 65 3 72 6"
FUSE_REV = "M72 6 C 65 3 58 7 58 14 C 58 22 47 21 48 31"
TAPES = ["M22 50 L 76 72", "M22 74 L 76 50"]                                       # packing tape across
BAND = "M27 80 Q 48 84 70 79"
COLO_OUT = "M34 76 L34 53 Q 44 50.5 54 51.5 L54 56 L58 56 L58 60 L62 60 L62 76 Z"
COLO_TIERS = "M34 70 H62 M34 64 H62 M34 58 H58"
def _arches(xs, base, top):
    return " ".join(f"M{x} {base} V{top} a1.5 1.5 0 0 1 3 0 V{base}" for x in xs)
COLO_ARCHES = " ".join([_arches([36.5, 41, 45.5, 50, 54.5, 58.5], 76, 73), _arches([36.5, 41, 45.5, 50, 54.5, 58.5], 70, 67), _arches([36.5, 41, 45.5, 50, 54.5], 64, 61)])
COLO_WINDOWS = "M37.5 54.5 h1.6 v1.6 h-1.6 Z M43.5 54 h1.6 v1.6 h-1.6 Z M49.5 54 h1.6 v1.6 h-1.6 Z"
SPARK = star(7, 2.6, 8)
FLASH = star(13, 5, 9, jitter=.18, seed=4)

def inline():
    tapes = "".join(f'<path class="bc-tape" d="{d}"/>' for d in TAPES)
    return f'''<svg class="logo" viewBox="0 0 100 100" role="img" aria-label="Icona del progetto: una bomba carta di carta da pacchi fasciata col nastro, con un piccolo Colosseo disegnato sopra e la miccia accesa">
<defs><clipPath id="bc-clip"><path d="{BODY}" transform="rotate(-16 48 62)"/></clipPath></defs>
<g transform="rotate(-16 48 62)">
  <path class="bc-body" d="{BODY}"/>
</g>
<g clip-path="url(#bc-clip)"><g transform="rotate(-16 48 62)">{tapes}<path class="bc-band" d="{BAND}"/></g></g>
<g transform="rotate(-16 48 62)">
  <path class="bc-colo" d="{COLO_OUT}"/>
  <path class="bc-colo-line" d="{COLO_TIERS}"/>
  <path class="bc-colo-arch" d="{COLO_ARCHES}"/>
  <path class="bc-colo-win" d="{COLO_WINDOWS}"/>
  <path class="bc-outline" d="{BODY}"/>
  <path class="bc-tuft" d="{TUFT}"/>
  <path class="bc-fuse" d="{FUSE}" pathLength="100" stroke-dasharray="100 100">
    <animate attributeName="stroke-dashoffset" dur="5s" repeatCount="indefinite" values="0;76;76;0" keyTimes="0;0.84;0.93;1"/>
  </path>
  <g transform="translate(48 31)"><g class="bc-flash"><path d="{FLASH}"/>
    <animateTransform attributeName="transform" type="scale" dur="5s" repeatCount="indefinite" values="0;0;1.2;0.6;0" keyTimes="0;0.83;0.87;0.92;1"/>
    <animate attributeName="opacity" dur="5s" repeatCount="indefinite" values="0;0;1;0;0" keyTimes="0;0.83;0.86;0.93;1"/></g></g>
  <g class="bc-spark">
    <circle class="bc-glow" r="5.5"/><g><path d="{SPARK}"/>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.7s" repeatCount="indefinite"/></g>
    <circle class="bc-core" r="1.9"/>
    <animateMotion dur="5s" repeatCount="indefinite" path="{FUSE_REV}" keyPoints="0;0.76;0.76;0" keyTimes="0;0.84;0.93;1" calcMode="linear"/>
    <animate attributeName="opacity" dur="5s" repeatCount="indefinite" values="1;1;0;0;1" keyTimes="0;0.84;0.85;0.98;1"/>
  </g>
</g>
</svg>'''

def static():
    """Favicon: no animation, the fuse half-burnt with the spark at its end."""
    c = dict(ink="#1A1A1A", kraft="#E4CCA4", kraft2="#D3B588", tape="#B9B5AD", dot="#8C241B", spark="#E2604F")
    tapes = "".join(f'<path d="{d}" stroke="{c["tape"]}" stroke-width="7" opacity=".8" fill="none"/>' for d in TAPES)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<defs><clipPath id="c"><path d="{BODY}" transform="rotate(-16 48 62)"/></clipPath></defs>
<g transform="rotate(-16 48 62)"><path d="{BODY}" fill="{c["kraft"]}"/></g>
<g clip-path="url(#c)"><g transform="rotate(-16 48 62)">{tapes}<path d="{BAND}" stroke="{c["tape"]}" stroke-width="6" opacity=".8" fill="none"/></g></g>
<g transform="rotate(-16 48 62)">
<path d="{COLO_OUT}" fill="{c["kraft2"]}" stroke="{c["ink"]}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="{COLO_TIERS}" stroke="{c["ink"]}" stroke-width="1.8" fill="none"/>
<path d="{_arches([37, 43, 49, 55], 76, 72.5)} {_arches([37, 43, 49, 55], 70, 66.5)} {_arches([37, 43, 49], 64, 60.5)}" stroke="{c["ink"]}" stroke-width="1.5" fill="none"/>
<path d="{BODY}" fill="none" stroke="{c["ink"]}" stroke-width="3.4"/>
<path d="{TUFT}" fill="{c["kraft2"]}" stroke="{c["ink"]}" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M48 31 C 47 21 58 22 58 14" fill="none" stroke="{c["ink"]}" stroke-width="3" stroke-linecap="round"/>
<g transform="translate(58 14)"><circle r="7" fill="#FFD25A" opacity=".55"/><path d="{SPARK}" transform="scale(1.25)" fill="{c["spark"]}"/><circle r="2.2" fill="#FFF3C4"/></g>
</g>
</svg>
'''

if __name__ == "__main__":
    open("logo-inline.svg", "w").write(inline())
    open("icon.svg", "w").write(static())
