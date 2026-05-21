import type { FastifyReply, FastifyRequest } from 'fastify'
import bcrypt from 'bcryptjs'
import { prisma } from '../../shared/database/prisma'

export async function register(
  request: FastifyRequest<{ Body: Record<string, string> }>,
  reply: FastifyReply,
) {
  const { username, email, password, confirmPassword } = request.body

  if (password !== confirmPassword) {
    return reply.code(400).send({ error: 'As senhas não coincidem' })
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })

  if (existingUser) {
    return reply.code(409).send({ error: 'Usuário ou email já cadastrado' })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
    },
  })

  const token = await reply.jwtSign({ sub: user.id }, { expiresIn: '7d' })

  return reply.code(201).send({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    token,
  })
}

export async function login(
  request: FastifyRequest<{ Body: Record<string, string> }>,
  reply: FastifyReply,
) {
  const { email, password } = request.body

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return reply.code(401).send({ error: 'Credenciais inválidas' })
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

  if (!isPasswordValid) {
    return reply.code(401).send({ error: 'Credenciais inválidas' })
  }

  const token = await reply.jwtSign({ sub: user.id }, { expiresIn: '7d' })

  return reply.send({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    token,
  })
}

