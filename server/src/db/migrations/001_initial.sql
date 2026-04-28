-- Migration 001: Initial schema
-- Run with: npm run migrate

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name         VARCHAR(100) NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─── Refresh tokens ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ─── Templates ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  category        VARCHAR(50) NOT NULL,
  prompt_template TEXT NOT NULL,
  fields          JSONB NOT NULL DEFAULT '[]',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Generations ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS generations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id  UUID REFERENCES templates(id) ON DELETE SET NULL,
  input_params JSONB NOT NULL DEFAULT '{}',
  output_text  TEXT NOT NULL,
  tokens_used  INTEGER NOT NULL DEFAULT 0,
  is_favorite  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created ON generations(created_at DESC);

-- ─── Auto-update updated_at trigger ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Seed: initial templates ─────────────────────────────
INSERT INTO templates (name, category, prompt_template, fields) VALUES
(
  'Post para LinkedIn',
  'social',
  'Escribí un post profesional para LinkedIn sobre el siguiente tema: {{topic}}. El tono debe ser {{tone}}. La longitud debe ser {{length}}.{{#if cta}} Incluí un llamado a la acción al final.{{/if}} Escribí en español, de forma natural y sin sonar corporativo.',
  '[
    {"key": "topic", "label": "Tema del post", "type": "textarea", "placeholder": "Ej: Mis aprendizajes trabajando en startups", "required": true},
    {"key": "tone", "label": "Tono", "type": "select", "options": ["profesional", "cercano y personal", "inspirador", "educativo"], "required": true},
    {"key": "length", "label": "Longitud", "type": "select", "options": ["corto (150 palabras)", "medio (300 palabras)", "largo (500 palabras)"], "required": true},
    {"key": "cta", "label": "Incluir llamado a la acción", "type": "boolean", "required": false}
  ]'
),
(
  'Artículo de blog',
  'blog',
  'Escribí un artículo de blog completo sobre: {{title}}. La audiencia objetivo es: {{audience}}. Los puntos clave que debe cubrir son: {{key_points}}. La longitud debe ser {{length}}. Incluí una introducción atrapante, desarrollo con subtítulos y conclusión. Escribí en español.',
  '[
    {"key": "title", "label": "Título del artículo", "type": "text", "placeholder": "Ej: Cómo aprender a programar en 2025", "required": true},
    {"key": "audience", "label": "Audiencia objetivo", "type": "text", "placeholder": "Ej: Desarrolladores junior sin experiencia", "required": true},
    {"key": "key_points", "label": "Puntos clave a cubrir", "type": "textarea", "placeholder": "Un punto por línea", "required": true},
    {"key": "length", "label": "Longitud", "type": "select", "options": ["corto (500 palabras)", "medio (1000 palabras)", "largo (1500+ palabras)"], "required": true}
  ]'
),
(
  'Descripción de producto',
  'ecommerce',
  'Escribí una descripción de producto persuasiva para: {{product_name}}. Características principales: {{features}}. Público objetivo: {{audience}}. Precio aproximado: {{price}}. La descripción debe destacar los beneficios, no solo las características. Escribí en español.',
  '[
    {"key": "product_name", "label": "Nombre del producto", "type": "text", "placeholder": "Ej: Auriculares Bluetooth ProSound X1", "required": true},
    {"key": "features", "label": "Características principales", "type": "textarea", "placeholder": "Listá las características más importantes", "required": true},
    {"key": "audience", "label": "Público objetivo", "type": "text", "placeholder": "Ej: Músicos y gamers jóvenes", "required": true},
    {"key": "price", "label": "Precio aproximado", "type": "text", "placeholder": "Ej: $150 USD", "required": false}
  ]'
)
ON CONFLICT DO NOTHING;
