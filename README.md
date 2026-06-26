# OficinaPRO - Back-end

Back-end do sistema de gestão de oficina mecânica.

## Tecnologias

- [Node.js](https://nodejs.org/) + TypeScript
- [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/) para autenticação
- [Zod](https://zod.dev/) para validação
- [Jest](https://jestjs.io/) para testes unitários

## Estrutura de pastas
back/
├── prisma/           # schema e migrações do banco de dados
├── src/
│   ├── common/       # utilitários, middlewares e validações
│   ├── config/       # configurações de ambiente
│   ├── modules/      # lógica de negócio por entidade
│   ├── routes/       # definições de rotas da API
│   └── server.ts     # ponto de entrada da aplicação

## Funcionalidades

- Autenticação (login e cadastro) com JWT
- Multi-tenancy (gestão isolada por loja)
- Gestão de Estoque (produtos e serviços)
- Gestão Financeira (comandas e pagamentos)
- Qualidade (testes unitários automatizados)

## Como rodar o projeto

1. Clone o repositório.
2. Instale as dependências:
   npm install
3. Configure as variáveis de ambiente no arquivo .env (banco de dados PostgreSQL local).
4. Inicie o servidor:
   npm run dev

# Execução de Testes
Para rodar a suíte de testes unitários:
   npm run test