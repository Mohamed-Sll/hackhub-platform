# Inscricao publica em eventos

## Fluxo

A pagina publica de um evento permite enviar nome completo e email sem criar
conta. A API aceita inscricoes apenas quando o evento esta `published` ou
`in_progress`, normaliza o email para minusculas e impede duplicados no mesmo
evento. A mesma pessoa pode usar o email noutro evento.

A inscricao nao cria automaticamente utilizador, equipa ou projeto. O fluxo nao
envia email de confirmacao e ainda nao impoe o limite de participantes do evento.

## Acesso e dados

Visitantes nao conseguem listar ou consultar inscricoes. Apenas o organizador
dono do evento ou um admin pode ver a lista no dashboard ou remover uma
inscricao. O endpoint de exportacao inclui inscritos publicos e participantes
aceites de equipas, deduplicados por email. Dados nao sao expostos na pagina
publica do evento.

Os dados ficam na tabela SQLite `event_registrations`; apagar o evento remove os
registos associados por cascade. Nao existe ainda politica automatica de
retencao ou backup remoto. Para detalhes do schema, consultar
`MEMORIA/db/schema.md`.
