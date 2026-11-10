import { BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';
import type { UserRole } from '../../../types/auth.types';

interface RoleIconProps {
  readonly role: UserRole;
  readonly className?: string;
}

const ROLE_ICON_MAP = {
  ADMIN: ShieldCheck,
  TEACHER: GraduationCap,
  STUDENT: BookOpen,
} as const;

/**
 * Renders the semantic icon associated with each institute role.
 */
export function RoleIcon({ role, className = 'h-5 w-5' }: RoleIconProps) {
  const IconComponent = ROLE_ICON_MAP[role];
  return <IconComponent className={className} aria-hidden="true" />;
}
