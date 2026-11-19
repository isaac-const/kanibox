import json, sys, time, urllib.parse, urllib.request

ITEMS = {
  "mod": [
    "TrashSlot","RoadWeaver","Controlling","Polymorph","Lootr","Tom's Simple Storage Mod",
    "Nature's Compass","Xaero's Minimap","Xaero's World Map","Easy Magic","Ping Wheel","Waystones",
    "WaterFrames","Jade","AppleSkin","Mouse Tweaks","Entity Culling","ModernFix",
    "You're in Grave Danger","Traveler's Backpack","Sophisticated Backpacks","Right Click Harvest",
    "Trading Post","Sound Physics Remastered","Critters and Companions","Mod Menu","Alex's Caves",
    "Artifacts","Biomes O' Plenty",
    "Storage Drawers","Supplementaries","Explorer's Compass","Easy Anvils","Farmer's Delight",
    "Enchantment Descriptions","Clumps","Visual Workbench","Relics","Vampirism","Origins",
    "Courier Owls","Iron's Spells 'n Spellbooks","Chat Heads",
  ],
  "resourcepack": ["Dark Coffee GUI","Unique Dark","New Glowing Ores","Low on Fire"],
  "shader": ["Complementary Shaders Unbound","Super Duper Vanilla"],
}
UA = "catalogo-check/0.1"
out = {}
for kind, names in ITEMS.items():
    for name in names:
        facets = json.dumps([[f"project_type:{kind}"]])
        url = "https://api.modrinth.com/v2/search?" + urllib.parse.urlencode({"query": name, "limit": 3, "facets": facets})
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                hits = json.load(r)["hits"]
        except Exception as e:
            hits = []
            print("ERRO", name, e, file=sys.stderr)
        out[f"{kind}:{name}"] = [
            {"title": h["title"], "slug": h["slug"], "downloads": h["downloads"],
             "loaders": [c for c in h.get("categories", []) if c in ("fabric","forge","neoforge","quilt")],
             "versions": h.get("versions", [])[-1:] , "author": h.get("author")}
            for h in hits
        ]
        top = out[f"{kind}:{name}"][0] if out[f"{kind}:{name}"] else None
        print(f"{kind[:4]:4} {name:32} -> " + (f"{top['title']} [{top['slug']}] {','.join(top['loaders'])} dl={top['downloads']}" if top else "SEM RESULTADO"))
        time.sleep(0.25)
json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
