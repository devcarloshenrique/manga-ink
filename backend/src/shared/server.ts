import Fastify, { FastifyError } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './config/env'
import { healthRoutes } from '../modules/health/health.routes'
import { authRoutes } from '../modules/auth/auth.routes'

export async function createServer() {
  const app = Fastify().withTypeProvider<ZodTypeProvider>()

  await app.register(cors, {
    origin: true,
    credentials: true,
  })

  await app.register(cookie, {
    secret: env.JWT_SECRET,
  })

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'token',
      signed: true,
    },
  })

  await app.register(swagger, {
    openapi: {
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
          description: 'Endpoints para verificação do estado da aplicação',
        },
        {
          name: 'Auth',
          description: 'Endpoints de autenticação',
        },
      ],
    },
    transform: jsonSchemaTransform,
  })

  await app.register(swaggerUi, {
    routePrefix: '/api-docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({ error: 'Not Found' })
  })

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (error.validation) {
      return reply.code(400).send({
        error: error.message,
        issues: error.validation,
      })
    }

    app.log.error(error)
    reply.code(500).send({ error: 'Internal Server Error' })
  })

  await app.register(healthRoutes)
  await app.register(authRoutes)

  return app
}
