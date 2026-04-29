import axios from 'axios'
import type { ApiResponse, LoginPayload, RegisterPayload, User, AuthTokens, Template, Generation } from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request interceptor: attach token ───────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response interceptor: handle 401 + refresh ──────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post<ApiResponse<AuthTokens>>('/api/auth/refresh', { refreshToken })
        if (data.data) {
          localStorage.setItem('accessToken', data.data.accessToken)
          localStorage.setItem('refreshToken', data.data.refreshToken)
          original.headers.Authorization = `Bearer ${data.data.accessToken}`
          return api(original)
        }
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// ─── Auth endpoints ──────────────────────────────────────
export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<ApiResponse<{ user: User } & AuthTokens>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<ApiResponse<{ user: User } & AuthTokens>>('/auth/login', payload),

  logout: (refreshToken: string) =>
    api.post<ApiResponse>('/auth/logout', { refreshToken }),

  me: () =>
    api.get<ApiResponse<User>>('/auth/me'),
}

// ─── Generate endpoints ──────────────────────────────────
export const generateApi = {
  getTemplates: () =>
    api.get<ApiResponse<Template[]>>('/generate/templates'),

  getTemplate: (id: string) =>
    api.get<ApiResponse<Template>>(`/generate/templates/${id}`),
}

// ─── History endpoints ───────────────────────────────────
export const historyApi = {
  getAll: (page = 1, limit = 10) =>
    api.get<ApiResponse<{ generations: Generation[]; total: number }>>(`/history?page=${page}&limit=${limit}`),

  getOne: (id: string) =>
    api.get<ApiResponse<Generation>>(`/history/${id}`),

  toggleFavorite: (id: string) =>
    api.patch<ApiResponse<Generation>>(`/history/${id}/favorite`),

  delete: (id: string) =>
    api.delete<ApiResponse>(`/history/${id}`),
}

export default api
