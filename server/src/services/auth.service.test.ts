import { AuthService } from '../services/auth.service';

// Mock DB to keep tests pure (no real DB connection needed)
jest.mock('../db/connection', () => ({
  query: jest.fn(),
}));

import { query } from '../db/connection';
const mockQuery = query as jest.Mock;

describe('AuthService', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-chars-long';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-that-is-at-least-32-chars';
  });

  // ─── Password ───────────────────────────────────────────
  describe('hashPassword / comparePassword', () => {
    it('should hash a password and verify it correctly', async () => {
      const password = 'MyPassword123';
      const hash = await AuthService.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2a\$/);

      const isValid = await AuthService.comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const hash = await AuthService.hashPassword('CorrectPassword1');
      const isValid = await AuthService.comparePassword('WrongPassword1', hash);
      expect(isValid).toBe(false);
    });
  });

  // ─── JWT ────────────────────────────────────────────────
  describe('generateAccessToken / verifyAccessToken', () => {
    it('should generate and verify a valid JWT', () => {
      const payload = { userId: 'uuid-123', email: 'test@test.com' };
      const token = AuthService.generateAccessToken(payload);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = AuthService.verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw on invalid token', () => {
      expect(() => AuthService.verifyAccessToken('invalid.token.here')).toThrow();
    });
  });

  // ─── Email existence ────────────────────────────────────
  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }] });
      const exists = await AuthService.emailExists('test@test.com');
      expect(exists).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] });
      const exists = await AuthService.emailExists('new@test.com');
      expect(exists).toBe(false);
    });
  });

  // ─── Create user ────────────────────────────────────────
  describe('createUser', () => {
    it('should create user and return without password_hash', async () => {
      const mockUser = {
        id: 'uuid-456',
        email: 'lautaro@test.com',
        name: 'Lautaro',
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const user = await AuthService.createUser('Lautaro@Test.com', 'Pass123!', 'Lautaro');

      expect(user.email).toBe('lautaro@test.com'); // normalized
      expect(user).not.toHaveProperty('password_hash');

      // Check that password was hashed before insert
      const callArgs = mockQuery.mock.calls[0];
      const hashedPwd = callArgs[1][1];
      expect(hashedPwd).toMatch(/^\$2a\$/);
    });
  });

  // ─── Refresh token ──────────────────────────────────────
  describe('generateRefreshToken', () => {
    it('should generate a unique hex token', () => {
      const t1 = AuthService.generateRefreshToken();
      const t2 = AuthService.generateRefreshToken();
      expect(t1).toHaveLength(128);
      expect(t1).not.toBe(t2);
    });
  });
});
