import { env } from './shared/config/env'
import { createServer } from './shared/server'

const app = createServer()

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${env.PORT}`)
  console.log(`📚 Documentação Swagger em http://localhost:${env.PORT}/api-docs`)
})