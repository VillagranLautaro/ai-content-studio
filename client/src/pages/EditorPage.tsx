import { useEffect, useState } from 'react'
import { generateApi } from '@/services/api'
import { useGenerate } from '@/hooks/useGenerate'
import type { Template } from '@/types'

const categoryColors: Record<string, string> = {
  blog: '#63b3ed', ecommerce: '#48bb78', social: '#9f7aea', custom: '#f6ad55',
}
const categoryBg: Record<string, string> = {
  blog: 'rgba(99,179,237,0.12)', ecommerce: 'rgba(72,187,120,0.12)', social: 'rgba(159,122,234,0.12)', custom: 'rgba(246,173,85,0.12)',
}

export function EditorPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selected, setSelected] = useState<Template | null>(null)
  const [params, setParams] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { output, isGenerating, isComplete, error, generate, reset } = useGenerate()

  useEffect(() => {
    generateApi.getTemplates().then(({ data }) => {
      if (data.data) setTemplates(data.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleSelect = (t: Template) => { setSelected(t); setParams({}); reset() }
  const handleParam = (k: string, v: string) => setParams(p => ({ ...p, [k]: v }))
  const handleGenerate = () => { if (selected) generate(selected, params) }
  const handleCopy = async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const isValid = selected?.fields.filter(f => f.required).every(f => params[f.key]?.trim())

  const inputStyle = { width: '100%', background: '#0a0a0f', border: '1px solid #1a1a2e', borderRadius: 10, padding: '10px 14px', color: '#e8e6f0', fontSize: '0.875rem', outline: 'none', fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.2s' }

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=Outfit:wght@300;400;500&display=swap');
        .param-input:focus { border-color: #7c6ff7 !important; box-shadow: 0 0 0 3px rgba(124,111,247,0.1); }
        .tpl-btn:hover { background: rgba(124,111,247,0.06) !important; border-color: rgba(124,111,247,0.15) !important; }
        @keyframes cursor { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: '0.75rem', color: '#4a4860', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>Generador</p>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 700, margin: 0, color: '#e8e6f0', letterSpacing: '-0.03em' }}>Editor <span style={{ color: '#7c6ff7' }}>IA</span></h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Templates */}
          <div style={{ background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 16, padding: 16 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#3a3850', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px 4px' }}>Templates</p>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <div style={{ width: 20, height: 20, border: '2px solid #1a1a2e', borderTopColor: '#7c6ff7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {templates.map(t => (
                  <button key={t.id} className="tpl-btn" onClick={() => handleSelect(t)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px', borderRadius: 10, border: `1px solid ${selected?.id === t.id ? 'rgba(124,111,247,0.3)' : 'transparent'}`, background: selected?.id === t.id ? 'rgba(124,111,247,0.1)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', width: '100%' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: selected?.id === t.id ? '#a89ef5' : '#8a8699' }}>{t.name}</span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: categoryBg[t.category] || categoryBg.custom, color: categoryColors[t.category] || categoryColors.custom, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>{t.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Params */}
          {selected && (
            <div style={{ background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 16, padding: 16 }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#3a3850', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px 4px' }}>Parámetros</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selected.fields.map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b6880', display: 'block', marginBottom: 6 }}>
                      {field.label} {field.required && <span style={{ color: '#7c6ff7' }}>*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select value={params[field.key] || ''} onChange={e => handleParam(field.key, e.target.value)} className="param-input" style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">Seleccioná...</option>
                        {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea value={params[field.key] || ''} onChange={e => handleParam(field.key, e.target.value)} placeholder={field.placeholder} rows={3} className="param-input" style={{ ...inputStyle, resize: 'none' }} />
                    ) : field.type === 'boolean' ? (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" checked={params[field.key] === 'true'} onChange={e => handleParam(field.key, String(e.target.checked))} style={{ accentColor: '#7c6ff7', width: 16, height: 16 }} />
                        <span style={{ fontSize: '0.8rem', color: '#8a8699' }}>{field.label}</span>
                      </label>
                    ) : (
                      <input type="text" value={params[field.key] || ''} onChange={e => handleParam(field.key, e.target.value)} placeholder={field.placeholder} className="param-input" style={inputStyle} />
                    )}
                  </div>
                ))}
                <button onClick={handleGenerate} disabled={!isValid || isGenerating} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: !isValid || isGenerating ? '#1a1a2e' : 'linear-gradient(135deg, #7c6ff7, #a855f7)', color: !isValid || isGenerating ? '#3a3850' : '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: '0.875rem', fontWeight: 600, cursor: !isValid || isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: 4, boxShadow: !isValid || isGenerating ? 'none' : '0 0 20px rgba(124,111,247,0.2)' }}>
                  {isGenerating ? (
                    <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generando...</>
                  ) : (
                    <><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 3.5c-2 4-5 6-8.5 7 3.5 1 6.5 3 8.5 7.5 2-4.5 5-6.5 8.5-7.5-3.5-1-6.5-3-8.5-7z"/></svg> Generar contenido</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div style={{ background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 16, minHeight: 500, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1a1a2e' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#e8e6f0' }}>Resultado</span>
              {isGenerating && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#7c6ff7', fontWeight: 500 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c6ff7', animation: 'cursor 1s infinite', display: 'inline-block' }} />Generando...</span>}
              {isComplete && <span style={{ fontSize: '0.75rem', color: '#48bb78', fontWeight: 500 }}>✓ Completado</span>}
            </div>
            {output && (
              <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(124,111,247,0.1)', color: '#a89ef5', border: '1px solid rgba(124,111,247,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            )}
          </div>

          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: !output && !error ? 'center' : 'flex-start' }}>
            {!output && !isGenerating && !error && (
              <div style={{ textAlign: 'center', color: '#2e2c42' }}>
                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" viewBox="0 0 24 24" style={{ opacity: 0.4, marginBottom: 12 }}><path d="M12 3.5c-2 4-5 6-8.5 7 3.5 1 6.5 3 8.5 7.5 2-4.5 5-6.5 8.5-7.5-3.5-1-6.5-3-8.5-7z"/></svg>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>{selected ? 'Completá los parámetros y generá' : 'Elegí un template para empezar'}</p>
              </div>
            )}
            {error && <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.15)', borderRadius: 10, padding: '12px 16px', color: '#ff8080', fontSize: '0.875rem' }}>{error}</div>}
            {output && (
              <pre style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', color: '#c4bfdd', whiteSpace: 'pre-wrap', lineHeight: 1.75 }}>
                {output}
                {isGenerating && <span style={{ display: 'inline-block', width: 2, height: 16, background: '#7c6ff7', marginLeft: 2, verticalAlign: 'middle', animation: 'cursor 0.85s infinite' }} />}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
