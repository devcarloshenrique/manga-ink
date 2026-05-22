import type { FastifyReply, FastifyRequest } from 'fastify'
import type { RegisterDTO } from '../dtos/register.dto'
import { RegisterUserUseCase } from '../use-cases/register.use-case'
import { UserAlreadyExistsError } from '../errors/auth.errors'
import { BcryptPasswordHasher } from '../services/password-hasher'
import { JwtTokenService } from '../services/token.service'
import { PrismaUserRepository } from '../../user/repositories/prisma-user.repository'

export async function register(
  request: FastifyRequest<{ Body: RegisterDTO }>,
  reply: FastifyReply,
) {
  const userRepository = new PrismaUserRepository()
  const hasher = new BcryptPasswordHasher()
  const tokenService = new JwtTokenService((payload, options) =>
    reply.jwtSign(payload, options),
  )

  const useCase = new RegisterUserUseCase(userRepository, hasher, tokenService)

  try {
    const result = await useCase.execute(request.body)
    return reply.code(201).send(result)
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.code(409).send({ error: error.message })
    }

    throw error
  }
}
