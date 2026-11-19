# KaniBox · plano

Status: site construído em `site/` (Astro) e **publicado** em https://isaac-const.github.io/kanibox/ (repositório `isaac-const/kanibox`, GitHub Pages). Falta revisão das licenças e plataformas informadas à mão.
Data: 19/11/2026
Dados: `dados/catalogo.json` (fonte única), `CATALOGO.md` (gerado), `dados/verificacao.json` (resultado das checagens).

## 1. O que é

Diretório pessoal do que o Isaac usa e recomenda, para achar rápido: 140 itens em 13 seções, mais 3 mini ferramentas de tempo e a seção Meus apps. É uma ferramenta de consulta, não um portfólio e não uma vitrine. O nome vem de canivete (a faca suíça) e remete a kanikama.

## 2. O que o Isaac pediu depois do primeiro demo

| Pedido | O que mudou |
|---|---|
| Sem hero, sem slogan | A página abre com uma linha de descrição e a data de atualização. Saiu o título gigante, o canivete grande no topo e a faixa de logos |
| Sem atalhos de teclado | Saíram `Ctrl K`, as teclas 1 a 9, T e `/`. `Esc` só fecha janelas abertas |
| O único atalho é a busca global com filtros | Busca no topo, sempre visível, e filtros por plataforma, tipo e licença |
| Manter o canivete literal | O canivete virou a barra rápida: o cabo dobra e abre as lâminas, uma por seção |
| Organização mais fácil de ler e menos parecida com o portfólio | Listas em linhas, agrupadas por uso. Sem cartões grandes, sem spotlight, sem título enorme |
| Minecraft não é o foco | É uma das 13 seções. Mods começam recolhidos |
| Dark vermelho e white vermelho como padrão | Os dois temas padrão, escolhidos pela preferência do sistema |
| Descrição curta, sem slogan | "Ferramentas, apps e jogos que eu uso e recomendo." |

Itens novos pedidos: terminais, apps de produtividade, compactadores, emuladores, Linux gaming, servidores de Minecraft, jogos que o Isaac gosta, jogos online e seus apps. Ferramentas de tempo ficam, com o foco (pomodoro) somado.

## 3. Seções

| # | Seção | Itens | Grupos |
|---|---|---|---|
| 1 | Navegar | 4 | Navegadores, Extensões |
| 2 | IA | 9 | Chats, Geradores de imagem |
| 3 | Criar | 5 | Edição, Pixel art |
| 4 | Arquivos | 6 | Baixar e converter, Compactar, Enviar e transferir |
| 5 | Produtividade | 4 | Notas e tarefas, Foco |
| 6 | Terminal | 4 | Terminais |
| 7 | Sistema | 9 | Distros Linux, Android |
| 8 | Emular e jogar | 10 | Emuladores, Jogar no Linux |
| 9 | Minecraft | 55 | Launchers, Mods favoritos, Mods secundários, Resource packs, Shaders, Servidores |
| 10 | Jogos | 28 | Que eu gosto (galeria), No navegador, Curiosidades |
| 11 | Aprender | 5 | Digitação, Morse, Idiomas e memória |
| 12 | Ferramentas | 3 | Temporizador, Cronômetro, Foco |
| 13 | Meus apps | 1 + 2 | MoonDeck, e Grimo Notes e Kita Finances marcados "em desenvolvimento" |

## 4. Dados

Um arquivo `dados/catalogo.json`, gerado por `scripts/build_catalog.py`, com os itens escritos à mão e verificados por fonte.

| Campo | Para quê |
|---|---|
| nome, url, host | identificar e abrir |
| seção, grupo, tipo | organizar e filtrar |
| plataformas | filtro de plataforma |
| licença e fonte | filtro de licença, com a fonte na dica |
| nota | detalhe factual, curto |
| porque | frase do Isaac, em primeira pessoa (ainda vazia) |
| via, para iniciantes | selos |
| adicionadoEm, conferidoEm | log de novidades e verificador de links |

Fontes de verificação usadas no demo:

- **GitHub**: licença do repositório (`gh api`).
- **Steam**: plataformas, imagem de capa e existência da página dos jogos.
- **Modrinth**: loaders, licença e ícone dos mods, packs e shaders.
- **Cada link**: resposta HTTP.

Situação em 19/11/2026: 70 licenças vêm de GitHub ou Modrinth, 69 foram definidas por mim (conhecimento geral, aparecem na dica como "a conferir"), 1 está vazia. Plataformas dos jogos vêm da Steam. As dos demais itens são de conhecimento geral meu, também a conferir. O site final só publica o que o Isaac revisar.

## 5. Telas e componentes

