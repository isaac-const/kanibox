# KaniBox · site

Meu diretório pessoal de ferramentas, apps e jogos que eu uso e recomendo, com 12 mini ferramentas. Astro, TypeScript e uma ilha React só para as ferramentas.

## Comandos

| Comando | O que faz |
|---|---|
| `npm install` | instala as dependências |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | gera o site estático em `dist/` |
| `npm run preview` | serve o `dist/` em `127.0.0.1:4321` |
| `npm test` | testes unitários (Vitest) |
| `npm run e2e` | testes de ponta a ponta (Playwright com o Chromium do sistema, desktop e celular) |
| `npm run check` | checagem de tipos (`astro check`) |
| `npm run data:sync` | copia os dados e imagens verificados para dentro do site |
| `node scripts/shots.mjs docs/prints` | gera prints do preview |

Variáveis: `SITE_URL` (endereço final, usado no canonical e no feed RSS) e `CHROMIUM_PATH` (padrão `/usr/bin/chromium`).

## Dados

A fonte única do catálogo é `../dados/catalogo.json`, gerada por `../scripts/build_catalog.py` (precisa de `python3` e do `gh` autenticado para ler licenças do GitHub). Depois, `npm run data:sync` copia o JSON e as imagens para `src/data` e `public/`. O JSON é validado por um esquema Zod (`src/lib/schema.ts`) a cada build: item fora do formato derruba o build.

Fontes de verificação: GitHub (licença), Steam (plataformas e capas dos jogos), Modrinth (loaders, licença e ícones dos mods) e uma checagem HTTP de cada link. Campos que ninguém confirmou ficam vazios. Licenças informadas à mão aparecem na dica da licença como "ainda não conferida".

Apps em desenvolvimento ficam em `src/data/em-desenvolvimento.json` e não entram na contagem pública.

## Como funciona

- Todo o catálogo é renderizado no servidor, em HTML. Sem JavaScript, a página funciona e as seções estão no ar; só a busca, os filtros e a animação do canivete dependem de JS.
- `src/lib/filter.ts` é a lógica de busca e filtro, uma função pura sem DOM: plataforma, tipo e licença combinam em E entre si e em OU dentro de cada um, a busca exige todas as palavras sem diferenciar acento, e item sem plataforma ou licença informada não passa quando o filtro correspondente está ligado.
- `src/scripts/app.ts` liga essa lógica ao HTML (esconde linhas, grupos e seções) e guarda o estado na URL (`?q=`, `plat=`, `tipo=`, `lic=`, `ld=`).
- Mods começam recolhidos. Abrem sozinhos quando há busca, filtro ou loader escolhido e recolhem de novo ao limpar, a não ser que eu os tenha aberto na mão.
- O loader do Minecraft risca os mods que não têm aquele loader. O sinal não depende só de cor nem de transparência, para manter o contraste do texto.
- Dois temas por `data-theme`: dark e white (os vermelhos), escolhidos pela preferência do sistema. Os temas azuis e rosa foram removidos por escolha minha. A cor de destaque para texto pequeno tem token próprio (`--accent-text`) para passar contraste AA nos temas claros.
- Sem atalhos de teclado, por decisão minha. `Esc` só fecha janelas já abertas.
- Fontes em WOFF2 reduzidas, imagens e ícones hospedados pelo próprio site.
- O temporizador e o foco tocam um sino de 3 a 4 notas feito com Web Audio (sem arquivo de áudio). O som pode ser desligado e a escolha fica salva.

## Interface

- **Topo:** hero com os meus destaques (CachyOS, VSCodium, Godot, Krita, Claude, DeepSeek, Obsidian, Ghostty, Prism Launcher), depois Meus apps e Ferramentas, e só então as outras seções.
- **Abas opcionais:** o botão "Abas" no cabeçalho mostra uma seção por vez. A escolha fica salva. Sem JavaScript tudo continua em lista.
- **Minecraft:** os mods são um grupo só, em abas com Launchers, Resource packs, Shaders e Servidores.
- **Canivete:** cabo creme e vermelho no escuro, preto e vermelho no claro, com contorno. Com o mouse em uma lâmina, o rótulo da seção atual some para não cobrir o novo.
- **Rodapé** com a faixa de kanikama, links e critério.

## Ferramentas

Quatro abas, doze ferramentas, todas no navegador e sem conta. Cada uma tem o botão Expandir, que ocupa a tela toda (modo foco) e fecha com Esc.

- **Tempo:** temporizador (horas, minutos e segundos à escolha), cronômetro com voltas, foco pomodoro (tempos e ciclos personalizáveis) e "Quanto tempo", que aceita só as partes que importam (só o mês, só o dia, só a hora, ou a data exata) e mostra anos, meses, dias, horas, minutos e segundos, ao vivo.
- **Texto:** 18 estilos (versalete, pequenas, subscrito, invertido, espelhado, de cabeça para baixo, riscado, sublinhado, leet, zalgo, gótico, cursivo, negrito, itálico, contorno duplo, monoespaçado, círculos, largo), com botão de copiar.
- **Cálculo:** calculadora (analisador próprio, sem eval), conversor com 12 grandezas e regra de 3 direta e inversa.
- **Sorteio:** nomes (sem repetir, se quiser), número aleatório (intervalo, quantidade, sem repetição, decimais), roleta e sim ou não. O acaso vem do `crypto`.
- **Som:** só toca se eu ligar, e cada ferramenta (temporizador e foco) tem o seu botão. Começa desligado. Sino feito com Web Audio, sem arquivo de áudio.

A lógica fica em `src/lib/tools/` como funções puras, com testes.

## Testes

- 76 unitários: integridade dos dados, filtro e as ferramentas (contagem com partes opcionais, estilos de texto com exemplos, unidades, calculadora, regra de 3 e sorteios).
- 212 de ponta a ponta (desktop e celular): rotas por categoria, menu lateral, inglês e seletor de idioma, busca, filtros, abas elásticas, Minecraft, canivete, temas, ferramentas com relógio simulado, som, links, imagens, página sem JavaScript, RSS (PT e EN), 404, axe e checagens de celular (sem zoom, sem rolagem lateral, campos de 16px).
- Acessibilidade com axe (WCAG 2 A e AA) nos dois temas, nas ferramentas de cada aba e no modo foco.

## Publicar

O repositório publica sozinho no GitHub Pages a cada push na `main` (`.github/workflows/pages.yml`: instala, roda testes unitários e tipos, builda com `BASE_PATH=/kanibox` e publica). Endereço: https://isaac-const.github.io/kanibox/

Para builds em outro endereço, defina `SITE_URL` e `BASE_PATH` (use `/` na raiz de um domínio).

## Pendente

- Revisão das licenças e plataformas informadas à mão (a dica da licença diz quando ainda não foi conferida).
- Links que bloqueiam robô (Meta AI, NordVPN, Blender, neal.fun, CurseForge) não foram abertos pela checagem automática.
- Conferir termos de uso da API do Modrinth e das imagens da Steam e da Wikipédia.
