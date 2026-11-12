# Roteiro de testes — FilaZero

Este documento separa **testes executados** de **testes pendentes**. Não marque um cenário como aprovado sem executar os passos e guardar evidência.

## 1. Critérios funcionais da spec

| ID | Cenário | Resultado esperado | Situação atual |
|---|---|---|---|
| T01 | Cadastro válido | Conta CLIENT criada com bcrypt e redirecionamento ao login | **Passou para conta titular**: cadastro persistiu no Neon; conta foi promovida a ADMIN após confirmação do titular |
| T02 | E-mail duplicado | Cadastro duplicado recusado com mensagem clara | Confirmado pelo usuário como funcionamento geral; evidência individual não coletada |
| T03 | Validação no servidor | Dados inválidos recusados | Código revisado; teste individual não coletado |
| T04 | Login ADMIN | Sessão autenticada e painel administrativo acessível | **Passou manualmente**: titular confirmou que conseguiu entrar e visualizar o painel ADMIN |
| T05 | Login inválido | Acesso negado | Confirmado pelo usuário como funcionamento geral; evidência individual não coletada |
| T06 | Serviços ativos | Listagem de serviços ativos | Serviço inicial consultado em produção; confirmação manual geral |
| T07 | Gerar senha | Código diário sequencial e status WAITING | Confirmado pelo usuário como funcionamento geral; evidência individual não coletada |
| T08 | Entrada duplicada | Segunda senha ativa bloqueada | Código revisado; teste individual não coletado |
| T09 | Posição e espera | Contagem e estimativa corretas | Código revisado; teste individual não coletado |
| T10 | Cancelamento permitido | WAITING cancelado | Confirmado pelo usuário como funcionamento geral; evidência individual não coletada |
| T11 | Cancelamento proibido | CALLED/IN_SERVICE não cancelados | Código revisado; teste individual não coletado |
| T12 | Fila do funcionário | STAFF vê seus serviços | Confirmado pelo usuário como funcionamento geral; evidência individual não coletada |
| T13 | Chamar próximo | Ordem e concorrência corretas | Confirmado pelo usuário como funcionamento geral; evidência individual não coletada |
| T14 | Iniciar atendimento | CALLED passa para IN_SERVICE | Confirmado pelo usuário como funcionamento geral; evidência individual não coletada |
| T15 | Finalizar atendimento | IN_SERVICE passa para COMPLETED | Confirmado pelo usuário como funcionamento geral; evidência individual não coletada |
| T16 | Fila vazia | Mensagem e ação desabilitada | Código revisado; teste individual não coletado |
| T17 | Bloqueio por perfil | CLIENT não acessa ADMIN/STAFF | Código revisado; teste com perfil CLIENT não coletado |
| T18 | Isolamento | STAFF não opera outro estabelecimento | Código revisado; teste integrado individual não coletado |
| T19 | Editar serviço | ADMIN edita apenas o próprio estabelecimento | Implementação revisada; teste individual não coletado |

## 2. Evidências verificadas em 12/11/2026

