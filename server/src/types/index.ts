// ─── User ───────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

// ─── Auth ────────────────────────────────────────────────
export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// ─── Express extensions ──────────────────────────────────
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── API Response ────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ─── Generation ──────────────────────────────────────────
export interface Generation {
  id: string;
  user_id: string;
  template_id: string;
  input_params: Record<string, unknown>;
  output_text: string;
  tokens_used: number;
  is_favorite: boolean;
  created_at: Date;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  prompt_template: string;
  fields: TemplateField[];
  is_active: boolean;
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'boolean';
  placeholder?: string;
  options?: string[];
  required: boolean;
}
