import { describe, it, expect } from 'vitest'
import { loginSchema } from '../dtos/login.dto'

// Testes unitários DIRETOS no schema Zod — sem HTTP, sem mocks, sem banco.
// Validam que as regras de validação do DTO funcionam isoladamente.
// Estes testes NÃO passam pelo controller nem pelo use case: testam só o Zod.

describe('loginSchema', () => {
  // safeParse retorna { success: true } quando email e password são válidos.
  // Este é o cenário base — tudo correto, sem erros de validação.
  it('succeeds with valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'joao@email.com',
      password: '123456',
    })

    expect(result.success).toBe(true)
  })

  // Campo email ausente → Zod gera um issue com path: ['email'].
  // O Zod não checa formato se o campo não existe: reporta "Required" primeiro.
  it('fails when email is missing', () => {
    const result = loginSchema.safeParse({
      password: '123456',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      // path indica em QUAL campo ocorreu o erro (útil para mensagens no frontend)
      expect(result.error.issues[0].path).toEqual(['email'])
    }
  })

  // Email presente mas em formato inválido (sem @, sem domínio).
  // A regra z.string().email() do Zod rejeita e retorna mensagem customizada.
  it('fails when email format is invalid', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: '123456',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      // Mensagem customizada definida no DTO: "E-mail inválido"
      expect(result.error.issues[0].message).toBe('E-mail inválido')
    }
  })

  // Campo password ausente → Zod reporta erro no path ['password'].
  it('fails when password is missing', () => {
    const result = loginSchema.safeParse({
      email: 'joao@email.com',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['password'])
    }
  })

  // Password presente mas string vazia ("") — z.string().min(1) rejeita.
  // Diferente de "missing", aqui o campo existe mas não tem conteúdo.
  it('fails when password is empty string', () => {
    const result = loginSchema.safeParse({
      email: 'joao@email.com',
      password: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      // Mensagem customizada: "Senha obrigatória"
      expect(result.error.issues[0].message).toBe('Senha obrigatória')
    }
  })
})
