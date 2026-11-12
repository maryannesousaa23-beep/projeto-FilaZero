# Roteiro de testes — FilaZero

Registre data, ambiente, resultado (Passou/Falhou) e evidência após executar cada cenário.

| ID | Cenário | Passos | Resultado esperado |
|---|---|---|---|
| T01 | Cadastro válido | Criar conta com nome, e-mail e senha >= 6 caracteres | Conta criada; senha salva somente em hash; redireciona para login |
| T02 | E-mail duplicado | Tentar cadastrar e-mail já utilizado | Operação recusada com mensagem clara |
| T03 | Validação no servidor | Enviar nome vazio ou senha curta | Servidor recusa a gravação |
| T04 | Login válido | Entrar com credenciais corretas | Sessão criada e painel acessível |
| T05 | Login inválido | Usar senha incorreta | Acesso negado sem revelar qual campo falhou |
| T06 | Serviços ativos | Abrir estabelecimentos com usuário autenticado | Lista somente serviços ativos e mostra tempo médio |
| T07 | Gerar senha | Entrar em serviço que já tem senhas no dia | Cria senha sequencial e status Aguardando |
| T08 | Entrada duplicada | Tentar entrar novamente no mesmo serviço com senha ativa | Segunda senha bloqueada |
| T09 | Posição e espera | Criar senhas anteriores e consultar a própria | Conta pessoas à frente e multiplica pelo tempo médio |
| T10 | Cancelamento permitido | Cancelar senha Aguardando | Status Cancelado; deixa de contar na fila |
| T11 | Cancelamento proibido | Tentar cancelar senha chamada/em atendimento | Operação recusada |
| T12 | Fila do funcionário | Entrar como funcionário vinculado | Visualiza apenas serviços do estabelecimento vinculado |
| T13 | Chamar próximo | Clicar em Chamar Próximo | Primeira senha Aguardando passa a Chamado |
| T14 | Iniciar atendimento | Iniciar senha chamada | Status Em Atendimento e horário registrado |
| T15 | Finalizar atendimento | Finalizar senha em atendimento | Status Concluído e horário final registrado |
| T16 | Fila vazia | Abrir painel sem pessoas aguardando | Mensagem de fila vazia e botão indisponível |
| T17 | Bloqueio por perfil | Tentar abrir `/staff` como CLIENT | Acesso negado/redirecionado |
| T18 | Isolamento | Funcionário tentar operar fila de outro estabelecimento | Operação negada no servidor |

## Segurança pré-deploy
- [ ] Senhas persistidas somente com bcrypt.
- [ ] Validação de dados no servidor com Zod.
- [ ] Consultas via Prisma ORM.
- [ ] Verificação de sessão, perfil e vínculo no servidor.
- [ ] `.env` fora do Git e variáveis configuradas na hospedagem.
- [ ] Mensagens de erro sem stack trace ou dados sensíveis.
- [ ] HTTPS ativo na produção.
- [ ] Build de produção executado sem erros.
- [ ] Teste em janela anônima, sem login em serviços externos.

**Não marque testes como aprovados sem executá-los.**

## Execução registrada — 12/11/2026

| Verificação | Ambiente | Resultado | Evidência |
|---|---|---|---|
| Regras de transição de estado | Node.js 22, sem banco | **Passou** | `npm run test:unit` — teste 1 |
| Numeração e validação de senha | Node.js 22, sem banco | **Passou** | `npm run test:unit` — teste 2 |
| Cálculo da estimativa de espera | Node.js 22, sem banco | **Passou** | `npm run test:unit` — teste 3 |
| Limites diários em UTC | Node.js 22, sem banco | **Passou** | `npm run test:unit` — teste 4 |
| Build do Next.js/Prisma | Ambiente sem dependências instaladas | **Não executado** | `npm install` excedeu limite disponível |
| Conexão PostgreSQL Neon | Consulta SQL de diagnóstico | **Passou** | Banco respondeu como PostgreSQL; tabelas ainda não aplicadas à branch principal |\n| Estrutura Prisma no banco principal | Neon branch principal | **Pendente** | Migração testada em branch temporária; aguarda confirmação para aplicação |\n| Fluxo ponta a ponta com banco | Produção | **Pendente** | Executar após aplicar schema e seed do administrador |
| Build de produção | Vercel | **Passou** | Deploy de produção marcado READY; compilação Next.js e geração do Prisma Client concluídas |\n| Resposta da página inicial | Domínio de produção | **Passou** | Consulta HTTP ao domínio principal retornou HTML da aplicação |\n| Acesso anônimo completo | Navegador sem sessão | **Pendente** | A proteção SSO está habilitada para domínios de deploy; testar acesso de avaliador |

**Limitações:** testes unitários não substituem testes funcionais integrados. A página inicial tem dados ilustrativos explicitamente identificados como exemplo, não um registro real.
