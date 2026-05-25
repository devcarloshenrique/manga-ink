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

export class EmailAlreadyInUseError extends Error {
  constructor() {
    super('E-mail já está em uso por outra conta')
  }
}

export class UsernameAlreadyInUseError extends Error {
  constructor() {
    super('Nome de usuário já está em uso')
  }
}
