import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth.context'

export function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()
  const streamRef = useRef<HTMLSpanElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, isLoading, navigate])

  // Streaming text animation
  useEffect(() => {
    const text = `Hace un año no sabía qué era una variable. Hoy trabajo como desarrollador fullstack.\n\nLo que nadie te dice sobre aprender a programar en 2025:\n\n→ No necesitás un título universitario\n→ Lo que importa es lo que podés construir\n→ La constancia le gana al talento todos los días\n\nEmpecé con tutoriales de YouTube, después hice un bootcamp, después construí proyectos reales. Cada paso fue incómodo. Cada error fue aprendizaje.\n\nSi estás pensando en empezar: hacelo hoy.\n\n#programacion #desarrolloweb #aprendizaje`
    let i = 0

    const typeNext = () => {
      if (!streamRef.current || !cursorRef.current) return
      if (i < text.length) {
        streamRef.current.textContent += text[i]
        i++
        setTimeout(typeNext, i < 50 ? 30 : Math.random() * 25 + 15)
      } else {
        if (cursorRef.current) cursorRef.current.style.display = 'none'
      }
    }

    const timer = setTimeout(typeNext, 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fafafa', color: '#1a1a1a', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --purple: #7C6FF7;
          --purple-light: #EEEDFE;
          --purple-mid: #AFA9EC;
          --purple-dark: #3C3489;
          --muted: #6b6b6b;
          --border: #e8e6f0;
        }
        .land-serif { font-family: 'DM Serif Display', serif; }
        .eyebrow-dot { animation: lpulse 2s infinite; }
        @keyframes lpulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .cursor-blink { animation: lblink .85s infinite; }
        @keyframes lblink { 0%,100%{opacity:1} 50%{opacity:0} }
        .msg-anim { animation: lfadeUp .4s ease both; }
        @keyframes lfadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .feature-card:hover { background: #faf9ff !important; }
        .btn-primary:hover { background: var(--purple-dark) !important; transform: translateY(-1px); }
        .btn-secondary:hover { border-color: var(--purple-mid) !important; color: var(--purple) !important; }
        .nav-link:hover { color: #1a1a1a !important; }
        .int-logo:hover { opacity: 1 !important; }
        .footer-link:hover { color: var(--purple) !important; }
      `}</style>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 2.5rem', background:'#fff', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:"'DM Serif Display',serif", fontSize:'1.15rem' }}>
          <div style={{ width:28, height:28, background:'var(--purple)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 16 16">
              <path d="M8 2.5c-1 2-3 3-5 3.5 2 .5 4 1.5 5 4 1-2.5 3-3.5 5-4-2-.5-4-1.5-5-3.5z"/>
            </svg>
          </div>
          AI Studio
        </div>
        <div style={{ display:'flex', gap:'2rem', fontSize:'.875rem' }}>
          {['Producto','Templates','Precios','Docs'].map(l => (
            <span key={l} className="nav-link" style={{ color:'var(--muted)', cursor:'pointer', transition:'color .2s' }}>{l}</span>
          ))}
        </div>
        <button className="btn-primary" onClick={() => navigate('/register')} style={{ background:'var(--purple)', color:'#fff', border:'none', padding:'.5rem 1.25rem', borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:'.875rem', fontWeight:500, cursor:'pointer', transition:'all .2s' }}>
          Probarlo gratis
        </button>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'5rem 2.5rem 3rem' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--purple-light)', color:'var(--purple-dark)', fontSize:'.75rem', fontWeight:500, padding:'5px 12px', borderRadius:100, marginBottom:'1.75rem', letterSpacing:'.04em', textTransform:'uppercase' }}>
          <span className="eyebrow-dot" style={{ width:6, height:6, background:'var(--purple)', borderRadius:'50%', display:'inline-block' }} />
          Generación de contenido con IA
        </div>
        <h1 className="land-serif" style={{ fontSize:'clamp(2.4rem,5vw,3.5rem)', lineHeight:1.1, marginBottom:'1.25rem', letterSpacing:'-.02em' }}>
          Creá contenido que<br /><em style={{ fontStyle:'italic', color:'var(--purple)' }}>conecta de verdad</em>
        </h1>
        <p style={{ fontSize:'1.05rem', color:'var(--muted)', lineHeight:1.7, maxWidth:500, margin:'0 auto 2.5rem', fontWeight:300 }}>
          Generá posts, artículos y descripciones en segundos con IA. Templates inteligentes, streaming en tiempo real, historial completo.
        </p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem', flexWrap:'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ background:'var(--purple)', color:'#fff', border:'none', padding:'.75rem 1.75rem', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:'.9375rem', fontWeight:500, cursor:'pointer', transition:'all .2s', display:'inline-flex', alignItems:'center', gap:8 }}>
            Empezar ahora
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </button>
          <button className="btn-secondary" onClick={() => navigate('/login')} style={{ background:'transparent', color:'#1a1a1a', border:'1px solid var(--border)', padding:'.75rem 1.5rem', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:'.9375rem', cursor:'pointer', transition:'all .2s' }}>
            Ya tengo cuenta
          </button>
        </div>
      </div>

      {/* Chat demo */}
      <div style={{ maxWidth:640, margin:'0 auto 1rem', background:'#fff', border:'1px solid var(--border)', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 40px rgba(124,111,247,.08)' }}>
        <div style={{ padding:'.875rem 1.25rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:8, height:8, background:'#22c55e', borderRadius:'50%' }} />
          <span style={{ fontSize:'.8125rem', fontWeight:500, color:'var(--muted)' }}>AI Studio — Editor en vivo</span>
        </div>
        <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem', minHeight:220 }}>
          <div className="msg-anim" style={{ display:'flex', gap:10, alignItems:'flex-start', flexDirection:'row-reverse', animationDelay:'.1s' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'#f0f0f0', color:'#555', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:500, flexShrink:0 }}>LV</div>
            <div style={{ maxWidth:'85%', padding:'.625rem .875rem', borderRadius:14, borderBottomRightRadius:4, background:'var(--purple)', color:'#fff', fontSize:'.875rem', lineHeight:1.6 }}>
              Escribime un post de LinkedIn sobre aprender a programar en 2025
            </div>
          </div>
          <div className="msg-anim" style={{ display:'flex', gap:10, alignItems:'flex-start', animationDelay:'.4s' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--purple-light)', color:'var(--purple-dark)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:500, flexShrink:0 }}>AI</div>
            <div style={{ maxWidth:'85%', padding:'.625rem .875rem', borderRadius:14, borderBottomLeftRadius:4, background:'var(--purple-light)', color:'#1a1a1a', fontSize:'.875rem', lineHeight:1.6 }}>
              <span ref={streamRef} style={{ whiteSpace:'pre-wrap' }} />
              <span ref={cursorRef} className="cursor-blink" style={{ display:'inline-block', width:2, height:14, background:'var(--purple)', marginLeft:2, verticalAlign:'middle' }} />
            </div>
          </div>
        </div>
        <div style={{ padding:'.875rem 1.25rem', borderTop:'1px solid var(--border)', display:'flex', gap:'.75rem', alignItems:'center' }}>
          <input type="text" placeholder="Describí el contenido que necesitás..." style={{ flex:1, border:'1px solid var(--border)', borderRadius:8, padding:'.5rem .875rem', fontFamily:"'DM Sans',sans-serif", fontSize:'.875rem', outline:'none', color:'#1a1a1a', background:'#fafafa' }} />
          <button onClick={() => navigate('/register')} style={{ background:'var(--purple)', color:'#fff', border:'none', width:32, height:32, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M14 8H2M9 3l5 5-5 5"/></svg>
          </button>
        </div>
      </div>
      <div style={{ textAlign:'center', padding:'.5rem 0 4rem' }}>
        <span style={{ fontSize:'.8rem', color:'var(--muted)' }}>↑ Demo interactiva — streaming real con Groq IA</span>
      </div>

      {/* Features */}
      <div style={{ padding:'4rem 2.5rem', maxWidth:1100, margin:'0 auto' }}>
        <p style={{ fontSize:'.75rem', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--purple)', fontWeight:500, marginBottom:'.75rem' }}>Capacidades</p>
        <h2 className="land-serif" style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', lineHeight:1.15, marginBottom:'1rem', letterSpacing:'-.02em' }}>
          Todo lo que necesitás<br />para crear mejor contenido
        </h2>
        <p style={{ color:'var(--muted)', fontSize:'.9375rem', lineHeight:1.7, fontWeight:300, maxWidth:480, marginBottom:'3rem' }}>
          Herramientas diseñadas para que puedas generar, editar y guardar contenido sin fricción.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1px', background:'var(--border)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
          {[
            { icon: 'M10 2.5c-1.5 3-4 4.5-7 5.5 3 1 5.5 2.5 7 6 1.5-3.5 4-5 7-6-3-.5-5.5-2-7-5.5z', title: 'Streaming en tiempo real', desc: 'El contenido aparece mientras se genera. Sin esperas, sin pantallas de carga.' },
            { icon: 'M2 4h16M2 8h10M2 12h13', title: 'Templates inteligentes', desc: 'LinkedIn, blog, e-commerce, email. Formularios dinámicos adaptados a cada formato.' },
            { icon: 'M10 3a7 7 0 100 14A7 7 0 0010 3zm0 3v4l3 3', title: 'Historial completo', desc: 'Guardá, filtrá y reutilizá todas tus generaciones. Marcá favoritos con un click.' },
            { icon: 'M16 8V6a4 4 0 00-8 0v2M3 8h14v10H3z', title: 'Auth segura con JWT', desc: 'Registro, login y refresh tokens con bcrypt. Cada sesión es tuya y solo tuya.' },
            { icon: 'M10 3a7 7 0 100 14M10 7v3M10 13v1', title: 'Rate limiting', desc: 'Control de uso por usuario. Escalable para producción desde el día uno.' },
            { icon: 'M4 16l4-4M16 4L8 12M16 16L4 4', title: 'TypeScript end-to-end', desc: 'Frontend y backend completamente tipados. Menos bugs, mejor developer experience.' },
          ].map((f) => (
            <div key={f.title} className="feature-card" style={{ background:'#fff', padding:'1.75rem', transition:'background .2s' }}>
              <div style={{ width:40, height:40, background:'var(--purple-light)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem' }}>
                <svg width="20" height="20" fill="none" stroke="var(--purple)" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 20 20">
                  <path d={f.icon}/>
                </svg>
              </div>
              <p style={{ fontWeight:500, fontSize:'.9375rem', marginBottom:'.5rem' }}>{f.title}</p>
              <p style={{ fontSize:'.875rem', color:'var(--muted)', lineHeight:1.65, fontWeight:300 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div style={{ padding:'3rem 2.5rem', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'#fff', textAlign:'center' }}>
        <p style={{ fontSize:'.8125rem', color:'var(--muted)', marginBottom:'1.75rem', fontWeight:300 }}>Construido con tecnología de primer nivel</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'2rem', flexWrap:'wrap' }}>
          {[
            { icon:'R', bg:'#61DAFB', textColor:'#000', label:'React 18' },
            { icon:'TS', bg:'#3178C6', textColor:'#fff', label:'TypeScript' },
            { icon:'N', bg:'#000', textColor:'#fff', label:'Node.js' },
            { icon:'PG', bg:'#336791', textColor:'#fff', label:'PostgreSQL' },
            { icon:'G', bg:'#F04E23', textColor:'#fff', label:'Groq AI' },
            { icon:'R', bg:'#FF4154', textColor:'#fff', label:'Railway' },
            { icon:'V', bg:'#000', textColor:'#fff', label:'Vercel' },
          ].map((t) => (
            <div key={t.label} className="int-logo" style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.8125rem', fontWeight:500, color:'var(--muted)', opacity:.7, transition:'opacity .2s', cursor:'default' }}>
              <div style={{ width:28, height:28, borderRadius:7, background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.65rem', fontWeight:700, color:t.textColor }}>{t.icon}</div>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:'5rem 2.5rem', textAlign:'center', background:'linear-gradient(135deg,#f5f3ff 0%,#fafafa 100%)', borderTop:'1px solid var(--border)' }}>
        <div style={{ maxWidth:560, margin:'0 auto', background:'#fff', border:'1px solid var(--border)', borderRadius:24, padding:'3.5rem 2.5rem', boxShadow:'0 2px 30px rgba(124,111,247,.07)' }}>
          <p style={{ fontSize:'2rem', marginBottom:'.75rem' }}>✦</p>
          <h2 className="land-serif" style={{ fontSize:'2rem', marginBottom:'.875rem', letterSpacing:'-.02em' }}>
            Empezá a generar<br />contenido hoy
          </h2>
          <p style={{ color:'var(--muted)', fontSize:'.9375rem', lineHeight:1.7, fontWeight:300, marginBottom:'2rem' }}>
            Sin configuraciones complejas. Registrate, elegí un template y generá tu primer contenido en menos de 2 minutos.
          </p>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ background:'var(--purple)', color:'#fff', border:'none', padding:'.875rem 2rem', borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:'1rem', fontWeight:500, cursor:'pointer', transition:'all .2s', display:'inline-flex', alignItems:'center', gap:8, width:'100%', justifyContent:'center' }}>
            Crear cuenta gratis
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </button>
          <p style={{ fontSize:'.8rem', color:'var(--muted)', marginTop:'.875rem' }}>Sin tarjeta de crédito · Gratis para empezar</p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding:'2rem 2.5rem', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:"'DM Serif Display',serif", fontSize:'1rem' }}>
          <div style={{ width:24, height:24, background:'var(--purple)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 16 16">
              <path d="M8 2.5c-1 2-3 3-5 3.5 2 .5 4 1.5 5 4 1-2.5 3-3.5 5-4-2-.5-4-1.5-5-3.5z"/>
            </svg>
          </div>
          AI Studio
        </div>
        <p style={{ fontSize:'.8125rem', color:'var(--muted)' }}>Portfolio project — Lautaro Villagran · 2025</p>
        <div style={{ display:'flex', gap:'1.5rem', fontSize:'.8125rem' }}>
          {['GitHub','Docs','Contacto'].map(l => (
            <span key={l} className="footer-link" style={{ color:'var(--muted)', cursor:'pointer', textDecoration:'none', transition:'color .2s' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}
