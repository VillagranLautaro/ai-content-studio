import { Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest, ApiResponse } from '../types';

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Token de acceso requerido',
    } satisfies ApiResponse);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = AuthService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Token inválido o expirado',
    } satisfies ApiResponse);
  }
}
