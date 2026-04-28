// ─── Auth ────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ─── API ─────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name: string
}

// ─── Templates ───────────────────────────────────────────
export interface TemplateField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'boolean'
  placeholder?: string
  options?: string[]
  required: boolean
}

export interface Template {
  id: string
  name: string
  category: string
  prompt_template: string
  fields: TemplateField[]
  is_active: boolean
}

// ─── Generations ─────────────────────────────────────────
export interface Generation {
  id: string
  user_id: string
  template_id: string
  template_name?: string
  input_params: Record<string, unknown>
  output_text: string
  tokens_used: number
  is_favorite: boolean
  created_at: string
}

// ─── UI ──────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
}
