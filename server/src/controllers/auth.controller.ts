import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { AuthRequest, ApiResponse, User } from '../types';

// ─── Validation schemas ───────────────────────────────────
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// ─── Controllers ─────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const exists = await AuthService.emailExists(email);
    if (exists) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una cuenta con ese email',
      } satisfies ApiResponse);
      return;
    }

    const user = await AuthService.createUser(email, password, name);
    const tokens = await AuthService.generateTokenPair(user);

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        ...tokens,
      },
      message: '¡Cuenta creada exitosamente!',
    } satisfies ApiResponse);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await AuthService.findUserByEmail(email);

    // Constant-time check to prevent user enumeration
    const isValid = user
      ? await AuthService.comparePassword(password, user.password_hash)
      : await AuthService.comparePassword(password, '$2a$12$placeholder.hash.to.prevent.timing');

    if (!user || !isValid) {
      res.status(401).json({
        success: false,
        error: 'Email o contraseña incorrectos',
      } satisfies ApiResponse);
      return;
    }

    const tokens = await AuthService.generateTokenPair(user);

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        ...tokens,
      },
    } satisfies ApiResponse);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'Refresh token requerido' } satisfies ApiResponse);
      return;
    }

    const userId = await AuthService.validateRefreshToken(refreshToken);
    if (!userId) {
      res.status(401).json({ success: false, error: 'Refresh token inválido o expirado' } satisfies ApiResponse);
      return;
    }

    const user = await AuthService.findUserById(userId);
    if (!user) {
      res.status(401).json({ success: false, error: 'Usuario no encontrado' } satisfies ApiResponse);
      return;
    }

    // Rotate: delete old, issue new pair
    await AuthService.deleteRefreshToken(refreshToken);
    const tokens = await AuthService.generateTokenPair(user);

    res.json({ success: true, data: tokens } satisfies ApiResponse);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await AuthService.deleteRefreshToken(refreshToken);
    }
    res.json({ success: true, message: 'Sesión cerrada exitosamente' } satisfies ApiResponse);
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await AuthService.findUserById(req.user!.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' } satisfies ApiResponse);
      return;
    }
    res.json({ success: true, data: user } satisfies ApiResponse<User>);
  } catch (err) {
    next(err);
  }
}
