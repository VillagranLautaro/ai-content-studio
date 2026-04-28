import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${err.name}: ${err.message}`);

  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    res.status(400).json({
      success: false,
      error: `Datos inválidos: ${messages}`,
    } satisfies ApiResponse);
    return;
  }

  // PostgreSQL unique constraint
  if ((err as NodeJS.ErrnoException).code === '23505') {
    res.status(409).json({
      success: false,
      error: 'El recurso ya existe',
    } satisfies ApiResponse);
    return;
  }

  // Default 500
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Error interno del servidor',
  } satisfies ApiResponse);
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  } satisfies ApiResponse);
}
