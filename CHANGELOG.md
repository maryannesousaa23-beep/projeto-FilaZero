# Changelog — FilaZero

Este arquivo registra as decisões e revisões humanas do desenvolvimento. Atualize-o a cada alteração relevante aceita ou rejeitada.

## 2026-11-12 — Estrutura inicial funcional

### Implementado
- Estrutura Next.js 14 com TypeScript e Tailwind CSS, preparada para publicação na Vercel.
- Modelo relacional Prisma com usuários, estabelecimentos, vínculos de funcionários, serviços e entradas de fila.
- Cadastro de usuários com validação no servidor e hash bcrypt.
- Login com NextAuth Credentials e sessão JWT.
- Perfis CLIENT, STAFF e ADMIN; páginas e ações verificam o perfil e o vínculo ao estabelecimento no servidor.
- Consulta de estabelecimentos/serviços, geração de senha sequencial diária e prevenção de entradas ativas duplicadas.
- Acompanhamento de posição e estimativa de espera; cancelamento apenas enquanto aguardando.
- Painel de funcionário com chamada ordenada, início e conclusão do atendimento.
- Painel administrativo para cadastro/pausa de serviços e criação de funcionários.
- Seed idempotente para estabelecimento, serviço de exemplo e administrador inicial.
- Documentação de instalação, variáveis, testes e publicação.

### Decisões técnicas revisadas
- A senha é armazenada somente como hash bcrypt, nunca em texto puro.
- As consultas de dados são realizadas pelo Prisma ORM, evitando SQL concatenado com dados recebidos.
- A numeração de senhas é serializada por serviço durante a transação para reduzir colisões em solicitações simultâneas.
- O administrador inicial é criado por seed com credencial configurada localmente; não existe senha padrão embutida no código.

### Limitações conhecidas antes da publicação
- O sistema ainda precisa ser conectado a um banco Neon real e testado com as variáveis de produção.
- A atualização da tela de acompanhamento ocorre ao recarregar a página; atualização automática por polling/notificações pode ser acrescentada em etapa posterior.
- O projeto precisa passar pelo teste de build e pelos casos manuais descritos em `TESTES.md` no ambiente configurado.

## 2026-11-12 — Revisão de autorização e atualização de tela
- A autorização agora reconsulta o perfil no banco em cada operação protegida, evitando confiar exclusivamente no papel contido no token da sessão.
- As telas de acompanhamento da senha e operação do funcionário atualizam os dados automaticamente a cada cinco segundos.
- O painel administrativo inclui gráfico simples de entradas nos últimos sete dias.
- Revisão: consultas administrativas exigem vínculo explícito com um estabelecimento.


## 12/11/2026 — Revisão local adicional (código, sem deploy)
- Reutilizada a base funcional existente; a conexão Neon/Vercel não é pré-requisito para revisar código.
- Corrigida operação concorrente da fila: chamada serializada por serviço e atualização condicional no banco para impedir duas chamadas conflitantes.
- Cancelamento passa a conferir o estado diretamente no `updateMany`, evitando cancelar atendimento já chamado.
- Início/finalização verificam o responsável pela chamada e o estado atual; não é permitido avançar atendimento de outro funcionário.
- Numeração das senhas usa intervalo diário UTC fixo, documentando o critério de virada de dia.
- Ordenação de atendimentos inclui `id` como critério secundário para empates de horário.
- Tela de administração de serviços e funcionários agora bloqueia administradores sem estabelecimento vinculado, evitando consulta ampla por filtro ausente.
- Adicionada biblioteca de regras puras (`lib/queue-rules.ts`) e 4 testes com Node.js nativo.
- **Revisão humana necessária:** avaliar se o fuso desejado para reset diário é o UTC ou o local do estabelecimento, antes da entrega. UTC é provisório e determinístico.
- **Pendente:** instalar dependências, executar build e validar o fluxo contra Neon e Vercel.


