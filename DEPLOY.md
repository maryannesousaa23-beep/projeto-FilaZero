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
   - `DATABASE_URL`: connection string do Neon.
   - `NEXTAUTH_SECRET`: segredo forte gerado, por exemplo, com `openssl rand -base64 32`.
   - `NEXTAUTH_URL`: URL final do projeto, por exemplo `https://filazero-seu-projeto.vercel.app`.
   - `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` e variáveis do estabelecimento inicial apenas durante a criação inicial do administrador.
4. Faça o primeiro deploy.

## 4. Criar tabelas e administrador inicial

No terminal local, com `.env` configurado para apontar ao banco Neon:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

O seed cria um estabelecimento de demonstração, o serviço Atendimento Geral e a conta ADMIN. Use senha inicial forte (mínimo de 12 caracteres). Depois de executar o seed, remova `SEED_ADMIN_PASSWORD` das variáveis de produção. Se necessário, execute `npm run db:seed` novamente localmente para recriar/atualizar o administrador usando a senha configurada com segurança.

## 5. Testar como avaliador

1. Abra o link publicado em janela anônima.
2. Crie uma conta CLIENT.
3. Entre, abra Estabelecimentos, escolha Atendimento Geral e gere uma senha.
4. Em outra janela, entre com a conta ADMIN e abra Gestão → Atendimento (ou crie uma conta STAFF em Gestão → Funcionários).
5. No painel de atendimento, chame a senha, inicie e finalize.
6. Volte à conta CLIENT e confirme a atualização automática do status e o histórico.
7. Execute os demais casos de `TESTES.md` e registre os resultados reais.

## 6. Entrega ao professor

- URL pública da aplicação Vercel.
- URL do repositório GitHub com commits visíveis.
- `spec.md` atualizado.
- `CHANGELOG.md` com decisões e correções revisadas.
- `TESTES.md` preenchido com resultados efetivamente executados.
