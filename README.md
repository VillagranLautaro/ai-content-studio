# AI Content Studio

Plataforma fullstack para generar contenido con IA. Stack: React 18 + TypeScript + Node.js + Express + PostgreSQL + Groq AI.

## Setup local

### 1. Base de datos
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd server
cp .env.example .env
# Editá .env con tu GROQ_API_KEY y JWT secrets
npm install
npm run migrate
npm run dev   # → http://localhost:3001
```

### 3. Frontend
```bash
cd client
npm install
npm run dev   # → http://localhost:5173
```

### 4. Tests
```bash
cd server
npm test
npm test -- --coverage
```

---

## Deploy

### Backend → Railway
1. Crear proyecto en railway.app
2. Agregar servicio PostgreSQL
3. Conectar repo → carpeta `server/`
4. Variables de entorno:
   - `DATABASE_URL` (Railway lo genera automático)
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `GROQ_API_KEY`
   - `CLIENT_URL` → URL de Vercel
   - `NODE_ENV=production`

### Frontend → Vercel
1. Importar repo en vercel.com
2. Root directory → `client/`
3. Variables de entorno:
   - `VITE_API_URL` → URL de Railway (sin `/` al final)

---

## API Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Registro |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/refresh | No | Renovar token |
| POST | /api/auth/logout | JWT | Logout |
| GET | /api/auth/me | JWT | Usuario actual |
| GET | /api/generate/templates | JWT | Lista templates |
| POST | /api/generate | JWT | Generar (SSE stream) |
| GET | /api/history | JWT | Historial paginado |
| PATCH | /api/history/:id/favorite | JWT | Toggle favorito |
| DELETE | /api/history/:id | JWT | Eliminar generación |
| GET | /health | No | Health check |

---

## Sesiones de desarrollo

### Sesión 1 — Fase 1: Setup & Auth
- Monorepo, Docker, PostgreSQL, migraciones, AuthService, endpoints auth, 8 tests

### Sesión 2 — Fase 2: Frontend + Editor IA
- React 18 + Vite + TypeScript + Tailwind, AuthContext, Login/Register/Dashboard
- Editor IA con streaming SSE, useGenerate hook, AppLayout con sidebar

### Sesión 3 — Fase 3: Historial
- HistoryPage con paginación, favoritos, panel de detalle, filtros

### Sesión 4 — Fase 4: Testing + Landing + Deploy
- 20 tests (unitarios + integración), LandingPage, deploy Railway + Vercel
- Migración de Gemini → Groq AI (llama-3.3-70b-versatile)
- **Próximo paso:** subir a GitHub y hacer deploy
