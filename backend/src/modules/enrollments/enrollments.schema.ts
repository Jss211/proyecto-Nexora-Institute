import { EnrollmentStatus } from '@prisma/client';
import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid('Estudiante inválido'),
  sectionId: z.string().uuid('Sección inválida'),
});

export const updateEnrollmentStatusSchema = z.object({
  status: z.nativeEnum(EnrollmentStatus),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentStatusInput = z.infer<
  typeof updateEnrollmentStatusSchema
>;
