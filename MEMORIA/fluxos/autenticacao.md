# Fluxo de autenticacao

## Registo

1. `POST /api/v1/auth/register` valida email, username e palavra-passe.
2. O backend impede duplicados, guarda hash `bcrypt-sha256` e forca papel
   `participant`.
3. E enviado email de verificacao se SMTP estiver configurado.
4. O registo nao inicia sessao automaticamente.

Hashes bcrypt legados continuam verificaveis e sao re-hashed no proximo login.

## Sessao

1. `POST /auth/login` valida credenciais e conta ativa.
2. O backend cria `auth_sessions`, guarda apenas o SHA-256 do refresh e inclui
   o `sid` e um `jti` aleatorio nos JWT.
3. A resposta define cookies HTTP-only `access_token` e `refresh_token`.
   A sessao e confirmada na base antes de os cookies serem emitidos, tanto no
   login como na rotacao por refresh.
4. Cookies sao `Secure` fora de `development` e `test`.
5. No arranque, o frontend chama `/auth/session`. Sem cookies de sessao, o
   endpoint devolve `null` com `200`, tratando visitantes anonimos como estado
   normal. Com uma sessao valida, devolve apenas o utilizador autenticado.
6. Se existir cookie expirado, um `401` no bootstrap coordena `/auth/refresh` e
   repete o pedido uma vez. Falha no bootstrap termina como sessao ausente sem
   redirecionar uma pagina publica. `/auth/me` continua protegido e devolve
   `401` sem autenticacao.
7. Refresh valido roda ambos os tokens e substitui o hash armazenado. Reuso de
   um refresh anterior revoga a sessao inteira.
8. `POST /auth/logout` revoga a sessao e remove ambos os cookies.

Depois do login, o frontend encaminha `admin` e `organizer` para `/dashboard`;
`participant` e `judge` seguem para `/events`. Se uma sessao de participante ja
estiver ativa ao abrir o login do organizador, a pagina oferece terminar essa
sessao e continuar para trocar de conta em vez de redirecionar silenciosamente
para `/events`.

Bearer access tokens continuam aceites para clientes nao-browser, mas precisam
de uma sessao ativa. Tokens nunca sao devolvidos no corpo do login/refresh.

## Recuperacao e verificacao

- Links usam `APP_URL` e tokens JWT `type=action`, separados dos tokens de
  sessao, com acao `verify_email` ou `password_reset`.
- Reset recebe `{token, new_password}` em `/auth/password-reset/confirm`.
- O token de reset inclui `password_reset_version`; sucesso incrementa a versao
  e impede replay.
- Reset de palavra-passe revoga todas as sessoes do utilizador.
- Pedido de reset devolve sempre mensagem neutra para nao enumerar contas.
- Numa instalacao local sem SMTP, o proprietario pode executar
  `python -m app.reset_password` dentro de `backend/`. O comando pede o email,
  exige confirmacao explicita e palavra-passe duas vezes; depois incrementa a
  versao de reset e revoga todas as sessoes ativas dessa conta.

## Protecoes HTTP

Rotas de autenticacao tem limites especificos por IP. Requests inseguros que
usam cookies sao validados contra `Origin`; CORS permanece propriedade do
FastAPI. Hosts, HTTPS e segredo forte sao validados no ambiente de producao.