1. **Cabeçalho fixo.** Marca, busca, novidades e tema. Abaixo, os filtros Plataforma, Tipo e Licença, o contador "N de 140" e "Limpar filtros".
2. **Abertura.** Uma linha de descrição, a contagem e a data. Sem botões.
3. **Seção.** Ícone, nome, contagem e uma linha de descrição, depois grupos.
4. **Grupo em lista.** Cada linha: ícone, nome, tipo e endereço, nota quando existe, licença com bolinha, plataformas em texto pequeno, seta. A linha inteira é o link.
5. **Grupo em galeria.** Só os jogos que o Isaac gosta: capa da Steam, nome, plataformas.
6. **Mods.** Grupos recolhidos por padrão, com uma pilha de ícones no resumo. Abertos, ficam em duas colunas com nome, descrição, e loaders. Barra de loader na seção: ao escolher um, os mods sem aquele loader ficam apagados e o texto diz quantos rodam.
7. **Ferramentas.** Temporizador, cronômetro e foco (pomodoro). Funcionam offline.
8. **Canivete.** Barra fixa na base. Cabo à esquerda, uma lâmina por seção visível, a seção atual acende e abre a etiqueta como uma lâmina. Clicar no cabo dobra e abre o canivete. No celular as lâminas rolam na horizontal.
9. **Novidades.** Gaveta com o log por data e feed RSS.
10. **Sobre.** Critério de recomendação, nenhum afiliado, como sugerir um item.

## 6. Busca e filtros

- Busca por nome, tipo, grupo, site, nota e nome da seção, sem diferenciar acento.
- Filtros combinam em E entre si (plataforma, tipo, licença) e em OU dentro de cada um.
- Seções sem resultado somem da página e do canivete.
- Item sem plataforma ou licença informada não aparece quando o filtro correspondente está ligado. Por isso os dados precisam estar completos antes de publicar.
- As opções de cada filtro e as contagens vêm dos dados.
- Nenhum atalho de teclado.

## 7. Direção visual

Assunto: coisas úteis que se acham rápido. Deve parecer um bom índice, não uma página de apresentação.

- **Assinatura: o canivete como barra de navegação.** O cabo é branco com uma faixa na cor do tema, como um kanikama. As lâminas se abrem em sequência ao carregar.
- **Legibilidade antes de efeito.** Linhas com respiro, divisórias finas, texto de apoio em cinza com contraste AA, licença e plataforma sempre no mesmo lugar.
- **Cor só onde informa:** ícone da seção, bolinha de código aberto, seta no hover, lâmina atual.
- **Fontes:** Familjen Grotesk (títulos de seção e nomes), Hanken Grotesk (texto), Geist Mono (tipo, endereço, plataformas).
- **Diferente do portfólio:** sem título gigante, sem bento, sem spotlight, sem faixa de logos, sem cursor que acende a grade.
- **Fora do projeto:** slogan, hero, pixel art decorativo, fonte "de Minecraft", cubo 3D, ilustração genérica de "ferramentas".
- **Voz:** primeira pessoa, curta, só o que o Isaac escrever ou aprovar.

## 8. Temas

Seis temas: dark, white, rose black, rose white, blue dark, blue white. Os padrões são **dark** e **white**, os dois vermelhos, escolhidos pela preferência do sistema. A cor de destaque é própria de cada tema. Os cinzas de apoio dos temas claros foram escurecidos para passar contraste AA (white `#6b675e`, rose white `#7d5e62`, blue white `#5a6c84`). O mesmo ajuste deve voltar para o `PLANO.md` do Grimo Notes.

A troca revela o novo tema em círculo a partir do botão (API View Transitions). Sem suporte ou com movimento reduzido, troca direto.

## 9. Movimento

| Momento | Efeito |
|---|---|
| Abertura | as lâminas se abrem em sequência, com leve passada da mola |
| Cabo | clicar dobra todas as lâminas de volta e a barra encolhe até o cabo |
| Seção atual | a lâmina acende e a etiqueta abre como uma lâmina |
| Filtro e busca | seções e linhas entram e saem sem salto de layout |
| Mods | grupo abre e fecha, a seta gira |
| Loader | mods sem o loader ficam apagados e em preto e branco |
| Temporizador | o anel esvazia, ao zerar pulsa e vibra no celular |
| Tema | revelação circular, 650 ms |
| Movimento reduzido | tudo vira fade curto |

## 10. Stack
O que foi construído (`site/`):

