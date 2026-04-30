import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/auth.context'
import { ReactNode, useState, useEffect } from 'react'

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/editor',
    label: 'Editor IA',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 24 24">
        <path d="M12 3.5c-2 4-5 6-8.5 7 3.5 1 6.5 3 8.5 7.5 2-4.5 5-6.5 8.5-7.5-3.5-1-6.5-3-8.5-7z"/>
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'Historial',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
      </svg>
    ),
  },
]

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Close sidebar on route change on mobile
  const handleNavClick = () => { if (isMobile) setSidebarOpen(false) }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const sidebarVisible = !isMobile || sidebarOpen

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#e8e6f0', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Syne:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
        .nav-link { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; text-decoration: none; color: #6b6880; font-size: 0.875rem; font-weight: 500; transition: all 0.2s; border: 1px solid transparent; }
        .nav-link:hover { color: #c4bfdd; background: rgba(124,111,247,0.06); }
        .nav-link.active { color: #a89ef5; background: rgba(124,111,247,0.12); border-color: rgba(124,111,247,0.2); }
        .logout-btn:hover { background: rgba(255,80,80,0.08) !important; color: #ff6b6b !important; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 40; backdrop-filter: blur(2px); }
        .hamburger:hover { background: rgba(124,111,247,0.1) !important; }
      `}</style>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      {sidebarVisible && (
        <aside style={{
          width: 220,
          background: '#0d0d14',
          borderRight: '1px solid #1a1a2e',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 12px',
          position: 'fixed',
          height: '100vh',
          zIndex: 50,
          ...(isMobile ? { boxShadow: '4px 0 32px rgba(0,0,0,0.5)', transition: 'transform 0.25s ease' } : {}),
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #7c6ff7, #a855f7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M12 3.5c-2 4-5 6-8.5 7 3.5 1 6.5 3 8.5 7.5 2-4.5 5-6.5 8.5-7.5-3.5-1-6.5-3-8.5-7z"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#e8e6f0', letterSpacing: '-0.02em' }}>AI Studio</span>
            </div>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#4a4860', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#3a3850', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>Menú</p>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} onClick={handleNavClick} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User */}
          <div style={{ borderTop: '1px solid #1a1a2e', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #7c6ff7, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#c4bfdd', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                <p style={{ fontSize: '0.7rem', color: '#4a4860', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: '#4a4860', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', width: '100%', textAlign: 'left' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </aside>
      )}

      {/* Main */}
      <main style={{ marginLeft: isMobile ? 0 : 220, flex: 1, minHeight: '100vh', overflowY: 'auto' }}>
        {/* Mobile topbar */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#0d0d14', borderBottom: '1px solid #1a1a2e', position: 'sticky', top: 0, zIndex: 30 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #7c6ff7, #a855f7)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M12 3.5c-2 4-5 6-8.5 7 3.5 1 6.5 3 8.5 7.5 2-4.5 5-6.5 8.5-7.5-3.5-1-6.5-3-8.5-7z"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: '#e8e6f0' }}>AI Studio</span>
            </div>
            <button className="hamburger" onClick={() => setSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#8a8699', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', transition: 'background 0.15s' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
