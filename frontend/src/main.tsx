import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Importa o arquivo CSS principal (com o Tailwind embutido)
import './index.css'

// Importa as rotas geradas automaticamente
import { routeTree } from './routeTree.gen'

// Cria a instância do roteador
const router = createRouter({ routeTree })

// Tipagem segura para todo o projeto
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Renderiza a aplicação
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)