"""
Generates consistent, hand-authored placeholder SVG assets for the portfolio
sample case studies. All marks are original simple geometric compositions
(no real brands / no copyrighted material). Every mockup shares the same
backdrop tone, shadow treatment and framing so the works grid reads as one
coherent shoot, per the brief's "unified image style" requirement.
"""
import os

OUT = "/home/claude/portfolio/assets/img"
os.makedirs(OUT, exist_ok=True)

BACKDROP = "#ECECE6"   # shared neutral mockup backdrop across all projects
SHADOW_OP = "0.16"

def shadow_defs(idb="shadow"):
    return f'''<filter id="{idb}" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="{SHADOW_OP}"/>
    </filter>'''

# ---------- brand marks (original geometric compositions) ----------

def mark_kedr(color, cx, cy, s=1.0):
    # abstract conifer: three stacked triangles + trunk
    return f'''
    <g transform="translate({cx},{cy}) scale({s})" fill="{color}">
      <path d="M0,-70 L34,-14 L-34,-14 Z"/>
      <path d="M0,-36 L46,26 L-46,26 Z"/>
      <path d="M0,0 L58,66 L-58,66 Z"/>
      <rect x="-7" y="66" width="14" height="26" />
    </g>'''

def mark_fabrika(color, cx, cy, s=1.0):
    # rounded badge with cut corner + numeral 12
    return f'''
    <g transform="translate({cx},{cy}) scale({s})">
      <path d="M-70,-58 L46,-58 Q70,-58 70,-34 L70,58 Q70,70 58,70 L-70,70 Q-70,70 -70,58 Z"
            fill="none" stroke="{color}" stroke-width="7"/>
      <path d="M46,-58 L70,-34 L46,-34 Z" fill="{color}"/>
      <text x="0" y="24" font-family="Fraunces, serif" font-weight="600" font-size="72"
            text-anchor="middle" fill="{color}">12</text>
    </g>'''

def mark_argo(color, cx, cy, s=1.0):
    # continuous wave curling into a hook (wave/anchor hybrid), monoline
    return f'''
    <g transform="translate({cx},{cy}) scale({s})" fill="none" stroke="{color}" stroke-width="9" stroke-linecap="round">
      <path d="M-74,10 C-50,-34 -18,-34 0,10 C18,54 50,54 74,10"/>
      <path d="M0,10 C0,40 -22,58 -22,58 C-22,74 -4,78 8,66"/>
    </g>'''

MARKS = {"kedr": mark_kedr, "fabrika-12": mark_fabrika, "argo": mark_argo}

WORDMARKS = {
    "kedr": ("КЕДР", "#3E4A34"),
    "fabrika-12": ("ФАБРИКА 12", "#2B2B27"),
    "argo": ("АРГО", "#123A3E"),
}

COLORS = {"kedr": "#5C7A52", "fabrika-12": "#E1592C", "argo": "#1F5C57"}
SURFACE = {"kedr": "#D8CBB0", "fabrika-12": "#F4F1EA", "argo": "#F2F5F4"}  # kraft / paper / sea-mist

def cover(slug, w=1200, h=860):
    color = COLORS[slug]
    word, wcolor = WORDMARKS[slug]
    mark = MARKS[slug](("#FFFFFF" if slug != "kedr" else "#F6F1E4"), w/2, h/2 - 40, 1.35)
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Обложка проекта {word}">
  <rect width="{w}" height="{h}" fill="{color}"/>
  {mark}
  <text x="{w/2}" y="{h-90}" font-family="IBM Plex Mono, monospace" font-size="22" letter-spacing="6"
        text-anchor="middle" fill="#FFFFFF" opacity="0.9">{word}</text>
</svg>'''

def mockup_card(slug, w=800, h=600):
    color = COLORS[slug]; surface = SURFACE[slug]
    word, wcolor = WORDMARKS[slug]
    mark = MARKS[slug](color, 220, 300, 0.42)
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Мокап визитки {word}">
  <defs>{shadow_defs()}</defs>
  <rect width="{w}" height="{h}" fill="{BACKDROP}"/>
  <g filter="url(#shadow)">
    <rect x="140" y="220" width="340" height="200" rx="10" fill="{surface}"/>
  </g>
  {mark}
  <text x="220" y="330" font-family="IBM Plex Mono, monospace" font-size="13" letter-spacing="2"
        text-anchor="middle" fill="{wcolor}">{word}</text>
  <g filter="url(#shadow)" transform="translate(60,60) rotate(-6)">
    <rect x="140" y="220" width="340" height="200" rx="10" fill="{surface}" opacity="0.55"/>
  </g>
</svg>'''

