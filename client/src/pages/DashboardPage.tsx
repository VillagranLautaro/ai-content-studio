import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/store/auth.context'
import { historyApi } from '@/services/api'
import type { Generation } from '@/types'

const categoryColors: Record<string, string> = { blog: '#63b3ed', ecommerce: '#48bb78', social: '#9f7aea', custom: '#f6ad55' }
const categoryBg: Record<string, string> = { blog: 'rgba(99,179,237,0.15)', ecommerce: 'rgba(72,187,120,0.15)', social: 'rgba(159,122,234,0.15)', custom: 'rgba(246,173,85,0.15)' }

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '1.625rem', fontWeight: 600, margin: 0, color: '#e8e6f0', lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>{value}</p>
        <p style={{ fontSize: '0.775rem', color: '#4a4860', margin: '4px 0 0', fontWeight: 400 }}>{label}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    historyApi.getAll(1, 6).then(({ data }) => {
      if (data.data) { setGenerations(data.data.generations); setTotal(data.data.total) }
    }).finally(() => setIsLoading(false))
  }, [])

  const favorites = generations.filter(g => g.is_favorite).length
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const thisWeek = generations.filter(g => new Date(g.created_at) > weekAgo).length

  return (
    <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 48px)', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .gen-row:hover { background: #111120 !important; }
        @media (max-width: 600px) {
          .stat-grid { grid-template-columns: 1fr !important; }
          .dash-header { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .new-btn { width: 100% !important; justify-content: center !important; }
        }
      `}</style>

      {/* Header */}
      <div className="dash-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#4a4860', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>Bienvenido de vuelta</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, margin: 0, color: '#e8e6f0', letterSpacing: '-0.03em' }}>
            {user?.name?.split(' ')[0]} <span style={{ color: '#7c6ff7' }}>✦</span>
          </h1>
        </div>
        <Link to="/editor" className="new-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #7c6ff7, #a855f7)', color: '#fff', textDecoration: 'none', padding: '11px 18px', borderRadius: 12, fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 0 24px rgba(124,111,247,0.25)', whiteSpace: 'nowrap' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          Nueva generación
        </Link>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 32 }}>
        <StatCard label="Total generaciones" value={total} color="rgba(124,111,247,0.15)"
          icon={<svg width="19" height="19" fill="none" stroke="#7c6ff7" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 3.5c-2 4-5 6-8.5 7 3.5 1 6.5 3 8.5 7.5 2-4.5 5-6.5 8.5-7.5-3.5-1-6.5-3-8.5-7z"/></svg>}
        />
        <StatCard label="Esta semana" value={thisWeek} color="rgba(99,179,237,0.15)"
          icon={<svg width="19" height="19" fill="none" stroke="#63b3ed" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}
        />
        <StatCard label="Favoritos" value={favorites} color="rgba(246,173,85,0.15)"
          icon={<svg width="19" height="19" fill="none" stroke="#f6ad55" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
        />
      </div>

      {/* Recent */}
      <div style={{ background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #1a1a2e' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: '#e8e6f0' }}>Generaciones recientes</h2>
          <Link to="/history" style={{ fontSize: '0.8rem', color: '#7c6ff7', textDecoration: 'none', fontWeight: 500 }}>Ver todas →</Link>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div style={{ width: 24, height: 24, border: '2px solid #1a1a2e', borderTopColor: '#7c6ff7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : generations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ width: 44, height: 44, background: 'rgba(124,111,247,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="20" height="20" fill="none" stroke="#7c6ff7" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 3.5c-2 4-5 6-8.5 7 3.5 1 6.5 3 8.5 7.5 2-4.5 5-6.5 8.5-7.5-3.5-1-6.5-3-8.5-7z"/></svg>
            </div>
            <p style={{ color: '#4a4860', fontSize: '0.875rem', margin: '0 0 12px' }}>Todavía no generaste nada</p>
            <Link to="/editor" style={{ display: 'inline-block', background: 'rgba(124,111,247,0.15)', color: '#a89ef5', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 500 }}>Ir al Editor IA</Link>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {generations.map((gen, i) => (
              <li key={gen.id} className="gen-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: i < generations.length - 1 ? '1px solid #111120' : 'none', transition: 'background 0.15s' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: categoryBg[gen.template_name || 'custom'] || categoryBg.custom, color: categoryColors[gen.template_name || 'custom'] || categoryColors.custom, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {gen.template_name || 'custom'}
                    </span>
                    {gen.is_favorite && <svg width="11" height="11" fill="#f6ad55" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#6b6880', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gen.output_text.slice(0, 80)}...</p>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#3a3850', margin: 0, flexShrink: 0 }}>{new Date(gen.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