- **Astro 7** com uma ilha **React 19** só para as ferramentas de tempo (hidrata quando aparecem na tela), TypeScript estrito.
- **CSS próprio com variáveis** para os seis temas. Tailwind e Motion saíram do plano: o design já estava em CSS testado no demo e as animações são todas CSS, então as duas dependências não acrescentariam nada.
- Catálogo validado por esquema Zod a cada build. Item fora do formato derruba o build.
- Todo o catálogo renderizado em HTML no servidor. Busca, filtros, mods recolhidos e canivete são progressivos: sem JavaScript a página continua inteira.
- Lógica de filtro como módulo puro (`src/lib/filter.ts`), usada no navegador e nos testes. Estado na URL.
- Fontes em WOFF2 reduzidas (de 612 KB para 120 KB), ícones e capas hospedados pelo site.
- Feed RSS e páginas Novidades, Sobre e 404.
- JavaScript enviado: 3,4 KB gz do script da página, mais o React (65,7 KB gz) só quando as ferramentas entram na tela. HTML da página inicial: 23 KB gz.
- Testes: 40 unitários, 94 de ponta a ponta (desktop e celular, com Chromium do sistema e relógio simulado) e axe nos seis temas. `astro check` sem erros.
- Scripts de dados: `build_catalog.py` (monta e verifica), `make_catalogo_md.py`, e no site `sync-data.mjs` e `shots.mjs`.

Ainda por fazer: verificador de links em CI (semanal), PWA para as ferramentas funcionarem offline e relógio mundial, alarme e seletor de cor.

## 11. Fases
0. **Demo** (feito): direção visual, dados e comportamento verificados.
1. **Site base** (feito): Astro, tokens, 6 temas, 13 seções, canivete, dados do catálogo.
2. **Busca e filtros** (feito).
3. **Mods e novidades** (feito): recolhimento, loader riscado, log, RSS.
4. **Ferramentas** (feito para temporizador, cronômetro e foco). Falta relógio mundial, alarme e seletor de cor.
5. **Acabamento** (falta): revisão de dados pelo Isaac, frases "por que uso", itens que faltam, verificador de links, PWA offline, domínio, publicação, vídeo com HyperFrames.

## 12. Riscos

- **Dados.** 69 licenças e todas as plataformas fora dos jogos ainda são minhas. Publicar errado é pior que publicar vazio. Revisão do Isaac antes do lançamento.
- **Frases "por que uso".** Só o Isaac pode escrever. Rascunho meu a partir das páginas oficiais, ele reescreve.
- **Link que morre.** Verificador semanal.
- **Sites que bloqueiam robô** (neal.fun, Akinator, Meta AI, Ecosia): a checagem automática não alcança.
- **Termos de uso.** Conferir regras da API do Modrinth e da imagem das capas da Steam antes de publicar.
- **Logos e capas** usados só como identificação, sem alterar.
- **Limites de IA envelhecem rápido.** Mostrar a data da conferência e remover o que não for conferido há mais de 90 dias.
- **Preços da Steam** mudam: o site não mostra preço, só "Pago".

## 13. Pendências do Isaac

Veja a seção Pendências do `CATALOGO.md`. As principais:

1. VPNs, color picker, extensão de foco, apps de régua e downloader de YouTube.
2. Loader e versão do Minecraft que ele usa.
3. Se `Proton` é o da Valve ou o Proton VPN.
4. Qual Codenames, qual Paper Mario e o site oficial do Dystoria Cobblemon.
5. Se os geradores de imagem do FMHY ficam.
6. Domínio próprio ou endereço grátis.
7. Posso criar o repositório no GitHub quando começarmos? Publicar exige o ok do Isaac.

## 14. Nome

**KaniBox**, escolhido pelo Isaac. Canivete e kanikama.

Sinais de disponibilidade, não prova: `kanibox.dev`, `.app`, `.com.br` e `.io` não responderam DNS, `.com` está registrado. Usuário `kanibox` livre no GitHub e pacote `kanibox` livre no npm. Preço e disponibilidade reais precisam ser conferidos no registrador.

## 15. O que o demo prova

Um autoteste no navegador (`#selftest`) roda 33 verificações, todas passam: padrão dark ou white, 13 seções e 13 lâminas, ausência total de atalhos de teclado, busca (acha, não acha, limpa), filtros de plataforma, tipo e licença conferidos contra os dados, combinação impossível e limpeza, mods recolhidos, galeria de 13 jogos, loader NeoForge (40 de 42 mods) e Fabric (6 apagados), canivete dobra e abre, troca de tema, temporizador, foco passando para a pausa, cronômetro e imagens.

Não verificado: a sensação das animações em navegador real, a revelação circular de tema, toque no celular, leitor de tela, e o contraste de todas as combinações de tema.

## 16. Acessibilidade: o que os testes acharam e foi corrigido

O axe (WCAG 2 A e AA) pegou problemas reais que o demo escondia:

