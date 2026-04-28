import request from 'supertest'
import app from '../index'
import { query } from '../db/connection'

// Mock DB completely so tests don't need a real PostgreSQL
jest.mock('../db/connection', () => ({
  query: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
}))

const mockQuery = query as jest.Mock

// Helper: build a valid register/login body
const validUser = {
  email: 'lautaro@test.com',
  password: 'Password123',
  name: 'Lautaro',
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long'
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-at-least-32-characters'
})

// ─── POST /api/auth/register ─────────────────────────────
describe('POST /api/auth/register', () => {
  it('should register a new user and return tokens', async () => {
    // emailExists → 0
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] })
    // createUser → user row
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'uuid-123',
        email: 'lautaro@test.com',
        name: 'Lautaro',
        created_at: new Date(),
        updated_at: new Date(),
      }]
    })
    // saveRefreshToken → void
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('accessToken')
    expect(res.body.data).toHaveProperty('refreshToken')
    expect(res.body.data.user.email).toBe('lautaro@test.com')
  })

  it('should reject duplicate email', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }] })

    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser)

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('should reject weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: '1234' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

// ─── POST /api/auth/login ────────────────────────────────
describe('POST /api/auth/login', () => {
  it('should login with correct credentials', async () => {
    const bcrypt = require('bcryptjs')
    const hash = await bcrypt.hash('Password123', 12)

    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'uuid-123',
        email: 'lautaro@test.com',
        name: 'Lautaro',
        password_hash: hash,
        created_at: new Date(),
        updated_at: new Date(),
      }]
    })
    mockQuery.mockResolvedValueOnce({ rows: [] }) // saveRefreshToken

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'lautaro@test.com', password: 'Password123' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('accessToken')
  })

  it('should reject wrong password', async () => {
    const bcrypt = require('bcryptjs')
    const hash = await bcrypt.hash('CorrectPassword1', 12)

    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'uuid-123',
        email: 'lautaro@test.com',
        name: 'Lautaro',
        password_hash: hash,
        created_at: new Date(),
        updated_at: new Date(),
      }]
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'lautaro@test.com', password: 'WrongPassword1' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('should reject non-existent user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: 'Password123' })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

// ─── GET /api/auth/me ────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('should return user data with valid token', async () => {
    const { AuthService } = require('../services/auth.service')
    const token = AuthService.generateAccessToken({ userId: 'uuid-123', email: 'lautaro@test.com' })

    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'uuid-123',
        email: 'lautaro@test.com',
        name: 'Lautaro',
        created_at: new Date(),
        updated_at: new Date(),
      }]
    })

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.email).toBe('lautaro@test.com')
  })

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
    expect(res.status).toBe(401)
  })
})

// ─── GET /health ─────────────────────────────────────────
describe('GET /health', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})
