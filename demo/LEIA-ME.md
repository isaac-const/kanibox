# Demo visual do KaniBox (v2)

Abrir `index.html` no navegador. Não precisa de servidor nem de internet.
`v1-canivete-hero.html` é a primeira versão, guardada só para comparar.

## O que é real e o que é demonstração

- Os 140 itens vêm de `../dados/catalogo.json`, montado por `../scripts/build_catalog.py`. Licenças do GitHub, plataformas e capas da Steam, loaders e ícones do Modrinth. O que não foi confirmado fica vazio.
- Licença "definida por mim" aparece na dica da licença como "a conferir". Plataformas dos itens que não são jogos também são minhas, a conferir.
- Descrições de mods vêm do Modrinth, em inglês, só como demonstração.
- Itens sem frase do Isaac mostram só nome, tipo e endereço. Não inventei "por que eu uso".
- Grimo Notes e Kita Finances aparecem como "em desenvolvimento" e não têm link.
- Temporizador, cronômetro e foco funcionam. Relógio mundial, alarme e seletor de cor ainda não existem.

## Não há atalhos de teclado

Por pedido do Isaac. `Esc` só fecha uma janela que já está aberta.

## Modos de captura (usados para gerar os prints)

Acrescentar ao endereço, por exemplo `index.html#still&t=rose-black`:

| Trecho | Efeito |
|---|---|
| `still` | desliga animações |
| `t=dark`, `white`, `rose-black`, `rose-white`, `blue-dark`, `blue-white` | escolhe o tema |
| `fold` | mostra o canivete dobrado |
| `openmods` | abre os grupos de mods |
| `f=plat:Linux` | liga um filtro (`plat`, `tipo`, `lic`). Pode repetir com `&f=` |
| `q=terminal` | preenche a busca |
| `s1` a `s13` | rola até a seção |
| `selftest` | roda o autoteste e escreve o resultado no fim da página |
| `pos` | lista a posição de cada seção |

## Arquivos

- `shots/`: prints gerados.
- `assets/`: fontes, ícones, capas dos jogos e ícones dos mods (baixados por `../scripts/build_catalog.py`).
- `../scripts/`: `build_catalog.py`, `make_catalogo_md.py`, `fetch_demo_assets.py`, `modrinth_lookup.py`.
