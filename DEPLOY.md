# Publicação — GitHub + Neon + Vercel

Este guia segue a Fase 6 da apostila. A publicação real exige que o estudante entre nas próprias contas; nenhuma credencial foi embutida no código.

## 1. Enviar o projeto com o histórico de commits

Extraia o ZIP mantendo a pasta oculta `.git` que está dentro dele. Abra o terminal na pasta `filazero` e execute:

```bash
git status
git log --oneline
git remote add origin https://github.com/SEU-USUARIO/filazero.git
git push -u origin main
```

Antes, crie no GitHub um repositório vazio chamado `filazero`. Não marque para criar README, licença ou `.gitignore`, pois esses arquivos já existem no projeto. Se o remoto já estiver configurado, confira com `git remote -v` em vez de adicionar novamente.

## 2. Criar o banco no Neon

1. Entre em https://neon.tech e crie um projeto PostgreSQL.
2. Copie a connection string (preferencialmente pooled) com SSL habilitado.
3. Guarde-a em local seguro. Não a cole em mensagens, commits ou arquivos versionados.

## 3. Criar as variáveis de ambiente na Vercel

1. Entre em https://vercel.com e escolha **Add New → Project**.
2. Importe o repositório `filazero`.
3. Em **Environment Variables**, cadastre:
   - `DATABASE_URL`: connection string pooled do Neon (host com `-pooler`, SSL habilitado e `pgbouncer=true`).
   - `DIRECT_URL`: connection string direta do Neon (host sem `-pooler`, SSL habilitado), usada pelo Prisma para sincronização do schema.
   - `NEXTAUTH_SECRET`: segredo forte gerado, por exemplo, com `openssl rand -base64 32`.
   - `NEXTAUTH_URL`: URL final do projeto, por exemplo `https://projeto-filazero.vercel.app`.
4. Faça o deploy. **Não cadastre `SEED_ADMIN_PASSWORD` na Vercel:** as variáveis de seed devem ficar somente no `.env` local, durante a execução inicial.

## 4. Criar tabelas e administrador inicial

No terminal local, copie `.env.example` para `.env` e preencha `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (mínimo de 12 caracteres) e os dados do estabelecimento. Mantenha esse arquivo apenas na sua máquina; ele está excluído do Git:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

O seed cria um estabelecimento de demonstração, o serviço Atendimento Geral e a conta ADMIN. Use uma senha inicial forte (mínimo de 12 caracteres). Depois de executar o seed, remova `SEED_ADMIN_PASSWORD` do `.env` local. Se precisar atualizar a conta ADMIN, execute o seed novamente com uma nova senha temporária em ambiente local seguro.

## 5. Testar como avaliador

1. Abra o link publicado em janela anônima.
2. Crie uma conta CLIENT.
3. Entre, abra Estabelecimentos, escolha Atendimento Geral e gere uma senha.
4. Em outra janela, entre com a conta ADMIN e abra Gestão → Atendimento (ou crie uma conta STAFF em Gestão → Funcionários).
5. No painel de atendimento, chame a senha, inicie e finalize.
6. Volte à conta CLIENT e confirme a atualização automática do status e o histórico.
7. Execute os demais casos de `TESTES.md` e registre os resultados reais.

## 6. Estado atual desta publicação

O schema já foi aplicado à branch default `production` do Neon e o build Vercel do commit `6d524f1` concluiu. Um seed executado em um build conseguiu criar o estabelecimento inicial, comprovando que `DATABASE_URL` estava funcional naquele momento, mas parou por ausência de `SEED_ADMIN_PASSWORD` antes de criar o administrador e o serviço. A tabela `User` está vazia. Os valores secretos atuais são mascarados pela integração; confirme `DATABASE_URL` e `DIRECT_URL` no painel Vercel e execute o seed em ambiente local seguro antes de considerar o sistema operacional.

## 7. Entrega ao professor

- URL pública da aplicação Vercel.
- URL do repositório GitHub com commits visíveis.
- `spec.md` atualizado.
- `CHANGELOG.md` com decisões e correções revisadas.
- `TESTES.md` preenchido com resultados efetivamente executados.
