import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { register } from './controllers/register.controller'
import { login } from './controllers/login.controller'
import { me } from './controllers/me.controller'
import { updateMe } from './controllers/update-me.controller'
import { registerBodySchema } from './dtos/register.dto'
import { loginSchema } from './dtos/login.dto'
import { updateMeSchema } from './dtos/update-me.dto'
import { verifyJwt } from '../../shared/middlewares/verify-jwt'

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
              kindleEmail: z.string().nullable(),
              avatarUrl: z.string().nullable(),
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
              kindleEmail: z.string().nullable(),
              avatarUrl: z.string().nullable(),
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

  app.get(
    '/auth/me',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Retorna dados do usuário autenticado',
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            id: z.string(),
            username: z.string(),
            email: z.string(),
            kindleEmail: z.string().nullable(),
            avatarUrl: z.string().nullable(),
          }),
          401: z.object({
            error: z.string(),
          }),
        },
      },
      onRequest: [verifyJwt],
    },
    me,
  )

  app.patch(
    '/users/me',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Atualiza dados do usuário autenticado',
        security: [{ bearerAuth: [] }],
        body: updateMeSchema,
        response: {
          200: z.object({
            id: z.string(),
            username: z.string(),
            email: z.string(),
            kindleEmail: z.string().nullable(),
            avatarUrl: z.string().nullable(),
          }),
          400: z.object({
            error: z.string(),
            issues: z.any().optional(),
          }),
          401: z.object({
            error: z.string(),
          }),
          409: z.object({
            error: z.string(),
          }),
        },
      },
      onRequest: [verifyJwt],
    },
    updateMe,
  )
}
