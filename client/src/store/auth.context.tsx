import { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react'
import type { AuthState, User, AuthTokens } from '@/types'
import { authApi } from '@/services/api'

// ─── Actions ─────────────────────────────────────────────
type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.tokens.accessToken,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // On mount: check if we have a valid session
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }

    authApi.me()
      .then(({ data }) => {
        if (data.data) dispatch({ type: 'SET_USER', payload: data.data })
        else dispatch({ type: 'LOGOUT' })
      })
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        dispatch({ type: 'LOGOUT' })
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password })
    if (!data.data) throw new Error(data.error || 'Error al iniciar sesión')

    const { user, accessToken, refreshToken } = data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens: { accessToken, refreshToken } } })
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { data } = await authApi.register({ email, password, name })
    if (!data.data) throw new Error(data.error || 'Error al registrarse')

    const { user, accessToken, refreshToken } = data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens: { accessToken, refreshToken } } })
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try { await authApi.logout(refreshToken) } catch { /* ignore */ }
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    dispatch({ type: 'LOGOUT' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