- A contagem de itens nos grupos de mods usava transparência e ficava com contraste 3,4. Agora usa a cor cinza do tema.
- Linhas "em desenvolvimento" e mods sem o loader escolhido usavam transparência na linha toda, o que derrubava o contraste do texto nos seis temas. Agora só o ícone esmaece, o nome fica cinza e, nos mods sem o loader, riscado.
- Nos temas claros, texto pequeno na cor de destaque (data do log, "Limpar filtros") ficava com contraste 4,1. Criei o token `--accent-text`, mais escuro nos temas claros.
- No celular o botão "Limpar filtros" estava escondido junto com o contador. Agora só o contador some.

Outros bugs que os testes pegaram: o cronômetro não zerava (somava o tempo de novo ao parar) e o foco podia tratar o fim da contagem duas vezes quando o tempo saltava. Os dois foram corrigidos e têm teste.

## 17. Rodada de 19/11/2026 (depois da aprovação do site)

Pedidos do Isaac e o que foi feito:

- **Som no temporizador.** Sino de 4 notas (foco e temporizador) e de 3 notas descendo (fim da pausa), feito com Web Audio, sem arquivo de áudio. Botão "Som ligado/desligado" com a escolha salva. Ao ligar, toca para mostrar.
- **Itens novos:** DashBeam, Nuvio, Blender, Krita, Godot, BGClear, Audacity, LMMS, Excalidraw, WispFile, QRPine, SnapYT (downloader de YouTube), Vectorizer, ColorZilla, StayFocusd, Proton VPN, NordVPN, Mullvad VPN. Courier Owls entrou com o link do CurseForge. Codenames confirmado em `codenames.game`.
- **Jogos:** 22 com imagem, Deltarune primeiro e Minecraft incluído. Entraram Paper Mario 64, Paper Mario TTYD, Zelda Ocarina of Time, Zelda A Link to the Past, Castlevania Symphony of the Night, Super Mario 64, Super Mario Bros. 3, Mario & Luigi Superstar Saga e Kirby & the Amazing Mirror. Capas retrato aparecem inteiras.
- **Descrição breve** no lugar de "por que uso", escrita para todos os itens. Sem texto do Isaac.
- **Temas:** só dark e white. Os azuis e rosa saíram.
- **FMHY:** ficam os três primeiros geradores de imagem.
- **Proton:** o da Valve e o Proton VPN.
- **De fora por ora:** verificador semanal de links, relógio mundial, alarme e seletor de cor.
- **Publicação:** GitHub Pages por fluxo automático a cada push. A hospedagem do OpenBot não serve (limite de 20 arquivos, 2 MB e 30 dias de validade). Vercel e Cloudflare Pages dariam um endereço mais curto, mas pedem login que não estava salvo.

Bug encontrado pelo teste de imagens: duas capas da Wikipédia tinham sido salvas vazias quando o Wikimedia limitou os pedidos (429). O montador agora recusa imagem vazia e as capas foram baixadas direto do `upload.wikimedia.org`.

## 18. Rodada de 19/11/2026, tarde

Pedidos do Isaac e o que foi feito:

- **Canivete:** o rótulo da seção atual não cobre mais o da lâmina sob o mouse. No tema claro o cabo é preto e vermelho, e o logo ganhou contorno.
- **Espaçamento maior** entre itens, grupos e seções.
- **Visualização por abas, opcional**, com o botão Abas.
- **Ferramentas:** temporizador com tempo personalizado, foco com tempos e ciclos personalizáveis, botão Expandir (modo foco) em cada uma, etiqueta "offline" removida, som opcional e desligado por padrão. Novas: Quanto tempo (partes opcionais), conversor de texto, conversor de unidades, calculadora, regra de 3, sorteio de nomes, número aleatório, roleta e sim ou não. Relógio mundial, alarme e seletor de cor ficaram de fora, como pedido.
- **Meus apps e Ferramentas** no topo. MoonDeck com o logo enviado.
- **Hero** com os nove destaques e **rodapé** novo.
- **Mods** num grupo só; Minecraft em abas (Launchers, Mods, Resource packs, Shaders, Servidores).
- **Krita** em Desenhar.
- **Itens novos:** RealtimeColors, Bitwarden, 1Password, Proton Mail, DuckDuckGo, Cloudflare 1.1.1.1, VirusTotal, Ninite, PDF24 Tools, ShareX, OBS Studio, 10 Minute Mail, Temp Mail, DeepL, smdownloader, VSCodium. Catálogo agora com 184 itens.

Bugs que os testes acharam: erro de hidratação do React no zalgo (acaso diferente no servidor), lista de unidades rolável sem acesso por teclado e 2 px de rolagem horizontal no celular, causada pela grade do rodapé. Os três foram corrigidos.
