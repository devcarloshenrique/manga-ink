import { describe, it, expect } from 'vitest'
import { registerSchema } from '../dtos/register.dto'

// Testes unitários no schema Zod do registro — inclui a validação com .refine().
// registerSchema usa .refine() para comparar password com confirmPassword,
// o que adiciona uma validação cruzada entre dois campos (impossible com validações simples).

describe('registerSchema', () => {
  // Payload base válido — reutilizado nos testes com spread operator.
  const validPayload = {
    username: 'joao',
    email: 'joao@email.com',
    password: '123456',
    confirmPassword: '123456',
  }

  // Cenário base: todos os campos corretos.
  it('succeeds with valid payload', () => {
    const result = registerSchema.safeParse(validPayload)

    expect(result.success).toBe(true)
  })

  // Username com menos de 3 caracteres → z.string().min(3) rejeita.
  // path: ['username'] indica exatamente qual campo falhou.
  it('fails when username has less than 3 characters', () => {
    const result = registerSchema.safeParse({
      ...validPayload,
      username: 'ab',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['username'])
    }
  })

  // Email inválido → z.string().email() rejeita com a mensagem customizada do DTO.
  // Usa spread do validPayload para manter os outros campos corretos,
  // isolando o teste ao campo email.
  it('fails when email format is invalid', () => {
    const result = registerSchema.safeParse({
      ...validPayload,
      email: 'not-an-email',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('E-mail inválido')
    }
  })

  // Password com menos de 6 caracteres → z.string().min(6) rejeita.
  it('fails when password has less than 6 characters', () => {
    const result = registerSchema.safeParse({
      ...validPayload,
      password: '12345',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['password'])
    }
  })

  // Validação cruzada: confirmPassword !== password.
  // Esta validação SÓ é possível com .refine() — ela acessa 'data' inteiro,
  // não só o campo individual. O path ['confirmPassword'] aponta o campo a destacar no frontend.
  it('fails when confirmPassword does not match password', () => {
    const result = registerSchema.safeParse({
      ...validPayload,
      confirmPassword: '654321',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword'])
      expect(result.error.issues[0].message).toBe('As senhas não coincidem')
    }
  })

  // Body completamente vazio → TODOS os campos obrigatórios geram erro.
  // Mapeia os paths dos issues para garantir que todos os 4 campos foram rejeitados.
  it('fails when required fields are missing', () => {
    const result = registerSchema.safeParse({})

    expect(result.success).toBe(false)
    if (!result.success) {
      // Extrai o primeiro elemento de cada path (ex: ['username'] → 'username')
      const paths = result.error.issues.map((i) => i.path[0])
      // Verifica que TODOS os campos obrigatórios estão na lista de erros
      expect(paths).toContain('username')
      expect(paths).toContain('email')
      expect(paths).toContain('password')
      expect(paths).toContain('confirmPassword')
    }
  })
})
