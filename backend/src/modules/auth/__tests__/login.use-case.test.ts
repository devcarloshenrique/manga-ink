import { describe, it, expect, vi } from 'vitest'
import { LoginUserUseCase } from '../use-cases/login.use-case'
import { InvalidCredentialsError } from '../errors/auth.errors'
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

  const sut = new LoginUserUseCase(userRepository, hasher, tokenService)

  return { sut, userRepository, hasher, tokenService }
}

describe('LoginUserUseCase', () => {
  it('throws when user does not exist', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null)

    await expect(
      sut.execute({
        email: 'joao@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('throws when password is invalid', async () => {
    const { sut, userRepository, hasher } = makeSut()

    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hashed',
    })
    vi.mocked(hasher.compare).mockResolvedValue(false)

    await expect(
      sut.execute({
        email: 'joao@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('returns user and token on success', async () => {
    const { sut, userRepository, hasher, tokenService } = makeSut()

    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hashed',
    })
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(tokenService.sign).mockResolvedValue('token-123')

    const result = await sut.execute({
      email: 'joao@email.com',
      password: '123456',
    })

    expect(hasher.compare).toHaveBeenCalledWith('123456', 'hashed')
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
