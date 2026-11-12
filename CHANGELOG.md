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
