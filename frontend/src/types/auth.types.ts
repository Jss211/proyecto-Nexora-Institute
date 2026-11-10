export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface RoleOption {
  readonly role: UserRole;
  readonly title: string;
  readonly description: string;
  readonly badgeLabel: string;
  readonly accentClass: string;
  readonly iconColorClass: string;
  readonly animationDelayMs: number;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
  readonly expectedRole: UserRole;
}

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: UserRole;
  readonly isActive: boolean;
}

export interface AuthSessionData {
  readonly token: string;
  readonly user: AuthenticatedUser;
}
