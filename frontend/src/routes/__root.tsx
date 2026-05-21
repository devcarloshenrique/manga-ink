import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
// Descomente a linha abaixo na hora de debugar rotas se instalar a extensão
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-neutral-900 text-white font-sans p-6">
      <header className="pb-4 border-b border-neutral-700 mb-6 flex gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          MangaForge
        </h1>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm hover:text-blue-400 [&.active]:font-bold [&.active]:text-blue-500">
            Home
          </Link>
        </nav>
      </header>
      
      <main>
        {/* Aqui é onde o conteúdo das páginas vai renderizar */}
        <Outlet /> 
      </main>

      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </div>
  ),
})