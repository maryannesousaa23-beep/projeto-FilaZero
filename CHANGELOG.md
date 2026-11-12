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
