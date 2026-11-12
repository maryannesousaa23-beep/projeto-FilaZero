# Roteiro de testes — FilaZero

Este documento separa **testes executados** de **testes pendentes**. Não marque um cenário como aprovado sem executar os passos e guardar evidência.

## 1. Critérios funcionais da spec

| ID | Cenário | Resultado esperado | Situação atual |
|---|---|---|---|
| T01 | Cadastro válido | Conta CLIENT criada com bcrypt e redirecionamento ao login | Pendente: banco ainda não conectado à Vercel |
| T02 | E-mail duplicado | Servidor recusa duplicidade com mensagem clara | Pendente: integração |
| T03 | Validação no servidor | Nome, e-mail e senha inválidos são recusados | Código revisado; teste integrado pendente |
| T04 | Login válido | Sessão criada e painel acessível | Pendente: não há usuário no Neon |
| T05 | Login inválido | Acesso negado sem revelar o campo incorreto | Pendente: integração |
| T06 | Serviços ativos | Lista apenas serviços ativos com descrição e duração | Pendente: banco sem registros iniciais |
| T07 | Gerar senha | Código diário sequencial e status WAITING | Pendente: integração |
| T08 | Entrada duplicada | Segunda senha ativa para mesmo serviço é bloqueada | Pendente: integração |
| T09 | Posição e espera | Conta somente pessoas WAITING anteriores e estima minutos | Pendente: integração |
| T10 | Cancelamento permitido | Apenas WAITING pode ser cancelado | Código usa updateMany condicional; teste integrado pendente |
| T11 | Cancelamento proibido | CALLED/IN_SERVICE não podem ser cancelados pelo cliente | Código usa updateMany condicional; teste integrado pendente |
| T12 | Fila do funcionário | STAFF vê apenas serviços do estabelecimento vinculado | Código revisado; teste integrado pendente |
| T13 | Chamar próximo | Mais antiga WAITING passa a CALLED, sem chamadas concorrentes duplicadas | Código usa lock transacional; teste integrado pendente |
| T14 | Iniciar atendimento | CALLED passa a IN_SERVICE com horário | Código usa atualização condicional; teste integrado pendente |
| T15 | Finalizar atendimento | IN_SERVICE passa a COMPLETED com horário | Código usa atualização condicional; teste integrado pendente |
| T16 | Fila vazia | Mensagem clara e botão indisponível | Código da tela revisado; teste integrado pendente |
| T17 | Bloqueio por perfil | CLIENT não acessa /staff nem /admin | Requisições anônimas redirecionam ao login; teste com CLIENT autenticado pendente |
| T18 | Isolamento | STAFF não opera serviço de outro estabelecimento | Verificação de vínculo no servidor; teste integrado pendente |
| T19 | Editar serviço | ADMIN altera nome, descrição, prefixo e duração somente no próprio estabelecimento | Implementado nesta revisão; teste integrado pendente |

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
| Conta ADMIN inicial | **Pendente** | Consulta à tabela User retornou zero registros |
| Estabelecimento e serviço iniciais | **Pendente** | Seed ainda não foi executado no banco principal |
| Conexão da aplicação Vercel ao Neon | **Bloqueada** | DATABASE_URL e DIRECT_URL existem no painel, mas estão sem valor |
| Fluxo completo cliente → atendente → conclusão | **Pendente** | Não é possível validar sem as variáveis de conexão e dados iniciais |

## 3. Testes unitários registrados anteriormente

O histórico anterior do projeto registra quatro testes de regras puras aprovados com Node.js 22: transições de estado, formatação de senhas, cálculo de estimativa e intervalo diário UTC. Eles não substituem os testes integrados com PostgreSQL.

Para repetir localmente:

```bash
npm install
npm run test:unit
```

## 4. Configuração bloqueadora antes do teste ponta a ponta

Na Vercel, abra **Project → Settings → Environment Variables** e preencha, sem publicar os valores em mensagens ou no GitHub:

- `DATABASE_URL`: URI pooled do Neon (hostname com `-pooler` e parâmetro `pgbouncer=true`).
- `DIRECT_URL`: URI direta do Neon (hostname sem `-pooler`).
- `NEXTAUTH_SECRET`: segredo forte e privado.
- `NEXTAUTH_URL`: `https://projeto-filazero.vercel.app`.

Depois de salvar, faça um novo deploy de produção. A aplicação precisa de DATABASE_URL e DIRECT_URL preenchidas; a página inicial, sozinha, não comprova conexão com o banco.

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
- [ ] Seed executado e conta ADMIN confirmada no Neon.
- [ ] Login ADMIN validado.
- [ ] Cadastro CLIENT e login validados.
- [ ] Entrada, acompanhamento, cancelamento e posição validados.
- [ ] STAFF criado pelo ADMIN e fluxo de chamada/início/conclusão validado.
- [ ] Isolamento por estabelecimento testado com duas contas/estabelecimentos.
- [ ] Testes manuais restantes executados e evidências registradas.
