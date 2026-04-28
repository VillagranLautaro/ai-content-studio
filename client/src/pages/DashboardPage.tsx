import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/store/auth.context'
import { historyApi } from '@/services/api'
import { Card, Badge, Spinner } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import type { Generation } from '@/types'

interface Stats {
  total: number
  favorites: number
  thisWeek: number
}

export function DashboardPage() {
  const { user } = useAuth()
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, favorites: 0, thisWeek: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    historyApi.getAll(1, 5)
      .then(({ data }) => {
        if (data.data) {
          const gens = data.data.generations
          setRecentGenerations(gens)

          const now = new Date()
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          setStats({
            total: data.data.total,
            favorites: gens.filter(g => g.is_favorite).length,
            thisWeek: gens.filter(g => new Date(g.created_at) > weekAgo).length,
          })
        }
      })
      .catch(() => {/* ignore — empty state handles it */})
      .finally(() => setIsLoading(false))
  }, [])

  const statCards = [
    {
      label: 'Generaciones totales',
      value: stats.total,
      icon: (
        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
      bg: 'bg-violet-50',
    },
    {
      label: 'Esta semana',
      value: stats.thisWeek,
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
        </svg>
      ),
      bg: 'bg-blue-50',
    },
    {
      label: 'Favoritos',
      value: stats.favorites,
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Hola, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">¿Qué contenido generamos hoy?</p>
        </div>
        <Link to="/editor">
          <Button size="lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva generación
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent generations */}
      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Generaciones recientes</h2>
          <Link to="/history" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
            Ver todas →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : recentGenerations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Todavía no generaste nada</p>
            <p className="text-sm text-gray-500 mb-4">Probá el Editor IA para crear tu primer contenido</p>
            <Link to="/editor">
              <Button size="sm">Ir al Editor IA</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentGenerations.map((gen) => (
              <li key={gen.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge label={gen.template_name || 'custom'} />
                    {gen.is_favorite && (
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 truncate">{gen.output_text.slice(0, 100)}...</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">
                    {new Date(gen.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{gen.tokens_used} tokens</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
