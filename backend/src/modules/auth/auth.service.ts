import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errorHandler';
import type { AuthenticatedUser, JwtPayload } from '../../types/auth.types';
import type { LoginInput } from './auth.schema';

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  TEACHER: 'Docente',
  STUDENT: 'Estudiante',
};

export interface LoginResult {
  readonly token: string;
  readonly user: AuthenticatedUser;
}

/**
 * Authenticates an institute user and issues a signed JWT carrying their verified role.
 */
export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new AppError('Correo o contraseña incorrectos', 401);
  }

  if (!user.isActive) {
    throw new AppError('Tu cuenta se encuentra desactivada. Contacta al administrador', 403);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError('Correo o contraseña incorrectos', 401);
  }

  if (input.expectedRole && user.role !== input.expectedRole) {
    throw new AppError(
      `Esta cuenta pertenece al perfil ${ROLE_LABELS[user.role]}. Selecciona la tarjeta correspondiente.`,
      403,
    );
  }

  const payload: JwtPayload = {
    sub: user.id,
    role: user.role,
  };

  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '12h' });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    },
  };
}
