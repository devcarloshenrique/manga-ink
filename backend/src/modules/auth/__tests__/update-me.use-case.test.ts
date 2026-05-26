import { describe, it, expect, vi } from 'vitest'
import { UpdateMeUseCase } from '../use-cases/update-me.use-case'
import {
  InvalidCredentialsError,
  EmailAlreadyInUseError,
  UsernameAlreadyInUseError,
} from '../errors/auth.errors'
import type { UserRepository } from '../../user/repositories/user.repository'
import type { PasswordHasher } from '../services/password-hasher'

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

  const sut = new UpdateMeUseCase(userRepository, hasher)

  return { sut, userRepository, hasher }
}

const existingUser = {
  id: 'user-1',
  username: 'joao',
  email: 'joao@email.com',
  passwordHash: 'current-hash',
  kindleEmail: null,
  avatarUrl: null,
}

describe('UpdateMeUseCase', () => {
  it('throws when user is not found', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(null)

    await expect(
      sut.execute('user-1', { username: 'novo-nome' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('throws when email is already in use by another account', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      id: 'user-2',
      username: 'outro',
      email: 'novo@email.com',
      passwordHash: 'hash',
      kindleEmail: null,
      avatarUrl: null,
    })

    await expect(
      sut.execute('user-1', { email: 'novo@email.com' }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseError)
  })

  it('throws when username is already in use by another account', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(userRepository.findByUsername).mockResolvedValue({
      id: 'user-2',
      username: 'outro-nome',
      email: 'outro@email.com',
      passwordHash: 'hash',
      kindleEmail: null,
      avatarUrl: null,
    })

    await expect(
      sut.execute('user-1', { username: 'outro-nome' }),
    ).rejects.toBeInstanceOf(UsernameAlreadyInUseError)
  })

  it('throws when current password is wrong on password change', async () => {
    const { sut, userRepository, hasher } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(hasher.compare).mockResolvedValue(false)

    await expect(
      sut.execute('user-1', {
        currentPassword: 'wrong-password',
        password: 'new-password',
        confirmPassword: 'new-password',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('updates username successfully', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(userRepository.findByUsername).mockResolvedValue(null)
    vi.mocked(userRepository.update).mockResolvedValue({
      ...existingUser,
      username: 'joao-novo',
    })

    const result = await sut.execute('user-1', { username: 'joao-novo' })

    expect(userRepository.findByUsername).toHaveBeenCalledWith('joao-novo')
    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      username: 'joao-novo',
    })
    expect(result.username).toBe('joao-novo')
    expect(result).not.toHaveProperty('passwordHash')
  })

  it('updates email successfully', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(userRepository.update).mockResolvedValue({
      ...existingUser,
      email: 'novo@email.com',
    })

    const result = await sut.execute('user-1', { email: 'novo@email.com' })

    expect(userRepository.findByEmail).toHaveBeenCalledWith('novo@email.com')
    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      email: 'novo@email.com',
    })
    expect(result.email).toBe('novo@email.com')
  })

  it('updates kindleEmail successfully', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(userRepository.update).mockResolvedValue({
      ...existingUser,
      kindleEmail: 'joao@kindle.com',
    })

    const result = await sut.execute('user-1', {
      kindleEmail: 'joao@kindle.com',
    })

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      kindleEmail: 'joao@kindle.com',
    })
    expect(result.kindleEmail).toBe('joao@kindle.com')
  })

  it('sets kindleEmail to null when empty string is provided', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue({
      ...existingUser,
      kindleEmail: 'old@kindle.com',
    })
    vi.mocked(userRepository.update).mockResolvedValue({
      ...existingUser,
      kindleEmail: null,
    })

    const result = await sut.execute('user-1', { kindleEmail: '' })

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      kindleEmail: null,
    })
    expect(result.kindleEmail).toBeNull()
  })

  it('updates avatarUrl successfully', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(userRepository.update).mockResolvedValue({
      ...existingUser,
      avatarUrl: 'https://example.com/avatar.png',
    })

    const result = await sut.execute('user-1', {
      avatarUrl: 'https://example.com/avatar.png',
    })

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      avatarUrl: 'https://example.com/avatar.png',
    })
    expect(result.avatarUrl).toBe('https://example.com/avatar.png')
  })

  it('updates password successfully when current password is correct', async () => {
    const { sut, userRepository, hasher } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(hasher.compare).mockResolvedValue(true)
    vi.mocked(hasher.hash).mockResolvedValue('new-hash')
    vi.mocked(userRepository.update).mockResolvedValue({
      ...existingUser,
      passwordHash: 'new-hash',
    })

    const result = await sut.execute('user-1', {
      currentPassword: 'current-password',
      password: 'new-password',
    })

    expect(hasher.compare).toHaveBeenCalledWith(
      'current-password',
      'current-hash',
    )
    expect(hasher.hash).toHaveBeenCalledWith('new-password')
    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      passwordHash: 'new-hash',
    })
    expect(result).not.toHaveProperty('passwordHash')
  })

  it('does not check email uniqueness when email is unchanged', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(userRepository.update).mockResolvedValue(existingUser)

    await sut.execute('user-1', { email: 'joao@email.com' })

    expect(userRepository.findByEmail).not.toHaveBeenCalled()
  })

  it('does not check username uniqueness when username is unchanged', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(userRepository.update).mockResolvedValue(existingUser)

    await sut.execute('user-1', { username: 'joao' })

    expect(userRepository.findByUsername).not.toHaveBeenCalled()
  })

  it('returns PublicUser (without passwordHash)', async () => {
    const { sut, userRepository } = makeSut()

    vi.mocked(userRepository.findById).mockResolvedValue(existingUser)
    vi.mocked(userRepository.update).mockResolvedValue(existingUser)

    const result = await sut.execute('user-1', { username: 'joao' })

    expect(result).toEqual({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      kindleEmail: null,
      avatarUrl: null,
    })
    expect(result).not.toHaveProperty('passwordHash')
  })
})
