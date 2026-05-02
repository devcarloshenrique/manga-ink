import swaggerJsdoc from 'swagger-jsdoc'
import { env } from '../config/env'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Manga-Ink',
      version: '1.0.0',
      description:
        'API do sistema Manga-Ink para gerenciamento de mangás, autores e coleções.',
      contact: {
        name: 'Equipe Manga-Ink',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Servidor local de desenvolvimento',
      },
    ],
    tags: [
      {
        name: 'Health',
        description:
          'Endpoints para verificação do estado da aplicação',
      },
    ],
  },
  apis: ['./src/modules/**/*.swagger.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)