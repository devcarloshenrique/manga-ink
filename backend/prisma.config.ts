import { defineConfig, env } from 'prisma/config'

// Carrega o .env usando a API nativa do Node.js 21+
process.loadEnvFile()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasources: {
    db: {
      url: env('DATABASE_URL'),
    },
  },
})
