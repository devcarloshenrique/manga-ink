import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ZodTypeAny } from 'zod'

export function validateBody(schema: ZodTypeAny) {
  return async function validate(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const result = schema.safeParse(request.body)

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Dados invalidos'
      return reply.code(400).send({ error: message })
    }

    request.body = result.data
  }
}
