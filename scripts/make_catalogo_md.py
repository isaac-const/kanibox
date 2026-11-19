"""Gera CATALOGO.md a partir de dados/catalogo.json (a fonte única do catálogo).

Uso: python3 -I make_catalogo_md.py <pasta kanibox>
"""
import json, os, sys, collections

ROOT = sys.argv[1]
d = json.load(open(os.path.join(ROOT, "dados", "catalogo.json"), encoding="utf-8"))

SEC = {1:"Navegar",2:"IA",3:"Criar",4:"Arquivos",5:"Produtividade",6:"Terminal",7:"Sistema",
       8:"Emular e jogar",9:"Minecraft",10:"Jogos",11:"Aprender",13:"Meus apps"}
GORD = {9:["Launchers","Mods favoritos","Mods secundários","Resource packs","Shaders","Servidores"],
        10:["Que eu gosto","No navegador","Curiosidades"]}

def http(x):
    h = x.get("http")
    if x.get("kind") != "item": return ""
    if h == 200: return "ok"
    if h in (401, 403, 429): return "bloqueia robô"
    if h == 0: return "não respondeu"
    return str(h)

def fonte(x):
    s = x.get("lic_src", "")
    if s.startswith(("GitHub:", "Modrinth:")): return s
    if x.get("lic"): return "definido por mim, a conferir"
    return ""

lines = ["# Catálogo do KaniBox", "",
 "Gerado de `dados/catalogo.json` por `scripts/make_catalogo_md.py`. Não editar à mão: mudar o script `scripts/build_catalog.py` e rodar de novo.", "",
 "Como ler as colunas:", "",
 "- **Link**: `ok` respondeu 200. `bloqueia robô` respondeu 401, 403 ou 429, o site existe mas não consegui abrir. `não respondeu` não resolveu da minha rede.",
 "- **Licença**: vem do GitHub, da Steam ou do Modrinth quando existe (a fonte aparece). Quando diz `definido por mim`, é conhecimento geral meu e precisa ser conferido antes de publicar.",
 "- **Plataformas** dos jogos vêm da Steam. As dos demais itens são de conhecimento geral meu, a conferir.",
 "- Campo vazio quer dizer que ninguém confirmou. Nada foi inventado.", ""]

by = collections.defaultdict(list)
for x in d: by[x["sec"]].append(x)

for sid in sorted(SEC):
    items = by.get(sid, [])
    lines += [f"## {sid} · {SEC[sid]} ({len(items)})", ""]
    groups = []
    for x in items:
        if x["grp"] not in groups: groups.append(x["grp"])
    order = GORD.get(sid, [])
    groups.sort(key=lambda g: order.index(g) if g in order else 99)
    for g in groups:
        gi = [x for x in items if x["grp"] == g]
        lines += [f"### {g} ({len(gi)})", ""]
        if gi[0]["kind"] == "mc":
            lines += ["| Nome | Slug | Loaders | Licença (fonte) |", "|---|---|---|---|"]
            for x in gi:
                slug = x["url"].rstrip("/").split("/")[-1]
                lines.append(f"| {x['name']} | {slug} | {', '.join(x.get('loaders', []))} | {x['lic']} ({fonte(x)}) |")
        elif gi[0]["kind"] == "game":
            lines += ["| Nome | Plataformas (Steam) | Link |", "|---|---|---|"]
            for x in gi:
                lines.append(f"| {x['name']} | {', '.join(x['plat'])} | {x['url']} |")
        else:
            lines += ["| Nome | Link | Tipo | Plataformas | Licença (fonte) | Site |", "|---|---|---|---|---|---|"]
            for x in gi:
                extra = " · via FMHY" if x.get("via") else ""
                extra += " · para iniciantes" if x.get("ini") else ""
                lines.append(f"| {x['name']}{extra} | {x['host']} | {x['tipo']} | {', '.join(x['plat'])} | {x['lic'] or ''} {('(' + fonte(x) + ')') if x['lic'] else ''} | {http(x)} |")
        lines.append("")

lines += ["## Pendências", "",
 "- Conferir as licenças e plataformas marcadas como definidas à mão (a coluna Licença diz quando a fonte é GitHub, Modrinth ou à mão).",
 "- Courier Owls só existe no CurseForge: sem loaders nem ícone confirmados, porque a página bloqueia robô.",
 "- NordVPN, Meta AI, Blender, neal.fun e Akinator bloqueiam robô: a checagem automática não alcança.",
 "- Nuvio e DashBeam: plataformas e licença não confirmadas, ficam vazias e não aparecem nos filtros correspondentes.",
 "- Dystoria Cobblemon aponta para o modpack oficial no Modrinth. Não achei site oficial confirmado.",
 "- Imagens de caixas de jogos vêm da Wikipédia (identificação); capas da Steam vêm da loja.", "",
 "## Decisões do Isaac", "",
 "- O catálogo só mostra uma descrição breve, sem \"por que eu uso\".",
 "- Proton é o da Valve (Emular e jogar) e o Proton VPN também entrou, em VPNs.",
 "- Geradores de imagem do FMHY: ficam os três primeiros da lista (Gemini, Meta AI, Bing Create), marcados com `via FMHY`.",
 "- Deltarune é o primeiro jogo e o Minecraft também está na galeria.",
 "- Verificador semanal de links, relógio mundial, alarme e seletor de cor ficaram de fora por enquanto.", ""]

open(os.path.join(ROOT, "CATALOGO.md"), "w", encoding="utf-8").write("\n".join(lines))

# resumo para o plano
print("itens:", len(d))
print("por seção:", {SEC[s]: len(by[s]) for s in sorted(SEC)})
print("licença:", collections.Counter(x["lic"] or "(vazia)" for x in d))
ver = sum(1 for x in d if x.get("lic_src", "").startswith(("GitHub:", "Modrinth:")))
print("licença verificada em fonte:", ver, "| definida por mim:", sum(1 for x in d if x["lic"]) - ver, "| vazia:", sum(1 for x in d if not x["lic"]))
print("plataformas de jogos da Steam:", sum(1 for x in d if x["kind"] == "game" and x["plat"]))
print("travessões:", sum(open(os.path.join(ROOT, "CATALOGO.md"), encoding="utf-8").read().count("—") for _ in [0]))
