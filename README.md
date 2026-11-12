# FilaZero — Sistema Inteligente de Gerenciamento de Filas

Aplicação web para que usuários retirem senhas digitais e acompanhem filas, enquanto funcionários controlam os atendimentos e administradores gerenciam os serviços.

## Tecnologias
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL (Neon recomendado)
- Prisma ORM
- NextAuth Credentials + bcryptjs
- Vercel (deploy) e GitHub (versionamento)

## Requisitos
- Node.js 20 ou superior
- Banco PostgreSQL acessível
- npm

## Configuração local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis:
   ```bash
   cp .env.example .env
   ```
   Configure `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` e as variáveis `SEED_*`. Gere um segredo forte para `NEXTAUTH_SECRET` (por exemplo, `openssl rand -base64 32`). Use uma senha de administrador com pelo menos 12 caracteres.
3. Gere o Prisma Client e crie as tabelas:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Crie o estabelecimento inicial, o serviço de exemplo e o primeiro administrador:
   ```bash
   npm run db:seed
   ```
5. Inicie o sistema:
   ```bash
   npm run dev
   ```
6. Acesse `http://localhost:3000`.

## Perfis
- **CLIENT:** cria conta, consulta estabelecimentos/serviços, entra em fila, acompanha a senha e cancela enquanto aguarda.
- **STAFF:** acessa apenas estabelecimentos vinculados e opera chamadas, início e conclusão.
- **ADMIN:** gerencia serviços e cria contas de funcionários do estabelecimento vinculado.

O primeiro ADMIN é criado exclusivamente pelo seed. O cadastro público cria somente usuários CLIENT.

## Variáveis de ambiente
| Variável | Finalidade |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL/Neon |
| `NEXTAUTH_SECRET` | Segredo para assinatura das sessões |
| `NEXTAUTH_URL` | URL base da aplicação |
| `SEED_ADMIN_NAME` | Nome do administrador inicial |
| `SEED_ADMIN_EMAIL` | E-mail do administrador inicial |
| `SEED_ADMIN_PASSWORD` | Senha inicial (mínimo 12 caracteres) |
| `SEED_ESTABLISHMENT_NAME` | Nome do estabelecimento inicial |
| `SEED_ESTABLISHMENT_ADDRESS` | Endereço do estabelecimento inicial |

**Nunca envie `.env` ao GitHub.** O `.gitignore` já exclui esse arquivo. Na Vercel, cadastre as variáveis em Settings → Environment Variables.

## Publicação na Vercel
1. Crie um banco PostgreSQL no Neon e copie a connection string com SSL.
2. Envie o projeto para um repositório GitHub.
3. Na Vercel, importe o repositório e configure as variáveis acima.
4. Antes do primeiro acesso, aplique o schema (`npx prisma db push`) e execute o seed com as variáveis `SEED_*` em ambiente seguro. Não mantenha a senha de seed após a criação inicial; remova-a das variáveis da Vercel depois.
5. Faça o deploy e teste o link de produção em janela anônima.

## Testes e documentação
- `spec.md`: requisitos, modelo de dados e critérios de aceite.
- `TESTES.md`: roteiro de testes funcionais e de segurança.
- `CHANGELOG.md`: decisões, correções e limitações registradas.

## Observação sobre o estado do projeto
O código-fonte está preparado para execução e deploy, mas não há credenciais do GitHub, Neon ou Vercel incluídas neste pacote. Portanto, o banco remoto e a URL pública precisam ser configurados na conta do estudante antes de a entrega ser considerada publicada e validada.
