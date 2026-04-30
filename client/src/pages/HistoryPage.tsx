import { useEffect, useState, useCallback } from 'react'
import { historyApi } from '@/services/api'
import type { Generation } from '@/types'

const LIMIT = 10
const catColors: Record<string, string> = { blog: '#63b3ed', ecommerce: '#48bb78', social: '#9f7aea', custom: '#f6ad55' }
const catBg: Record<string, string> = { blog: 'rgba(99,179,237,0.1)', ecommerce: 'rgba(72,187,120,0.1)', social: 'rgba(159,122,234,0.1)', custom: 'rgba(246,173,85,0.1)' }

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
      if (data.data) { setGenerations(data.data.generations); setTotal(data.data.total) }
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { load(page) }, [page, load])

  const handleFavorite = async (gen: Generation) => {
    const { data } = await historyApi.toggleFavorite(gen.id)
    if (data.data) {
      setGenerations(prev => prev.map(g => g.id === gen.id ? { ...g, is_favorite: data.data!.is_favorite } : g))
      if (selected?.id === gen.id) setSelected(p => p ? { ...p, is_favorite: data.data!.is_favorite } : null)
    }
  }

  const handleDelete = async (gen: Generation) => {
    if (!confirm('¿Eliminás esta generación?')) return
    await historyApi.delete(gen.id)
    if (selected?.id === gen.id) setSelected(null)
    load(page)
  }

  const displayed = filter === 'favorites' ? generations.filter(g => g.is_favorite) : generations

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 48px)', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .hist-grid { display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: start; }
        @media (max-width: 900px) { .hist-grid { grid-template-columns: 1fr !important; } }
        .gen-card:hover { border-color: #2a2a3a !important; }
        .icon-btn:hover { background: rgba(255,255,255,0.05) !important; color: #8a8699 !important; }
        .hist-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
        @media (max-width: 500px) { .hist-header { flex-direction: column; gap: 14px; } .filter-btns { width: 100%; } }
      `}</style>

      <div className="hist-header">
        <div>
          <p style={{ fontSize: '0.75rem', color: '#4a4860', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>{total} registros</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, margin: 0, color: '#e8e6f0', letterSpacing: '-0.03em' }}>Historial</h1>
        </div>
        <div className="filter-btns" style={{ display: 'flex', background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 10, padding: 4, gap: 4 }}>
          {(['all', 'favorites'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: '7px 14px', borderRadius: 7, border: 'none', background: filter === f ? '#1a1a2e' : 'transparent', color: filter === f ? '#e8e6f0' : '#4a4860', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
              {f === 'all' ? 'Todas' : '★ Favoritos'}
            </button>
          ))}
        </div>
      </div>

      <div className={selected ? 'hist-grid' : ''} style={selected ? {} : {}}>
        {/* List */}
        <div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
              <div style={{ width: 24, height: 24, border: '2px solid #1a1a2e', borderTopColor: '#7c6ff7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ color: '#4a4860', fontSize: '0.875rem', margin: 0 }}>{filter === 'favorites' ? 'No tenés favoritos todavía' : 'Todavía no generaste nada'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayed.map(gen => (
                <div key={gen.id} className="gen-card" onClick={() => setSelected(s => s?.id === gen.id ? null : gen)} style={{ background: '#0d0d14', border: `1px solid ${selected?.id === gen.id ? 'rgba(124,111,247,0.3)' : '#1a1a2e'}`, borderRadius: 14, padding: '13px 16px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: catBg[gen.template_name || 'custom'] || catBg.custom, color: catColors[gen.template_name || 'custom'] || catColors.custom, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{gen.template_name || 'custom'}</span>
                      <span style={{ fontSize: '0.72rem', color: '#3a3850' }}>{new Date(gen.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: '#6b6880', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gen.output_text.slice(0, 90)}...</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <button className="icon-btn" onClick={e => { e.stopPropagation(); handleFavorite(gen) }} style={{ padding: 6, borderRadius: 7, border: 'none', background: 'transparent', color: gen.is_favorite ? '#f6ad55' : '#3a3850', cursor: 'pointer', display: 'flex', transition: 'all 0.15s' }}>
                      <svg width="15" height="15" fill={gen.is_favorite ? '#f6ad55' : 'none'} stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </button>
                    <button className="icon-btn" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(gen.output_text) }} style={{ padding: 6, borderRadius: 7, border: 'none', background: 'transparent', color: '#3a3850', cursor: 'pointer', display: 'flex', transition: 'all 0.15s' }}>
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    </button>
                    <button className="icon-btn" onClick={e => { e.stopPropagation(); handleDelete(gen) }} style={{ padding: 6, borderRadius: 7, border: 'none', background: 'transparent', color: '#3a3850', cursor: 'pointer', display: 'flex', transition: 'all 0.15s' }}>
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                    </button>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, flexWrap: 'wrap', gap: 10 }}>
                  <span style={{ fontSize: '0.8rem', color: '#3a3850' }}>Página {page} de {totalPages}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ label: '← Ant', disabled: page === 1, action: () => setPage(p => p - 1) }, { label: 'Sig →', disabled: page === totalPages, action: () => setPage(p => p + 1) }].map(btn => (
                      <button key={btn.label} onClick={btn.action} disabled={btn.disabled} style={{ background: '#0d0d14', border: '1px solid #1a1a2e', color: btn.disabled ? '#2e2c42' : '#8a8699', borderRadius: 8, padding: '7px 14px', fontSize: '0.8rem', cursor: btn.disabled ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif" }}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid #1a1a2e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: catBg[selected.template_name || 'custom'] || catBg.custom, color: catColors[selected.template_name || 'custom'] || catColors.custom, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{selected.template_name || 'custom'}</span>
                {selected.is_favorite && <svg width="12" height="12" fill="#f6ad55" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'transparent', border: 'none', color: '#3a3850', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {Object.keys(selected.input_params).length > 0 && (
              <div style={{ padding: '11px 16px', borderBottom: '1px solid #111120', background: '#080810' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#3a3850', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>Parámetros</p>
                {Object.entries(selected.input_params).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 8, fontSize: '0.78rem', marginBottom: 4 }}>
                    <span style={{ color: '#4a4860', textTransform: 'capitalize', flexShrink: 0 }}>{k}:</span>
                    <span style={{ color: '#6b6880', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#3a3850', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>Resultado</p>
                <button onClick={() => navigator.clipboard.writeText(selected.output_text)} style={{ fontSize: '0.75rem', color: '#7c6ff7', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Copiar</button>
              </div>
              <pre style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '0.825rem', color: '#8a8699', whiteSpace: 'pre-wrap', lineHeight: 1.7, maxHeight: 300, overflowY: 'auto' }}>{selected.output_text}</pre>
            </div>

            <div style={{ padding: '10px 16px', borderTop: '1px solid #111120', display: 'flex', justifyContent: 'space-between', background: '#080810' }}>
              <span style={{ fontSize: '0.75rem', color: '#2e2c42' }}>{selected.tokens_used} tokens</span>
              <span style={{ fontSize: '0.75rem', color: '#2e2c42' }}>{new Date(selected.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
