import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const createUserSchema = z
  .object({
    email: z.string().trim().email('Correo electrónico inválido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    firstName: z.string().trim().min(2, 'Nombre obligatorio'),
    lastName: z.string().trim().min(2, 'Apellido obligatorio'),
    documentNumber: z
      .string()
      .trim()
      .min(6, 'Documento inválido')
      .max(20)
      .optional()
      .or(z.literal('')),
    phone: z.string().trim().max(20).optional().or(z.literal('')),
    role: z.nativeEnum(UserRole),
    programId: z.string().uuid('Carrera inválida').optional(),
    currentCycle: z.coerce.number().int().min(1).max(12).optional(),
    specialty: z.string().trim().min(2).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === UserRole.STUDENT && !data.programId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['programId'],
        message: 'Debes seleccionar una carrera para el estudiante',
      });
    }
    if (data.role === UserRole.TEACHER && !data.specialty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['specialty'],
        message: 'Debes indicar la especialidad del docente',
      });
    }
  });

export const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;
