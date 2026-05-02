# Manga-Ink

Plataforma web para baixar, converter e enviar mangás para o Kindle por e-mail.

## Funcionalidades

- **Busca e download** de mangás de fontes online
- **Conversão** de imagens para formatos otimizados para Kindle (MOBI, EPUB, PDF)
- **Envio automático** para o Kindle via e-mail (Send to Kindle)
- **Gerenciamento** de coleção pessoal de mangás

## Tecnologias

### Backend
- **Node.js** + **TypeScript**
- **Express** — servidor HTTP
- **Zod** — validação de dados e variáveis de ambiente
- **Swagger** — documentação da API

### Infraestrutura
- **Docker** + **Docker Compose**
- **PostgreSQL** — banco de dados principal

## Estrutura do Projeto

```
manga-ink/
├── backend/                  # API e lógica de negócio
│   ├── src/
│   │   ├── modules/          # Módulos (vertical layer)
│   │   │   └── health/       # Health check da API
│   │   │       ├── health.controller.ts
│   │   │       ├── health.routes.ts
│   │   │       └── health.swagger.ts
│   │   ├── shared/           # Código compartilhado
│   │   │   ├── config/       # Configurações (env, etc.)
│   │   │   ├── docs/         # Swagger
│   │   │   └── server.ts     # Configuração do Express
│   │   └── app.ts            # Ponto de entrada
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
└── README.md
```

## Pré-requisitos

- **Node.js** 22+ (usa `process.loadEnvFile()` nativo)
- **npm** 10+
- **Docker** e **Docker Compose** (para execução em containers)

## Instalação e Execução

### Ambiente Local (Desenvolvimento)

```bash
cd backend
npm install
npm run dev
```

A API estará disponível em `http://localhost:3333` e a documentação Swagger em `http://localhost:3333/api-docs`.

### Com Docker

```bash
cd backend
docker compose up --build
```

Isso sobe:
- **API** em `http://localhost:3333`
- **PostgreSQL** na porta `5432`

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com hot-reload |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Inicia a versão compilada em produção (usa `--env-file=.env`) |

## Variáveis de Ambiente

As variáveis são carregadas do arquivo `.env` e validadas com **Zod**.

| Variável | Padrão | Descrição |
|---|---|---|
| `NODE_ENV` | `dev` | Ambiente (`dev`, `test`, `production`) |
| `PORT` | `3333` | Porta do servidor |
| `JWT_SECRET` | `mangaink-secret` | Chave secreta para tokens JWT |
| `DATABASE_URL` | `postgresql://...` | URL de conexão com PostgreSQL |

## Documentação da API

A documentação interativa (Swagger) está disponível em:

```
http://localhost:3333/api-docs
```

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Verifica o estado da aplicação |

## Licença

ISC