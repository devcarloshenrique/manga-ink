import { describe, it, expect, vi } from 'vitest'
import { RegisterUserUseCase } from '../use-cases/register.use-case'
import { UserAlreadyExistsError } from '../errors/auth.errors'
import type { UserRepository } from '../../user/repositories/user.repository'
import type { PasswordHasher } from '../services/password-hasher'
import type { TokenService } from '../services/token.service'

const makeSut = () => {
  const userRepository: UserRepository = {
    findByEmail: vi.fn(),
    findByEmailOrUsername: vi.fn(),
    create: vi.fn(),
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
  it('throws when user already exists', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findByEmailOrUsername).mockResolvedValue({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hash',
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

  it('creates user and returns token', async () => {
    const { sut, userRepository, hasher, tokenService } = makeSut()

    vi.mocked(userRepository.findByEmailOrUsername).mockResolvedValue(null)
    vi.mocked(hasher.hash).mockResolvedValue('hashed')
    vi.mocked(userRepository.create).mockResolvedValue({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hashed',
    })
    vi.mocked(tokenService.sign).mockResolvedValue('token-123')

    const result = await sut.execute({
      username: 'joao',
      email: 'joao@email.com',
      password: '123456',
      confirmPassword: '123456',
    })

    expect(userRepository.findByEmailOrUsername).toHaveBeenCalledWith(
      'joao@email.com',
      'joao',
    )
    expect(hasher.hash).toHaveBeenCalledWith('123456')
    expect(userRepository.create).toHaveBeenCalledWith({
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hashed',
    })
    expect(tokenService.sign).toHaveBeenCalledWith(
      { sub: 'user-1' },
      { expiresIn: '7d' },
    )
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
