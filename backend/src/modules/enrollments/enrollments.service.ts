import { EnrollmentStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errorHandler';
import type { CreateEnrollmentInput } from './enrollments.schema';

const enrollmentInclude = {
  student: {
    select: {
      id: true,
      studentCode: true,
      currentCycle: true,
      user: { select: { firstName: true, lastName: true, email: true } },
      program: { select: { code: true, name: true } },
    },
  },
  section: {
    select: {
      id: true,
      code: true,
      schedule: true,
      classroom: true,
      course: { select: { code: true, name: true } },
      period: { select: { code: true, name: true } },
    },
  },
} as const;

export async function listEnrollments(sectionId?: string) {
  return prisma.enrollment.findMany({
    where: sectionId ? { sectionId } : undefined,
    include: enrollmentInclude,
    orderBy: { enrolledAt: 'desc' },
  });
}

/**
 * Enrolls a student into a section after validating capacity and duplicate constraints.
 */
export async function createEnrollment(input: CreateEnrollmentInput) {
  const [student, section] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { id: input.studentId } }),
    prisma.section.findUnique({
      where: { id: input.sectionId },
      include: {
        _count: {
          select: { enrollments: { where: { status: EnrollmentStatus.ACTIVE } } },
        },
      },
    }),
  ]);

  if (!student) {
    throw new AppError('El perfil de estudiante no existe', 404);
  }
  if (!section) {
    throw new AppError('La sección académica no existe', 404);
  }
  if (section._count.enrollments >= section.capacity) {
    throw new AppError('La sección ya alcanzó su capacidad máxima de cupos', 400);
  }

  return prisma.enrollment.create({
    data: {
      studentId: input.studentId,
      sectionId: input.sectionId,
    },
    include: enrollmentInclude,
  });
}

export async function updateEnrollmentStatus(
  id: string,
  status: EnrollmentStatus,
) {
  return prisma.enrollment.update({
    where: { id },
    data: { status },
    include: enrollmentInclude,
  });
}
