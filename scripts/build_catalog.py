"""Monta o catálogo do KaniBox e verifica o que dá para verificar.

Uso: python3 -I build_catalog.py <pasta kanibox>

Fontes de verificação:
- GitHub (licença do repositório) via `gh api`
- Steam (plataformas, preço, imagem) via API pública da loja
- Modrinth (loaders, licença, ícone) via API pública
- HEAD/GET em cada link (200, redirecionamento ou bloqueio de robô)

Campos que ninguém confirmou ficam vazios. Nada é inventado.
"""
import hashlib, json, os, re, subprocess, sys, time, urllib.parse, urllib.request, urllib.error

ROOT = sys.argv[1]
ASSETS = os.path.join(ROOT, "demo", "assets")
UA = {"User-Agent": "catalogo-check/0.1"}
BROWSER_UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36"}

# Os dados escritos à mão ficam em catalog_data.py (T, GAMES, EXTRA_MC, DESC).
exec(compile(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "catalog_data.py"), encoding="utf-8").read(), "catalog_data.py", "exec"))

def get(url, headers=None, timeout=25, method="GET"):
    req = urllib.request.Request(url, headers=headers or UA, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

def status(url):
    try:
        req = urllib.request.Request(url, headers=BROWSER_UA)
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        return 0

def host(u):
    return re.sub(r"^www\.", "", urllib.parse.urlparse(u).netloc)

items, report = [], {"links": {}, "licenca_github": {}, "steam": {}, "modrinth": {}}
os.makedirs(os.path.join(ASSETS, "icons"), exist_ok=True)
os.makedirs(os.path.join(ASSETS, "games"), exist_ok=True)
os.makedirs(os.path.join(ASSETS, "mc"), exist_ok=True)

OPEN_SPDX = re.compile(r"^(MIT|Apache|GPL|AGPL|LGPL|MPL|BSD|ISC|Unlicense|CC0|BSL-1|0BSD|Zlib|EPL|OFL)", re.I)

for sec, grp, name, url, tipo, plat, lic, ex in T:
    it = dict(sec=sec, grp=grp, name=name, url=url, tipo=tipo, plat=plat, lic=lic, host=host(url),
              note=DESC.get(name, ex.get("note", "")), via=ex.get("via", ""), ini=bool(ex.get("ini")), icon_domain=ex.get("icon") or host(url),
              mono=bool(ex.get("mono")), kind="item", top=name in TOP)
    if ex.get("local_icon"):
        it["icon"] = ex["local_icon"]
    if ex.get("gh"):
        try:
            out = subprocess.run(["gh","api",f"repos/{ex['gh']}","--jq",".license.spdx_id + \"|\" + (.archived|tostring)"],
                                 capture_output=True, text=True, timeout=30)
            spdx = out.stdout.strip().split("|")[0] if out.returncode == 0 else ""
            report["licenca_github"][name] = spdx or "erro"
            if spdx and OPEN_SPDX.match(spdx):
                it["lic"], it["lic_src"] = OPEN, f"GitHub: {spdx}"
            elif spdx and spdx not in ("NOASSERTION", "null"):
                it["lic_src"] = f"GitHub: {spdx} (não classificada)"
            elif spdx in ("NOASSERTION", "null", ""):
                if it["lic"] == OPEN:
                    it["lic_src"] = "a conferir (GitHub sem licença legível)"
        except Exception as e:
            report["licenca_github"][name] = f"erro {e}"
    items.append(it)

# Jogos: Steam (capa, plataformas) ou Wikipédia (capa para identificação)
def wget(url):
    """GET com espera e repetição: a Wikipédia limita pedidos rápidos (429)."""
    for wait in (0, 6, 15, 30):
        time.sleep(wait)
        try:
            return get(url, headers={"User-Agent": "catalogo-check/0.1 (catalogo estatico, uso pessoal)"})
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
    raise RuntimeError("Wikipédia respondeu 429 em todas as tentativas")

def wiki_cover(title, slug, file=None):
    existing = [f for f in os.listdir(os.path.join(ASSETS, "games")) if f.startswith(f"wiki-{slug}.") and os.path.getsize(os.path.join(ASSETS, "games", f)) > 500]
    if existing:
        return existing[0]
    time.sleep(3)
    if file:
        data = wget("https://en.wikipedia.org/wiki/Special:FilePath/" + urllib.parse.quote(file) + "?width=420")
        fn = f"wiki-{slug}{os.path.splitext(file)[1] or '.png'}"
    else:
        j = json.loads(wget("https://en.wikipedia.org/api/rest_v1/page/summary/" + title))
        src = (j.get("thumbnail") or {}).get("source", "")
        if not src:
            return ""
        data = wget(src)
        fn = f"wiki-{slug}{os.path.splitext(urllib.parse.urlparse(src).path)[1] or '.jpg'}"
    if len(data) < 500:
        raise RuntimeError(f"imagem vazia para {slug}")
    open(os.path.join(ASSETS, "games", fn), "wb").write(data)
    return fn

for g in GAMES:
    kind_src, name = g[0], g[1]
    entry = dict(sec=10, grp="Que eu gosto", name=name, url="", tipo="Jogo", plat=[], lic=PAID, host="", note="", via="",
                 ini=False, icon_domain="", mono=False, kind="game", img="")
    try:
        if kind_src == "steam":
            q = urllib.parse.urlencode({"term": g[2], "cc": "br", "l": "portuguese"})
            res = json.loads(get("https://store.steampowered.com/api/storesearch/?" + q))
            hit = res["items"][0] if res.get("total") else None
            if hit:
                appid = hit["id"]
                det = json.loads(get(f"https://store.steampowered.com/api/appdetails?appids={appid}&cc=br&l=portuguese"))[str(appid)]
                d = det.get("data", {}) if det.get("success") else {}
                entry["url"] = f"https://store.steampowered.com/app/{appid}/"
                entry["host"] = "store.steampowered.com"
                pl = d.get("platforms", {})
                entry["plat"] = [n for k, n in (("linux", L), ("windows", W), ("mac", M)) if pl.get(k)]
                entry["lic"] = FREE if d.get("is_free") else PAID
                hdr = d.get("header_image", "").split("?")[0]
                if hdr:
                    fn = f"{appid}.jpg"
                    path = os.path.join(ASSETS, "games", fn)
                    if not os.path.exists(path):
                        open(path, "wb").write(get(hdr))
                    entry["img"] = fn
                report["steam"][name] = f"{hit['name']} (app {appid}) plataformas={entry['plat']}"
            else:
                report["steam"][name] = "SEM RESULTADO"
        else:
            title, url, plat = g[2], g[3], g[4]
            file = g[5] if len(g) > 5 else None
            entry["url"], entry["plat"] = url, plat
            entry["host"] = host(url)
            fn = wiki_cover(title, re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-"), file)
            entry["img"] = fn
            entry["img_fit"] = "contain"
            report["steam"][name] = f"wikipedia capa={fn or 'SEM CAPA'}"
    except Exception as e:
        report["steam"][name] = f"erro {e}"
    items.append(entry)
    time.sleep(0.4)

# Modrinth
MC = json.load(open(os.path.join(ROOT, "demo", "assets", "mc-list.json")))
slugs = [m[2] for m in MC]
projects = json.loads(get("https://api.modrinth.com/v2/projects?ids=" + urllib.parse.quote(json.dumps(slugs))))
by_slug = {p["slug"]: p for p in projects}
for tier, name, slug in MC:
    p = by_slug.get(slug)
    if not p:
        report["modrinth"][slug] = "NÃO ENCONTRADO"
        continue
    lic_id = (p.get("license") or {}).get("id", "")
    is_open = bool(lic_id) and not lic_id.startswith("LicenseRef-All-Rights-Reserved") and lic_id != "LicenseRef-Custom"
    icon_file = ""
    if p.get("icon_url"):
        ext = os.path.splitext(urllib.parse.urlparse(p["icon_url"]).path)[1] or ".png"
        icon_file = f"{slug}{ext}"
        path = os.path.join(ASSETS, "mc", icon_file)
        if not os.path.exists(path):
            try: open(path, "wb").write(get(p["icon_url"]))
            except Exception: icon_file = ""
    loaders = [l for l in p.get("loaders", []) if l in ("fabric", "forge", "neoforge", "quilt")]
    typ = {"fav": "Mod", "sec": "Mod", "pack": "Resource pack", "shader": "Shader"}[tier]
    grp = {"fav": "Mods", "sec": "Mods", "pack": "Resource packs", "shader": "Shaders"}[tier]
    items.append(dict(sec=9, grp=grp, name=name, url=f"https://modrinth.com/{p['project_type']}/{slug}", tipo=typ,
                      plat=[], lic=OPEN if is_open else FREE, host="modrinth.com", note=DESC.get(name, p.get("description", "")), via="", ini=False,
                      icon_domain="", mono=False, kind="mc", loaders=loaders, mc_icon=icon_file, lic_src=f"Modrinth: {lic_id or 'sem licença'}"))
    report["modrinth"][slug] = f"{lic_id or 'sem licença'}"

for e in EXTRA_MC:
    items.append(dict(sec=9, grp=e["grp"], name=e["name"], url=e["url"], tipo="Mod", plat=[], lic="", host=e["host"],
                      note=DESC.get(e["name"], ""), via="", ini=False, icon_domain="", mono=True, kind="mc", loaders=[], mc_icon=""))

# favicons
SEEN = {}
for it in items:
    if it["kind"] != "item" or it["mono"] or it.get("icon"):
        continue
    dom = it["icon_domain"]
    fn = re.sub(r"[^a-z0-9]+", "-", dom.lower()).strip("-") + ".png"
    path = os.path.join(ASSETS, "icons", fn)
    if not os.path.exists(path):
        try:
            data = get(f"https://www.google.com/s2/favicons?domain={dom}&sz=128")
            open(path, "wb").write(data)
        except Exception:
            it["mono"] = True
            continue
        time.sleep(0.1)
    it["icon"] = fn

# links (só os que não são Steam/Modrinth)
for it in items:
    if it["kind"] != "item":
        continue
    st = status(it["url"])
    report["links"][it["name"]] = st
    it["http"] = st

json.dump(items, open(os.path.join(ROOT, "dados", "catalogo.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(ASSETS, "data.js"), "w", encoding="utf-8").write("window.CAT = " + json.dumps(items, ensure_ascii=False) + ";\n")
json.dump(report, open(os.path.join(ROOT, "dados", "verificacao.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print("itens:", len(items))
print("links fora do padrão (não 200):", {k: v for k, v in report["links"].items() if v != 200})
print("licença GitHub:", {k: v for k, v in report["licenca_github"].items() if not OPEN_SPDX.match(v)})
print("jogos:", json.dumps(report["steam"], ensure_ascii=False, indent=1))
print("modrinth sem licença/estranho:", {k: v for k, v in report["modrinth"].items() if v in ("sem licença", "NÃO ENCONTRADO") or v.startswith("LicenseRef")})
