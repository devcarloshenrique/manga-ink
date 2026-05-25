import { describe, it, expect, vi } from 'vitest'
import { RegisterUserUseCase } from '../use-cases/register.use-case'
import { UserAlreadyExistsError } from '../errors/auth.errors'
import type { UserRepository } from '../../user/repositories/user.repository'
import type { PasswordHasher } from '../services/password-hasher'
import type { TokenService } from '../services/token.service'

// Factory com mocks manuais — mesmo padrão do login.use-case.test.ts.
// Cada teste controla o retorno dos mocks para simular cenários diferentes.
const makeSut = () => {
  const userRepository: UserRepository = {
    findByEmail: vi.fn(),
    findByUsername: vi.fn(),
    findByEmailOrUsername: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  }

  const hasher: PasswordHasher = {
    hash: vi.fn(),
    compare: vi.fn(),
  }

  const tokenService: TokenService = {
    sign: vi.fn(),
  }

  const sut = new RegisterUserUseCase(userRepository, hasher, tokenService)

  return { sut, userRepository, hasher, tokenService }
}

describe('RegisterUserUseCase', () => {
  // Cenário: já existe um usuário com o mesmo email ou username.
  // findByEmailOrUsername retorna um usuário → lança UserAlreadyExistsError.
  it('throws when user already exists', async () => {
    const { sut, userRepository } = makeSut()

    // Mock: banco encontrou um usuário com esse email ou username
    vi.mocked(userRepository.findByEmailOrUsername).mockResolvedValue({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hash',
      kindleEmail: null,
      avatarUrl: null,
    })

    await expect(
      sut.execute({
        username: 'joao',
        email: 'joao@email.com',
        password: '123456',
        confirmPassword: '123456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })

  // Cenário feliz: email e username disponíveis.
  // Fluxo completo: verifica unicidade → hasheia senha → cria usuário → gera token.
  it('creates user and returns token', async () => {
    const { sut, userRepository, hasher, tokenService } = makeSut()

    // Mock: nenhum usuário encontrado (email e username disponíveis)
    vi.mocked(userRepository.findByEmailOrUsername).mockResolvedValue(null)
    // Mock: bcrypt transformou a senha em hash
    vi.mocked(hasher.hash).mockResolvedValue('hashed')
    // Mock: banco criou e retornou o novo usuário
    vi.mocked(userRepository.create).mockResolvedValue({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hashed',
      kindleEmail: null,
      avatarUrl: null,
    })
    // Mock: token service gerou o JWT
    vi.mocked(tokenService.sign).mockResolvedValue('token-123')

    const result = await sut.execute({
      username: 'joao',
      email: 'joao@email.com',
      password: '123456',
      confirmPassword: '123456',
    })

    // Verifica que a unicidade foi checada com email E username
    expect(userRepository.findByEmailOrUsername).toHaveBeenCalledWith(
      'joao@email.com',
      'joao',
    )
    // Verifica que a senha foi hasheada (nunca salva em plaintext)
    expect(hasher.hash).toHaveBeenCalledWith('123456')
    // Verifica que o usuário foi criado com o hash (não a senha original)
    expect(userRepository.create).toHaveBeenCalledWith({
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hashed',
    })
    // Verifica que o token foi gerado com o ID do novo usuário
    expect(tokenService.sign).toHaveBeenCalledWith(
      { sub: 'user-1' },
      { expiresIn: '7d' },
    )
    // Verifica retorno: PublicUser (sem passwordHash) + token
    expect(result).toEqual({
      user: {
        id: 'user-1',
        username: 'joao',
        email: 'joao@email.com',
        kindleEmail: null,
        avatarUrl: null,
      },
      token: 'token-123',
    })
  })
})