def mockup_sign(slug, w=800, h=600):
    color = COLORS[slug]; surface = SURFACE[slug]
    word, wcolor = WORDMARKS[slug]
    mark = MARKS[slug](color, 400, 250, 0.5)
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Мокап вывески {word}">
  <defs>{shadow_defs("shadow2")}</defs>
  <rect width="{w}" height="{h}" fill="{BACKDROP}"/>
  <rect x="0" y="420" width="{w}" height="180" fill="#DADAD2"/>
  <g filter="url(#shadow2)">
    <rect x="220" y="150" width="360" height="220" rx="6" fill="{surface}"/>
  </g>
  {mark}
  <text x="400" y="345" font-family="IBM Plex Mono, monospace" font-size="15" letter-spacing="4"
        text-anchor="middle" fill="{wcolor}">{word}</text>
  <rect x="150" y="360" width="18" height="80" fill="#BFBFB6"/>
  <rect x="632" y="360" width="18" height="80" fill="#BFBFB6"/>
</svg>'''

def mockup_pack(slug, w=800, h=600):
    color = COLORS[slug]; surface = SURFACE[slug]
    word, wcolor = WORDMARKS[slug]
    mark = MARKS[slug](color, 400, 250, 0.34)
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Мокап упаковки {word}">
  <defs>{shadow_defs("shadow3")}</defs>
  <rect width="{w}" height="{h}" fill="{BACKDROP}"/>
  <g filter="url(#shadow3)">
    <path d="M300,150 L500,150 L520,420 L280,420 Z" fill="{surface}"/>
    <path d="M300,150 L500,150 L510,180 L290,180 Z" fill="{surface}" opacity="0.6"/>
  </g>
  {mark}
  <text x="400" y="330" font-family="IBM Plex Mono, monospace" font-size="13" letter-spacing="3"
        text-anchor="middle" fill="{wcolor}">{word}</text>
</svg>'''

def mockup_screen(slug, w=800, h=600):
    color = COLORS[slug]; surface = SURFACE[slug]
    word, wcolor = WORDMARKS[slug]
    mark = MARKS[slug](color, 400, 260, 0.3)
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Мокап цифрового экрана {word}">
  <defs>{shadow_defs("shadow4")}</defs>
  <rect width="{w}" height="{h}" fill="{BACKDROP}"/>
  <g filter="url(#shadow4)">
    <rect x="230" y="120" width="340" height="380" rx="28" fill="#2B2B27"/>
    <rect x="246" y="150" width="308" height="320" rx="4" fill="{surface}"/>
  </g>
  {mark}
  <text x="400" y="360" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="3"
        text-anchor="middle" fill="{wcolor}">{word}</text>
  <rect x="370" y="470" width="60" height="8" rx="4" fill="#4A4A44"/>
</svg>'''

def sketch_kedr(w=700, h=520):
    # rough exploration: whole-tree silhouette (later simplified to 3 tiers)
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ранний эскиз: дерево целиком">
  <rect width="{w}" height="{h}" fill="#F7F7F4"/>
  <g transform="translate({w/2},{h/2+40})" fill="none" stroke="#1B1B16" stroke-width="2.4">
    <path d="M0,-190 L26,-120 L10,-120 L44,-56 L22,-56 L64,20 L-64,20 L-22,-56 L-44,-56 L-10,-120 L-26,-120 Z"/>
    <rect x="-9" y="20" width="18" height="34"/>
  </g>
</svg>'''

