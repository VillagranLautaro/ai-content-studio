import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db/connection';
import { User, UserWithPassword, AuthTokens, JwtPayload } from '../types';

const SALT_ROUNDS = 12;

export class AuthService {

  // ─── Password ─────────────────────────────────────────
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // ─── JWT ──────────────────────────────────────────────
  static generateAccessToken(payload: JwtPayload): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    return jwt.sign(payload, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']) || '15m',
    });
  }

  static generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  static verifyAccessToken(token: string): JwtPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    return jwt.verify(token, secret) as JwtPayload;
  }

  // ─── Tokens DB ────────────────────────────────────────
  static async saveRefreshToken(userId: string, token: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  }

  static async validateRefreshToken(token: string): Promise<string | null> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await query<{ user_id: string }>(
      `SELECT user_id FROM refresh_tokens
       WHERE token_hash = $1 AND expires_at > NOW()`,
      [tokenHash]
    );

    return result.rows[0]?.user_id ?? null;
  }

  static async deleteRefreshToken(token: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [tokenHash]);
  }

  // ─── Users ────────────────────────────────────────────
  static async findUserByEmail(email: string): Promise<UserWithPassword | null> {
    const result = await query<UserWithPassword>(
      `SELECT id, email, password_hash, name, created_at, updated_at
       FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return result.rows[0] ?? null;
  }

  static async findUserById(id: string): Promise<User | null> {
    const result = await query<User>(
      `SELECT id, email, name, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  static async createUser(email: string, password: string, name: string): Promise<User> {
    const passwordHash = await this.hashPassword(password);

    const result = await query<User>(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at, updated_at`,
      [email.toLowerCase().trim(), passwordHash, name.trim()]
    );

    return result.rows[0];
  }

  static async emailExists(email: string): Promise<boolean> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return parseInt(result.rows[0].count) > 0;
  }

  // ─── Token pair ───────────────────────────────────────
  static async generateTokenPair(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = { userId: user.id, email: user.email };
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken();
    await this.saveRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }
}
