"""Baixa fontes, ícones do Modrinth e favicons para o demo do KaniBox.

Uso: python3 -I fetch_demo_assets.py <pasta demo/assets>
Só usa a API pública do Modrinth e o serviço de favicons do Google.
Nenhum dado pessoal é enviado: apenas nomes de projetos e domínios públicos.
"""
import hashlib, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = sys.argv[1]
UA = {"User-Agent": "catalogo-check/0.1"}


def get(url, headers=None, timeout=25):
    req = urllib.request.Request(url, headers=headers or UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


# ---------- fontes ----------
fonts_dir = os.path.join(ROOT, "fonts")
css_out = []
for fn in sorted(os.listdir(fonts_dir)):
    if not fn.endswith(".css") or fn == "fonts.css":
        continue
    css = open(os.path.join(fonts_dir, fn), encoding="utf-8").read()
    for block in re.findall(r"@font-face\s*\{.*?\}", css, re.S):
        fam = re.search(r"font-family:\s*'([^']+)'", block).group(1)
        wt = re.search(r"font-weight:\s*(\d+)", block).group(1)
        url = re.search(r"url\(([^)]+)\)", block).group(1)
        local = f"{fam.replace(' ', '-').lower()}-{wt}.ttf"
        path = os.path.join(fonts_dir, local)
        if not os.path.exists(path):
            open(path, "wb").write(get(url))
        css_out.append(
            f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{wt};"
            f"font-display:swap;src:url({local}) format('truetype');}}"
        )
open(os.path.join(fonts_dir, "fonts.css"), "w").write("\n".join(css_out) + "\n")
print("fontes:", len(css_out), "pesos")

# ---------- Modrinth ----------
MC = [
    # (tier, nome exibido, slug)
    ("fav", "TrashSlot", "trashslot"), ("fav", "RoadWeaver", "roadweaver"),
    ("fav", "Controlling", "controlling"), ("fav", "Polymorph", "polymorph"),
    ("fav", "Lootr", "lootr"), ("fav", "Tom's Simple Storage Mod", "toms-storage"),
    ("fav", "Nature's Compass", "natures-compass"), ("fav", "Xaero's Minimap", "xaeros-minimap"),
    ("fav", "Xaero's World Map", "xaeros-world-map"), ("fav", "Easy Magic", "easy-magic"),
    ("fav", "Ping Wheel", "ping-wheel"), ("fav", "Waystones", "waystones"),
    ("fav", "WaterFrames", "waterframes"), ("fav", "Jade", "jade"),
    ("fav", "AppleSkin", "appleskin"), ("fav", "Mouse Tweaks", "mouse-tweaks"),
    ("fav", "Entity Culling", "entityculling"), ("fav", "ModernFix", "modernfix"),
    ("fav", "You're in Grave Danger", "yigd"), ("fav", "Traveler's Backpack", "travelersbackpack"),
    ("fav", "Sophisticated Backpacks", "sophisticated-backpacks"),
    ("fav", "Right Click Harvest", "rightclickharvest"), ("fav", "Trading Post", "trading-post"),
    ("fav", "Sound Physics Remastered", "sound-physics-remastered"),
    ("fav", "Critters and Companions", "critters-and-companions"), ("fav", "Mod Menu", "modmenu"),
    ("fav", "Alex's Caves", "alexs-caves"), ("fav", "Artifacts", "artifacts"),
    ("fav", "Biomes O' Plenty", "biomes-o-plenty"),
    ("sec", "Storage Drawers", "storagedrawers"), ("sec", "Supplementaries", "supplementaries"),
    ("sec", "Explorer's Compass", "explorers-compass"), ("sec", "Easy Anvils", "easy-anvils"),
    ("sec", "Farmer's Delight", "farmers-delight"),
    ("sec", "Enchantment Descriptions", "enchantment-descriptions"), ("sec", "Clumps", "clumps"),
    ("sec", "Visual Workbench", "visual-workbench"), ("sec", "Relics", "relics-mod"),
    ("sec", "Vampirism", "vampirism"), ("sec", "Origins", "origins"),
    ("sec", "Iron's Spells 'n Spellbooks", "irons-spells-n-spellbooks"),
    ("sec", "Chat Heads", "chat-heads"),
    ("pack", "Dark Coffee GUI", "dark-coffe-gui"), ("pack", "Unique Dark", "unique-dark"),
    ("pack", "New Glowing Ores", "new-glowing-ores"), ("pack", "Low on Fire", "low-on-fire"),
    ("shader", "Complementary Unbound", "complementary-unbound"),
    ("shader", "Super Duper Vanilla", "super-duper-vanilla"),
]
slugs = [m[2] for m in MC]
projects = json.loads(get("https://api.modrinth.com/v2/projects?ids=" + urllib.parse.quote(json.dumps(slugs))))
by_slug = {p["slug"]: p for p in projects}
mc_dir = os.path.join(ROOT, "mc")
rows, miss = [], []
for tier, name, slug in MC:
    p = by_slug.get(slug)
    if not p:
        miss.append(slug)
        continue
    icon_file = ""
    if p.get("icon_url"):
        ext = os.path.splitext(urllib.parse.urlparse(p["icon_url"]).path)[1] or ".png"
        icon_file = f"{slug}{ext}"
        path = os.path.join(mc_dir, icon_file)
        if not os.path.exists(path):
            try:
                open(path, "wb").write(get(p["icon_url"]))
            except Exception as e:
                print("icone falhou", slug, e)
                icon_file = ""
            time.sleep(0.1)
    loaders = [l for l in p.get("loaders", []) if l in ("fabric", "forge", "neoforge", "quilt")]
    rows.append({
        "tier": tier, "name": name, "slug": slug,
        "type": p["project_type"], "loaders": loaders,
        "desc": p.get("description", ""), "icon": icon_file,
        "downloads": p.get("downloads", 0),
    })
open(os.path.join(ROOT, "data-mc.js"), "w", encoding="utf-8").write(
    "window.MC = " + json.dumps(rows, ensure_ascii=False, indent=1) + ";\n"
)
print("modrinth:", len(rows), "itens", "| sem projeto:", miss)

# ---------- favicons ----------
SITES = {
    "zen": "zen-browser.app", "helium": "helium.computer", "vivaldi": "vivaldi.com",
    "ublock": "ublockorigin.com", "deepseek": "deepseek.com", "claude": "claude.com",
    "zai": "z.ai", "qwen": "qwen.ai", "gimp": "gimp.org", "artcraft": "getartcraft.com",
    "pixelorama": "pixelorama.org", "novaboard": "novaboard.app", "libresprite": "libresprite.github.io",
    "cobalt": "cobalt.tools", "transmute": "transmute.sh", "litterbox": "litterbox.catbox.moe",
    "fedora": "fedoraproject.org", "cachyos": "cachyos.org", "zorin": "zorin.com",
    "debian": "debian.org", "mint": "linuxmint.com", "ubuntu": "ubuntu.com",
    "gboard": "play.google.com", "floris": "florisboard.org", "prism": "prismlauncher.org",
    "modrinth": "modrinth.com", "morse": "morse.withgoogle.com", "morsle": "morsle.fun",
    "duolingo": "duolingo.com", "anki": "ankiweb.net", "nealfun": "neal.fun",
    "akinator": "akinator.com", "cityguesser": "cityguesser.eu",
}
icons_dir = os.path.join(ROOT, "icons")
ok, fallback = [], []
for key, dom in SITES.items():
    try:
        data = get(f"https://www.google.com/s2/favicons?domain={dom}&sz=128")
    except Exception as e:
        # 404 significa que o servico nao tem icone proprio para o dominio
        fallback.append((key, str(e)))
        continue
    open(os.path.join(icons_dir, f"{key}.png"), "wb").write(data)
    ok.append(key)
    time.sleep(0.1)
print("favicons ok:", len(ok), "| sem icone proprio:", fallback)
