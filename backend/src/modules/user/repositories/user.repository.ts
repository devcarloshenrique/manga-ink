import type { User } from '../entities/user.entity'

export type CreateUserInput = {
  username: string
  email: string
  passwordHash: string
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  findByEmailOrUsername(email: string, username: string): Promise<User | null>
  create(data: CreateUserInput): Promise<User>
}
