import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { createServer } from '../../../shared/server'

// Testes E2E (end-to-end) via app.inject() — o Fastify simula requisições HTTP
// sem abrir uma porta real. A válida de rota + error handler + cookie + JWT
// são todos carregados, mas NENHUM banco de dados é necessário porque o Zod
// valida o body ANTES de chegar ao controller/use case.

describe('Auth Validation (E2E)', () => {
  let app: FastifyInstance

  // createServer() instancia o Fastify com TODOS os plugins (cookie, jwt, cors, swagger)
  // e rotas — é a mesma factory usada no app.ts de produção.
  // app.ready() aguarda todos os plugins registrarem antes de começar os testes.
  beforeAll(async () => {
    app = await createServer()
    await app.ready()
  })

  // Fecha o servidor após todos os testes para liberar recursos.
  afterAll(async () => {
    await app.close()
  })

  // == POST /auth/login ==
  // Validações testadas: body vazio, email inválido, password ausente.
  // Todas devem retornar 400 porque o schema Zod na rota rejeita antes do controller.
  describe('POST /auth/login', () => {
    it('returns 400 when body is empty', async () => {
      // app.inject() simula um POST HTTP sem abrir porta — resposta síncrona
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        body: {},
      })

      expect(response.statusCode).toBe(400)
      // O error handler global do server.ts formata como { error, issues }
      const payload = JSON.parse(response.payload)
      expect(payload.error).toBeDefined()
    })

    it('returns 400 when email is invalid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        body: {
          email: 'not-an-email',
          password: '123456',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('returns 400 when password is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        body: {
          email: 'joao@email.com',
          // password ausente → z.string().min(1) rejeita
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  // == POST /auth/register ==
  // Validações testadas: body vazio, senhas não coincidem, múltiplos erros simultâneos.
  // Este último testa que o Zod acumula TODOS os erros (não para no primeiro).
  describe('POST /auth/register', () => {
    it('returns 400 when body is empty', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        body: {},
      })

      expect(response.statusCode).toBe(400)
      const payload = JSON.parse(response.payload)
      expect(payload.error).toBeDefined()
    })

    // Testa a validação cruzada do .refine() — password !== confirmPassword.
    // Este erro SÓ existe no registerSchema (com refine), não no loginSchema.
    it('returns 400 when passwords do not match', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        body: {
          username: 'joao',
          email: 'joao@email.com',
          password: '123456',
          confirmPassword: '654321',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    // Múltiplos erros simultâneos: username curto + email inválido + senhas curtas.
    // O processamento continua porque quer testar que o 400 aparece mesmo
    // com vários problemas de uma vez (o Zod acumula todos).
    it('returns 400 when email is invalid and fields are too short', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        body: {
          username: 'ab',
          email: 'not-valid',
          password: '123',
          confirmPassword: '123',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  // == GET /auth/me ==
  // Testa o middleware verifyJwt: sem token → 401.
  // Este teste é E2E de verdade: passa pelo middleware, que tenta jwtVerify(),
  // falha (não há cookie/header), e retorna "Não autorizado".
  describe('GET /auth/me', () => {
    it('returns 401 when no token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/auth/me',
        // Sem cookie "token" nem header "Authorization: Bearer"
      })

      expect(response.statusCode).toBe(401)
      const payload = JSON.parse(response.payload)
      // Mensagem definida no middleware verifyJwt.ts
      expect(payload.error).toBe('Não autorizado')
    })
  })
})
