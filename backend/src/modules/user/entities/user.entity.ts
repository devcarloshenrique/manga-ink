export type User = {
  id: string
  username: string
  email: string
  passwordHash: string
}

export type PublicUser = Omit<User, 'passwordHash'>
