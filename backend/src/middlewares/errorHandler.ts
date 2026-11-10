import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * Central Express error handler returning uniform JSON error payloads.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        ok: false,
        message: 'Ya existe un registro con ese código o correo único',
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        ok: false,
        message: 'El registro solicitado no fue encontrado',
      });
      return;
    }
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : 'Error interno del servidor';

  if (statusCode >= 500) {
    console.error('[Error]', err);
  }

  res.status(statusCode).json({
    ok: false,
    message,
  });
}
