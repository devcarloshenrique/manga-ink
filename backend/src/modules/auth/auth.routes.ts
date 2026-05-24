import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { register } from './controllers/register.controller'
import { login } from './controllers/login.controller'
import { registerBodySchema } from './dtos/register.dto'
import { loginSchema } from './dtos/login.dto'

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/auth/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Cadastra um novo usuário',
        body: registerBodySchema,
        response: {
          201: z.object({
            user: z.object({
              id: z.string(),
              username: z.string(),
              email: z.string(),
            }),
            token: z.string(),
          }),
          400: z.object({
            error: z.string(),
            issues: z.any().optional(),
          }),
          409: z.object({
            error: z.string(),
          }),
        },
      },
    },
    register,
  )

  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Login com email e senha',
        body: loginSchema,
        response: {
          200: z.object({
            user: z.object({
              id: z.string(),
              username: z.string(),
              email: z.string(),
            }),
            token: z.string(),
          }),
          401: z.object({
            error: z.string(),
          }),
        },
      },
    },
    login,
  )
}
