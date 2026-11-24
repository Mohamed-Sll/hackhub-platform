# Estado do produto

## Visao atual

HackHub e uma aplicacao web para gerir hackathons. O repositorio tem uma base
pronta para implantacao controlada numa unica instancia com SQLite. Uma entrada
em producao continua dependente de configuracao de segredos, TLS, SMTP/Telegram,
backups, observabilidade externa e validacao de carga no ambiente de destino.

## Implementado

- Inscricao publica em eventos com nome e email sem conta; dono do evento/admin pode consultar ou remover os registos.
- Registo, login, refresh rotativo e logout com sessoes revogaveis e cookies
  HTTP-only.
- Verificacao de email e reset de palavra-passe com tokens de acao separados;
  reset e de uso unico e revoga todas as sessoes existentes.
- Perfil privado, estatisticas reais e papeis `admin`, `organizer`, `judge` e
  `participant`.
- CRUD e ciclo de estado de eventos: `draft -> published -> in_progress -> closed`;
  eventos publicados tambem podem voltar a `draft`.
- Equipas por evento, convites acionaveis, codigo de entrada, transferencia de
  lideranca, saida e remocao de membros.
- Um projeto por equipa, edicao pelo lider e submissao.
- Desafios, categorias e criterios ponderados por evento, com gestao no
  dashboard e apresentacao publica real.
- Avaliacoes de projetos submetidos por jurados/admins e ranking medio.
- Ranking por HTTP e stream SSE; Redis e cache opcional.
- Notificacoes persistidas; email e Telegram por `telegram_chat_id` sao
  integracoes opcionais.
- O perfil nao pede `telegram_chat_id`: a aplicacao nao tem um fluxo para ligar
  o utilizador ao bot; IDs ja guardados continuam preservados e utilizaveis.
- Certificados PDF com QR code, verificacao publica e deteccao de alteracao do
  snapshot assinado.
- Dashboard global de admin, dashboard limitado aos eventos do organizador,
  metricas publicas reduzidas, estatisticas de evento e exportacao CSV/XLSX.
- Assistente de evento e feedback de projeto dependem de `OPENAI_API_KEY`. A sugestao global de equipas foi removida por expor perfis sem relacao com o evento.
- Migracoes Alembic para instalacao nova e atualizacao da base SQLite legada.
- Health checks, request IDs, logs estruturados, trusted hosts, headers de
  seguranca e rate limiting.
- Interface Next.js para todos os fluxos acima, incluindo verificacao publica
  de certificados.
- Interface PT/EN com preferencia persistente, mensagens de erro/notificacao e
  datas localizadas; o tema escuro preto e o padrao e o tema claro esta disponivel.
- O preview Vercel e apenas frontend: com `VERCEL_ENV=preview`, a aplicacao
  nao inicia a sessao nem consulta API de eventos/metricas; mostra um aviso com
  ligacao para executar o projeto localmente. Os fluxos com dados continuam a
  funcionar na instalacao local.
- Dialogos com scroll interno, foco inicial/contido e retorno ao controlo de
  origem; as abas de eventos podem deslocar-se dentro da area em ecras estreitos.

## Parcial ou limitado

- SQLite e o caminho suportado para uma unica instancia. Escala horizontal ou
  concorrencia elevada requerem uma base servidor e validacao propria.
- Redis nao e obrigatorio. Sem Redis, ranking funciona sem cache e limites
  diarios de tokens de IA ficam desativados.
- Inscricoes publicas sao independentes de equipas, mas ainda nao impoem lotacao nem enviam email de confirmacao.
- Notificacoes push sao apenas registos internos; nao existe service worker.
- Certificados usam hash autenticado no servidor, nao assinatura PDF publica
  baseada em certificado digital.
- Nao existe WebSocket; o tempo real de ranking usa SSE.
- Entrega SMTP, Telegram e chamadas OpenAI nao sao cobertas pela suite local
  sem credenciais reais; devem ser exercitadas em staging.

## Fora do estado atual

- Celery e processamento distribuido de tarefas.
- Dominios personalizados e faturacao dos planos de organizacao.
- Upload e armazenamento proprio de ficheiros/media.
- Nao ha atribuicao de jurados por evento: qualquer conta `judge` pode avaliar, mas cada jurado so le os proprios comentarios; dono/admin le todos.
