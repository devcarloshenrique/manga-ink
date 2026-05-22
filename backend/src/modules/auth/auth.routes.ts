import type { FastifyInstance } from 'fastify'
import { register } from './controllers/register.controller'
import { login } from './controllers/login.controller'
import { validateBody } from '../../shared/middlewares/validate-body'
import { registerSchema } from './dtos/register.dto'
import { loginSchema } from './dtos/login.dto'
import type { RegisterDTO } from './dtos/register.dto'
import type { LoginDTO } from './dtos/login.dto'

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterDTO }>(
    '/auth/register',
    {
      preHandler: validateBody(registerSchema),
      schema: {
        tags: ['Auth'],
        summary: 'Cadastra um novo usuário',
        body: {
          type: 'object',
          required: ['username', 'email', 'password', 'confirmPassword'],
          properties: {
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            confirmPassword: { type: 'string', minLength: 6 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                },
              },
              token: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          409: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    register,
  )

  app.post<{ Body: LoginDTO }>(
    '/auth/login',
    {
      preHandler: validateBody(loginSchema),
      schema: {
        tags: ['Auth'],
        summary: 'Login com email e senha',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                },
              },
              token: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    login,
  )
}
