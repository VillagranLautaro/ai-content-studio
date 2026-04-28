import { useEffect, useState, useCallback } from 'react'
import { historyApi } from '@/services/api'
import { Card, Badge, Spinner, EmptyState } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import type { Generation } from '@/types'

const LIMIT = 10

export function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState<Generation | null>(null)
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')

  const totalPages = Math.ceil(total / LIMIT)

  const load = useCallback(async (p: number) => {
    setIsLoading(true)
    try {
      const { data } = await historyApi.getAll(p, LIMIT)
      if (data.data) {
        setGenerations(data.data.generations)
        setTotal(data.data.total)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  const handleFavorite = async (gen: Generation) => {
    const { data } = await historyApi.toggleFavorite(gen.id)
    if (data.data) {
      setGenerations(prev => prev.map(g => g.id === gen.id ? { ...g, is_favorite: data.data!.is_favorite } : g))
      if (selected?.id === gen.id) setSelected(prev => prev ? { ...prev, is_favorite: data.data!.is_favorite } : null)
    }
  }

  const handleDelete = async (gen: Generation) => {
    if (!confirm('¿Eliminás esta generación?')) return
    await historyApi.delete(gen.id)
    if (selected?.id === gen.id) setSelected(null)
    load(page)
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  const displayed = filter === 'favorites'
    ? generations.filter(g => g.is_favorite)
    : generations

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Historial</h1>
          <p className="text-sm text-gray-500 mt-1">{total} generaciones en total</p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          {(['all', 'favorites'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f === 'all' ? 'Todas' : '★ Favoritos'}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-6 ${selected ? 'grid-cols-[1fr_420px]' : 'grid-cols-1'}`}>

        {/* List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : displayed.length === 0 ? (
            <Card>
              <EmptyState
                title={filter === 'favorites' ? 'No tenés favoritos todavía' : 'Todavía no generaste nada'}
                description={filter === 'favorites' ? 'Marcá generaciones con ★ para verlas acá' : 'Usá el Editor IA para crear tu primer contenido'}
              />
            </Card>
          ) : (
            displayed.map(gen => (
              <Card
                key={gen.id}
                className={`cursor-pointer transition-all duration-150 hover:shadow-md ${
                  selected?.id === gen.id ? 'ring-2 ring-violet-500' : ''
                }`}
              >
                <div className="p-4" onClick={() => setSelected(selected?.id === gen.id ? null : gen)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge label={gen.template_name || 'custom'} />
                        <span className="text-xs text-gray-400">
                          {new Date(gen.created_at).toLocaleDateString('es-AR', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                        {gen.output_text}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{gen.tokens_used} tokens usados</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleFavorite(gen)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          gen.is_favorite
                            ? 'text-amber-400 hover:text-amber-500'
                            : 'text-gray-300 hover:text-amber-400'
                        }`}
                        title="Favorito"
                      >
                        <svg className="w-4 h-4" fill={gen.is_favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleCopy(gen.output_text)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 transition-colors"
                        title="Copiar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(gen)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Siguiente →
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <Card className="h-fit sticky top-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Badge label={selected.template_name || 'custom'} />
                {selected.is_favorite && (
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Params used */}
            {Object.keys(selected.input_params).length > 0 && (
              <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Parámetros</p>
                <div className="space-y-1">
                  {Object.entries(selected.input_params).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs">
                      <span className="text-gray-400 capitalize shrink-0">{k}:</span>
                      <span className="text-gray-700 line-clamp-1">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resultado</p>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(selected.output_text)}>
                  Copiar
                </Button>
              </div>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto">
                {selected.output_text}
              </pre>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">{selected.tokens_used} tokens</span>
              <span className="text-xs text-gray-400">
                {new Date(selected.created_at).toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
