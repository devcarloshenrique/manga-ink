import { describe, it, expect, vi } from 'vitest'
import { LoginUserUseCase } from '../use-cases/login.use-case'
import { InvalidCredentialsError } from '../errors/auth.errors'
import type { UserRepository } from '../../user/repositories/user.repository'
import type { PasswordHasher } from '../services/password-hasher'
import type { TokenService } from '../services/token.service'

// makeSut = factory que cria o System Under Test (SUT) com mocks manuais.
// Segue o padrão do projeto: sem biblioteca de mocking, cada interface é
// implementada com vi.fn() que retorna valores controlados em cada teste.
const makeSut = () => {
  const userRepository: UserRepository = {
    findByEmail: vi.fn(),
    findByEmailOrUsername: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  }

  const hasher: PasswordHasher = {
    hash: vi.fn(),
    compare: vi.fn(),
  }

  const tokenService: TokenService = {
    sign: vi.fn(),
  }

  // O use case recebe interfaces, não implementações concretas.
  // Ele não sabe que está rodando com mocks — só conhece o contrato.
  const sut = new LoginUserUseCase(userRepository, hasher, tokenService)

  return { sut, userRepository, hasher, tokenService }
}

describe('LoginUserUseCase', () => {
  // Cenário: usuário não existe no banco.
  // findByEmail retorna null → use case deve lançar InvalidCredentialsError.
  // A mensagem é genérica ("Credenciais inválidas") para não revelar se o email existe.
  it('throws when user does not exist', async () => {
    const { sut, userRepository } = makeSut()

    // Mock: simula que o banco não encontrou nenhum usuário com esse email
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null)

    await expect(
      sut.execute({
        email: 'joao@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  // Cenário: usuário existe, mas a senha está errada.
  // findByEmail retorna o usuário, mas hasher.compare retorna false.
  // Mesmo erro genérico — não revela se a senha está errada ou se o user existe.
  it('throws when password is invalid', async () => {
    const { sut, userRepository, hasher } = makeSut()

    // Mock: banco encontrou o usuário
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hashed',
    })
    // Mock: senha fornecida NÃO corresponde ao hash salvo
    vi.mocked(hasher.compare).mockResolvedValue(false)

    await expect(
      sut.execute({
        email: 'joao@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  // Cenário feliz: usuário existe E senha está correta.
  // O use case deve: comparar senhas, gerar token JWT, e retornar PublicUser.
  it('returns user and token on success', async () => {
    const { sut, userRepository, hasher, tokenService } = makeSut()

    // Mock: banco encontrou o usuário
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hashed',
    })
    // Mock: senha fornecida corresponde ao hash salvo
    vi.mocked(hasher.compare).mockResolvedValue(true)
    // Mock: token service retorna um token fictício
    vi.mocked(tokenService.sign).mockResolvedValue('token-123')

    const result = await sut.execute({
      email: 'joao@email.com',
      password: '123456',
    })

    // Verifica que hasher.compare foi chamado com a senha plaintext e o hash do banco
    expect(hasher.compare).toHaveBeenCalledWith('123456', 'hashed')
    // Verifica que o token foi gerado com o payload correto (sub = id do usuário)
    // e expiração de 7 dias
    expect(tokenService.sign).toHaveBeenCalledWith(
      { sub: 'user-1' },
      { expiresIn: '7d' },
    )
    // Verifica que o retorno é o PublicUser (sem passwordHash) + token
    expect(result).toEqual({
      user: {
        id: 'user-1',
        username: 'joao',
        email: 'joao@email.com',
      },
      token: 'token-123',
    })
  })
})
