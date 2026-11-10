import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  expectedRole: z.nativeEnum(UserRole).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