## 12/11/2026 — Alinhamento com a spec e diagnóstico de publicação
- Revisada a implementação contra os RF01–RF15 e RNF01–RNF10 da spec entregue.
- Confirmada a existência das cinco entidades previstas no schema Prisma e dos três perfis de acesso.
- Verificado build de produção concluído na Vercel e resposta da página inicial no domínio principal.
- Diagnóstico do Neon confirmou conexão PostgreSQL; o schema público estava inicialmente vazio.
- Preparada migração de banco em branch temporária e inspecionadas tabelas, colunas e chaves estrangeiras. A aplicação na branch principal aguarda confirmação explícita.
- Adicionada a variável documentada `DIRECT_URL` ao exemplo de ambiente e às instruções de configuração; ela é usada pelo Prisma para operações diretas de schema.
- Corrigida documentação que ainda descrevia o banco e o deploy como não configurados, distinguindo build concluído de fluxo de negócio ainda não validado.
- **Pendente:** criar/confirmar administrador inicial e executar testes ponta a ponta com banco principal.
- **Revisão humana:** confirmar o fuso horário UTC usado na virada diária das senhas.


## 12/11/2026 — Auditoria técnica complementar e correções

### Revisão da implementação contra a spec
- Conferidos os requisitos RF01–RF15, RNF01–RNF10, casos de uso e critérios de aceite do arquivo entregue.
- Confirmadas as rotas de cadastro, login, dashboard, estabelecimentos, filas, operação de funcionário e administração.
- Confirmada a verificação de sessão e papel no servidor por meio de `requireUser` e `requireRole`.
- Confirmado que ações de fila validam o vínculo do serviço ao estabelecimento do funcionário.
- Confirmada a existência de transação com advisory lock para emissão/chamada de senha e atualização condicional para cancelamento/início/conclusão.
- Identificada ausência de formulário/ação de edição de serviço; adicionados `updateServiceAction` e formulário de edição restrito ao estabelecimento do administrador.
- Endurecida a validação server-side de cadastro de funcionários com Zod e tratamento de conflito de e-mail duplicado.
- Tratada a corrida de cadastro duplicado de CLIENT para devolver mensagem amigável quando o índice único do banco detectar concorrência.

### Estado real do Neon e da Vercel
- Migração aplicada à branch default `production` do projeto Neon `FilaZero`.
- Verificadas as cinco tabelas previstas, dois enums e seis chaves estrangeiras.
- A tabela `User` continua sem registros; não há conta ADMIN criada.
- O deploy do commit `6d524f1` foi concluído como READY; o build compilou o Next.js, verificou tipos e gerou as páginas.
- A página inicial, login e cadastro responderam HTTP 200. Rotas privadas sem sessão redirecionaram para login.
- **Bloqueio confirmado:** `DATABASE_URL`, `DIRECT_URL` e `SEED_ADMIN_PASSWORD` estão sem valor no projeto Vercel. O painel de variáveis foi acessado, mas a integração disponível não aceitou gravar esses segredos; eles não foram colocados em texto puro nem publicados no GitHub.
- O seed interrompido deixou um estabelecimento inicial no banco, mas não criou usuário nem serviço. Nenhum login real ou fluxo completo de fila foi declarado aprovado.

### Próximos passos obrigatórios
1. Inserir os valores de DATABASE_URL e DIRECT_URL diretamente no painel da Vercel, como variáveis sensíveis.
2. Fazer novo deploy de produção.
3. Executar o seed em ambiente seguro para criar estabelecimento, serviço e ADMIN.
4. Confirmar a conta e executar os cenários ponta a ponta de TESTES.md.
5. Reavaliar o fuso diário da emissão de senhas: a implementação atual usa UTC, conforme documentado em `lib/queue-rules.ts`.


## 12/11/2026 — Validação de runtime e dados iniciais

- Confirmado que o seed executado durante um build criou o estabelecimento inicial antes de parar por ausência de `SEED_ADMIN_PASSWORD`.
- A validação do seed foi movida para antes de qualquer escrita, evitando deixar novos dados parciais se a senha não estiver configurada.
- Criado o serviço inicial `Atendimento Geral` no Neon: prefixo `ATD`, estimativa média de 10 minutos e status ativo.
- A rota pública `/estabelecimentos` respondeu HTTP 200 no domínio de produção e exibiu o estabelecimento e o serviço lidos do Neon. Isso comprova a conexão Prisma de runtime com o banco.
- O cadastro de usuário ADMIN permanece pendente. O caminho seguro é o titular cadastrar a própria conta em `/cadastro`; depois a conta existente pode ser promovida para ADMIN e vinculada ao estabelecimento sem compartilhar senha.
- O deploy de código `2273060` concluiu como READY e contém a edição de serviços, validação de STAFF, listagem pública e validação segura do seed.
