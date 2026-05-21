import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="p-4 bg-neutral-800 rounded-lg shadow-md border border-neutral-700">
      <h2 className="text-2xl font-semibold mb-4 text-blue-300">
        Bem-vindo ao Novo MangaForge!
      </h2>
      <p className="text-neutral-300">
        Seu ambiente React 19 + Vite + Tailwind v4 + TanStack Router está configurado e funcionando.
      </p>
      
      <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium cursor-pointer transition-colors">
        Botão do Tailwind
      </button>
    </div>
  )
}