| Verificação | Resultado | Evidência |
|---|---|---|
| Build de produção Vercel | **Passou no commit 6d524f1** | Vercel registrou compilação Next.js, verificação de tipos, geração de 13 páginas e deployment READY |
| Página inicial | **Passou** | HTTP 200 no domínio principal |
| Página de login | **Passou** | HTTP 200 no domínio principal |
| Página de cadastro | **Passou** | HTTP 200 no domínio principal |
| Rotas privadas sem sessão | **Passou** | /dashboard, /admin, /staff e /estabelecimentos redirecionaram para /login |
| Schema Neon na branch de produção | **Passou** | 5 tabelas: User, Establishment, StaffEstablishment, Service e QueueEntry |
| Tipos e relacionamentos no Neon | **Passou** | Enums Role e QueueStatus; 6 chaves estrangeiras verificadas |
| Conta ADMIN inicial | **Passou** | Conta `maryannesousaa23@gmail.com` existe como ADMIN e está vinculada ao estabelecimento principal; titular confirmou acesso ao painel |
| Estabelecimento inicial | **Parcial** | O seed executado durante um build criou `filazero-seed-establishment` antes de falhar por ausência de `SEED_ADMIN_PASSWORD` |
| Serviço inicial | **Passou** | `Atendimento Geral` criado no Neon com prefixo ATD, média de 10 minutos e ativo |
| Conexão Vercel → Neon | **Passou para runtime** | `/estabelecimentos` respondeu HTTP 200 e exibiu os dados reais consultados no Neon; valores sensíveis permanecem mascarados pela API |
| Consulta pública de estabelecimentos | **Passou** | A rota `/estabelecimentos` abriu sem sessão e exibiu o estabelecimento e serviço iniciais |
| Conta ADMIN inicial | **Pendente** | Ainda não existe usuário na tabela User; aguarda cadastro do titular do e-mail para promoção segura |
| Fluxo completo cliente → atendente → conclusão | **Pendente** | Ainda não existe conta ADMIN/STAFF nem usuário CLIENT para o teste ponta a ponta |

## 3. Testes unitários registrados anteriormente

O histórico anterior do projeto registra quatro testes de regras puras aprovados com Node.js 22: transições de estado, formatação de senhas, cálculo de estimativa e intervalo diário UTC. Eles não substituem os testes integrados com PostgreSQL.

Para repetir localmente:

```bash
npm install
npm run test:unit
```

## 4. Variáveis de ambiente e preparação final

Na Vercel, abra **Project → Settings → Environment Variables** e confira, sem publicar os valores em mensagens ou no GitHub:

- `DATABASE_URL`: URI pooled do Neon (hostname com `-pooler` e parâmetro `pgbouncer=true`).
- `DIRECT_URL`: URI direta do Neon (hostname sem `-pooler`).
- `NEXTAUTH_SECRET`: segredo forte e privado.
- `NEXTAUTH_URL`: `https://projeto-filazero.vercel.app`.

A rota `/estabelecimentos` foi testada em produção e respondeu HTTP 200 exibindo o estabelecimento e o serviço reais consultados no Neon. Isso comprova a conexão de runtime via `DATABASE_URL`. Confira `DIRECT_URL` no painel Vercel para garantir que ela use a conexão direta (sem `-pooler`) nas próximas operações de schema/migração. A senha do seed deve ficar somente no `.env` local, nunca no GitHub.

## 5. Criar dados iniciais com segurança

Com as variáveis configuradas em um ambiente local seguro (não cole credenciais no chat):

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Configure `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ESTABLISHMENT_NAME` e `SEED_ESTABLISHMENT_ADDRESS` apenas no ambiente seguro de execução do seed. Não versione o arquivo `.env` nem mantenha a senha temporária após o bootstrap.

## 6. Checklist final de entrega

- [ ] DATABASE_URL e DIRECT_URL configuradas na Vercel.
- [ ] Deploy READY depois da configuração do banco.
- [x] Conta ADMIN criada a partir do cadastro do titular, promovida no Neon e vinculada ao estabelecimento principal.
- [x] Login ADMIN validado pelo titular com acesso ao painel.
- [ ] Cadastro CLIENT e login validados.
- [ ] Entrada, acompanhamento, cancelamento e posição validados.
- [ ] STAFF criado pelo ADMIN e fluxo de chamada/início/conclusão validado.
- [ ] Isolamento por estabelecimento testado com duas contas/estabelecimentos.
- [ ] Testes manuais restantes executados e evidências registradas.


## 7. Confirmação manual geral do usuário — 12/11/2026

O titular informou: **"tudo funcionando"**, após confirmar que conseguiu entrar no painel ADMIN. Isso é registrado como confirmação geral do funcionamento observado pelo usuário, sem atribuir aprovação individual a todos os cenários T02–T19. Para auditoria, cada cenário ainda deve ter evidência individual ou teste automatizado/integrado correspondente.
