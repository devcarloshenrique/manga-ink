export class UserAlreadyExistsError extends Error {
  constructor() {
    super('Usuário ou email já cadastrado')
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciais inválidas')
  }
}
