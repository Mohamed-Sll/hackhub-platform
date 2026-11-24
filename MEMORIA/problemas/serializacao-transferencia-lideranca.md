# Serialização após transferir liderança

Ao transferir a liderança, o `flush` atualiza `Team.updated_at` e pode expirar
esse atributo na sessão assíncrona do SQLAlchemy. A serialização da resposta
tentava carregá-lo de forma implícita fora do contexto async e causava
`MissingGreenlet` (erro 500). Depois do `flush`, `TeamService.change_leader`
volta a carregar a equipa com os membros antes de devolver a resposta.
