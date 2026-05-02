import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './docs/swagger'
import { healthRoutes } from '../modules/health/health.routes'

export function createServer() {
  const app = express()

  // Middleware para parsing de JSON
  app.use(express.json())

  // Documentação Swagger
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'API Manga-Ink - Documentação',
      customCss: '.swagger-ui .topbar { display: none }',
    }),
  )

  // Rotas da aplicação
  app.use(healthRoutes)

  return app
}