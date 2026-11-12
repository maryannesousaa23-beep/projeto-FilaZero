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
   Configure `DATABASE_URL` (conexão pooled), `DIRECT_URL` (conexão direta para o Prisma), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` e as variáveis `SEED_*`. Gere um segredo forte para `NEXTAUTH_SECRET` (por exemplo, `openssl rand -base64 32`). Use uma senha de administrador com pelo menos 12 caracteres.
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
| `DATABASE_URL` | String pooled do PostgreSQL/Neon para as requisições da aplicação |\n| `DIRECT_URL` | String direta do PostgreSQL/Neon para sincronização do schema e migrações Prisma |
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

## Teste unitário sem banco

```bash
npm run test:unit
```

Quatro testes das regras puras podem ser executados com Node 22 mesmo sem Neon. O dia da senha é contado em **UTC** e pode ser adaptado para o fuso definido pelo estabelecimento. Os testes de cadastro e integração precisam de banco real.

## Testes e documentação
- `spec.md`: requisitos, modelo de dados e critérios de aceite.
- `TESTES.md`: roteiro de testes funcionais e de segurança.
- `CHANGELOG.md`: decisões, correções e limitações registradas.

## Estado real da publicação — 12/11/2026
O repositório GitHub, o projeto Vercel e o domínio de produção estão configurados. O build do commit `6d524f1` foi concluído como READY e as páginas públicas responderam. O schema de cinco tabelas foi aplicado à branch default `production` do Neon. **A inicialização está parcialmente concluída:** o Neon já contém o estabelecimento inicial e o serviço `Atendimento Geral` (ATD, 10 minutos, ativo). A rota pública `/estabelecimentos` foi testada em produção e carregou esses dados do Neon. Ainda não existe usuário na tabela `User`; o titular deve criar sua conta em `/cadastro` para que ela seja promovida com segurança a ADMIN. O seed não roda no build automático. Não declare o fluxo completo como testado antes de validar cadastro, login e fila.
