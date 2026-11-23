# Assinatura de certificados e compatibilidade legada

## Estado atual

Certificados emitidos agora armazenam um HMAC-SHA256, com o `SECRET_KEY`, sobre
a identidade do titular, evento e tipo, o codigo de verificacao, o snapshot
JSON apresentado no PDF e os dados da imagem QR. A comparacao usa
`hmac.compare_digest`.

## Compatibilidade

Registos anteriores guardam um SHA-256 sem chave sobre os IDs, tipo e codigo;
nao incluem o snapshot. A verificacao publica continua a aceitar esse formato
antigo para nao invalidar certificados existentes. Esses registos nao ganham
protecao retroativa contra alteracao do snapshot. Novos certificados usam o
formato `hmac-sha256:` e autenticam o snapshot completo.

Alterar o `SECRET_KEY` invalida HMACs existentes. Instalacoes que precisam de
verificacao de certificados duradoura devem preservar essa chave ou preparar
rotacao de chaves com versoes antes de a substituir.

Uma futura migracao para invalidar ou converter os registos antigos exige uma
decisao explicita sobre preservar codigos ja distribuidos e sobre a chave usada
por cada instalacao.
