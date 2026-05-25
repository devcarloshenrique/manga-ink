import { describe, it, expect, vi } from 'vitest'
import { GetMeUseCase } from '../use-cases/get-me.use-case'
import { InvalidCredentialsError } from '../errors/auth.errors'
import type { UserRepository } from '../../user/repositories/user.repository'

// GetMeUseCase é mais simples que register/login: só recebe UserRepository.
// Não precisa de PasswordHasher (não tem senha) nem TokenService (não gera token).
// A verificação do JWT já foi feita pelo middleware verifyJwt antes de chegar aqui.
const makeSut = () => {
  const userRepository: UserRepository = {
    findByEmail: vi.fn(),
    findByUsername: vi.fn(),
    findByEmailOrUsername: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  }

  const sut = new GetMeUseCase(userRepository)

  return { sut, userRepository }
}

describe('GetMeUseCase', () => {
  // Cenário: o ID do token não corresponde a nenhum usuário no banco.
  // Pode acontecer se o usuário foi deletado após o token ser emitido.
  it('throws when user is not found', async () => {
    const { sut, userRepository } = makeSut()

    // Mock: banco não encontrou ninguém com esse ID
    vi.mocked(userRepository.findById).mockResolvedValue(null)

    await expect(sut.execute('user-1')).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    )
  })

  // Cenário feliz: usuário encontrado.
  // Retorna PublicUser (sem passwordHash) — o controller envia como resposta 200.
  it('returns public user on success', async () => {
    const { sut, userRepository } = makeSut()

    // Mock: banco encontrou o usuário pelo ID (que veio do JWT payload.sub)
    vi.mocked(userRepository.findById).mockResolvedValue({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      passwordHash: 'hashed',
      kindleEmail: null,
      avatarUrl: null,
    })

    const result = await sut.execute('user-1')

    // Verifica que buscou pelo ID correto
    expect(userRepository.findById).toHaveBeenCalledWith('user-1')
    // Verifica que o retorno NÃO inclui passwordHash (é PublicUser)
    expect(result).toEqual({
      id: 'user-1',
      username: 'joao',
      email: 'joao@email.com',
      kindleEmail: null,
      avatarUrl: null,
    })
  })
})
