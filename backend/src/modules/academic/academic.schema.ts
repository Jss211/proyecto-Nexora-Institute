import { z } from 'zod';

export const createProgramSchema = z.object({
  code: z.string().trim().min(2, 'Código obligatorio').max(12),
  name: z.string().trim().min(3, 'Nombre obligatorio').max(120),
  durationCycles: z.coerce.number().int().min(1).max(12).default(6),
});

export const toggleProgramStatusSchema = z.object({
  isActive: z.boolean(),
});

export const createPeriodSchema = z.object({
  code: z.string().trim().min(3, 'Código obligatorio').max(20),
  name: z.string().trim().min(3, 'Nombre obligatorio').max(100),
  startDate: z.string().min(8, 'Fecha de inicio obligatoria'),
  endDate: z.string().min(8, 'Fecha de fin obligatoria'),
  isCurrent: z.boolean().optional().default(false),
});

export const createCourseSchema = z.object({
  code: z.string().trim().min(2, 'Código obligatorio').max(20),
  name: z.string().trim().min(3, 'Nombre obligatorio').max(120),
  credits: z.coerce.number().int().min(1).max(10).default(4),
  cycleNumber: z.coerce.number().int().min(1).max(12).default(1),
  programId: z.string().uuid('Carrera inválida'),
});

export const createSectionSchema = z.object({
  code: z.string().trim().min(1, 'Código de sección obligatorio').max(10),
  courseId: z.string().uuid('Curso inválido'),
  periodId: z.string().uuid('Periodo inválido'),
  teacherId: z.string().uuid('Docente inválido'),
  schedule: z.string().trim().min(3, 'Horario obligatorio').max(120),
  classroom: z.string().trim().min(2, 'Aula obligatoria').max(60),
  capacity: z.coerce.number().int().min(1).max(200).default(30),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
