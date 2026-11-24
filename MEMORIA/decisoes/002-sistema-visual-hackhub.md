# Sistema visual do HackHub

## Fonte de verdade

`docs/design/hackhub-all-pages.html` define a composição visual, os tokens e a
navegação que o frontend real deve seguir. É uma referência de desenho, não uma
implementação funcional nem uma fonte de dados.

## Aplicação

- O tema escuro usa preto puro como fundo; o tema claro conserva uma base quente
  e clara. Ambos usam os mesmos níveis de superfície, borda e hierarquia.
- Laranja coral é o acento principal. Azul ciano e verde são sinais secundários,
  usados com contenção e conforme a referência.
- A aplicação mantém uma rail lateral, barra superior compacta e uma área de
  conteúdo centrada e responsiva.
- Estados e conteúdo vêm das APIs, permissões e fluxos reais. Nenhum dado de
  demonstração do protótipo passa para o produto.
- Cartões e linhas mantêm a mesma aparência ao passar o cursor ou tocar.
  Botões não têm animação; foco visível e redução de movimento são preservados.

## Implementação

Os tokens e regras globais estão em `frontend/src/styles/globals.css`; o shell
fica em `frontend/src/app/layout.tsx` e `frontend/src/components/layout/`.

## Idioma, temas e diálogos

- PT e EN são idiomas reais da interface; a seleção persiste em `localStorage`,
  atualiza `html.lang` e também cobre mensagens de erro da API, notificações,
  rótulos acessíveis e datas.
- O tema escuro é o padrão e usa preto puro no fundo. A alternância manual para
  o tema claro continua disponível e persiste através do `next-themes`.
- Diálogos Radix mantêm o foco, fecham com Escape e devolvem o foco ao controlo
  de origem. Cabeçalho e ações ficam visíveis enquanto o corpo rola dentro de
  um limite baseado na altura disponível do viewport.
- Abas longas em ecrãs estreitos rolam dentro do próprio separador, sem
  alargar a página.

## Ilustração da página inicial

- O hero representa a descoberta, criação e celebração com uma galáxia CSS em
  perspetiva 3D, partículas e órbitas nos acentos coral e ciano.
- A animação não depende de imagens remotas nem de biblioteca 3D; respeita
  `prefers-reduced-motion` e mantém o núcleo da marca legível em ecrãs pequenos.
