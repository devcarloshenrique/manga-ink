import type { FastifyInstance } from 'fastify'
import { healthCheck } from './health.controller'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/api/health', {
    schema: {
      tags: ['Health'],
      summary: 'Verifica o estado da aplicação',
      description:
        'Retorna o status atual da API, incluindo timestamp e versão. Útil para monitoramento e health checks.',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            version: { type: 'string' },
            uptime: { type: 'number' },
          },
        },
      },
    },
  }, healthCheck)
}
