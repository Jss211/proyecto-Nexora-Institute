import type { UserRole } from '@prisma/client';

export type { UserRole };

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly isActive: boolean;
}

export interface JwtPayload {
  readonly sub: string;
  readonly role: UserRole;
}