def sketch_kedr2(w=700, h=520):
    # refined: the three isolated tiers, close to final
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Финальный вариант: три яруса хвои">
  <rect width="{w}" height="{h}" fill="#F7F7F4"/>
  <g transform="translate({w/2},{h/2+30}) scale(1.5)" fill="none" stroke="#1B1B16" stroke-width="2.4">
    <path d="M0,-70 L34,-14 L-34,-14 Z"/>
    <path d="M0,-36 L46,26 L-46,26 Z"/>
    <path d="M0,0 L58,66 L-58,66 Z"/>
    <rect x="-7" y="66" width="14" height="26"/>
  </g>
</svg>'''

def sketch_fabrika1(w=700, h=520):
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ранний эскиз: полный квадрат без среза угла">
  <rect width="{w}" height="{h}" fill="#F7F7F4"/>
  <g transform="translate({w/2},{h/2}) scale(1.15)" fill="none" stroke="#1B1B16" stroke-width="2.4">
    <rect x="-70" y="-58" width="140" height="128" rx="14"/>
    <text x="0" y="24" font-family="Fraunces, serif" font-weight="600" font-size="72" text-anchor="middle" fill="#1B1B16" stroke="none">12</text>
  </g>
</svg>'''

def sketch_fabrika2(w=700, h=520):
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Финальный вариант: срезанный угол как деталь">
  <rect width="{w}" height="{h}" fill="#F7F7F4"/>
  {mark_fabrika("#1B1B16", w/2, h/2, 1.15)}
</svg>'''

def sketch_argo1(w=700, h=520):
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ранний эскиз: волна и отдельный якорь">
  <rect width="{w}" height="{h}" fill="#F7F7F4"/>
  <g transform="translate({w/2},{h/2}) scale(1.1)" fill="none" stroke="#1B1B16" stroke-width="2.4" stroke-linecap="round">
    <path d="M-90,-10 C-60,-40 -30,-40 0,-10 C30,20 60,20 90,-10"/>
    <path d="M0,40 L0,86 M-14,74 L0,88 L14,74"/>
  </g>
</svg>'''

def sketch_argo2(w=700, h=520):
    return f'''<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Финальный вариант: волна и якорь как одна линия">
  <rect width="{w}" height="{h}" fill="#F7F7F4"/>
  {mark_argo("#1B1B16", w/2, h/2, 1.1)}
</svg>'''

SKETCHES = {
    "kedr": (sketch_kedr, sketch_kedr2),
    "fabrika-12": (sketch_fabrika1, sketch_fabrika2),
    "argo": (sketch_argo1, sketch_argo2),
}

BUILDERS = {
    "cover": cover,
    "mockup-1": mockup_card,
    "mockup-2": mockup_sign,
    "mockup-3": mockup_pack,
    "mockup-4": mockup_screen,
}

for slug in MARKS:
    for name, fn in BUILDERS.items():
        svg = fn(slug)
        with open(os.path.join(OUT, f"{slug}-{name}.svg"), "w", encoding="utf-8") as f:
            f.write(svg)
    s1, s2 = SKETCHES[slug]
    with open(os.path.join(OUT, f"{slug}-sketch-1.svg"), "w", encoding="utf-8") as f:
        f.write(s1())
    with open(os.path.join(OUT, f"{slug}-sketch-2.svg"), "w", encoding="utf-8") as f:
        f.write(s2())

# ---------- about-page avatar (site chrome palette, not project colors) ----------
avatar = '''<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Портрет-плейсхолдер">
  <defs>
    <filter id="ashadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="400" height="400" fill="#EFEFEA"/>
  <g filter="url(#ashadow)">
    <circle cx="200" cy="170" r="86" fill="#DFDFD6"/>
    <path d="M70,392 C70,300 120,258 200,258 C280,258 330,300 330,392 Z" fill="#DFDFD6"/>
  </g>
  <g stroke="#2F4CFF" stroke-width="3" fill="none" opacity="0.9">
    <circle cx="60" cy="60" r="14"/>
    <path d="M60,46 L60,74 M46,60 L74,60"/>
    <circle cx="340" cy="340" r="14"/>
    <path d="M340,326 L340,354 M326,340 L354,340"/>
  </g>
</svg>'''
with open(os.path.join(OUT, "avatar.svg"), "w", encoding="utf-8") as f:
    f.write(avatar)

print("done:", os.listdir(OUT))
