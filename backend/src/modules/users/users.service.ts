import { Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/errorHandler';
import type { CreateUserInput } from './users.schema';

const userPublicSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  documentNumber: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  studentProfile: {
    select: {
      id: true,
      studentCode: true,
      currentCycle: true,
      program: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      enrollments: {
        select: {
          id: true,
          status: true,
          section: {
            select: {
              code: true,
              schedule: true,
              course: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
          grades: {
            select: {
              id: true,
              title: true,
              score: true,
              weight: true,
            },
          },
        },
      },
    },
  },
  teacherProfile: {
    select: {
      id: true,
      teacherCode: true,
      specialty: true,
    },
  },
} satisfies Prisma.UserSelect;

export interface ListUsersFilters {
  readonly role?: UserRole;
  readonly programId?: string;
  readonly search?: string;
}

/**
 * Lists institute users with optional role, program, and text filtering, excluding password hashes.
 */
export async function listUsers(filters: ListUsersFilters) {
  const trimmedSearch = filters.search?.trim();

  return prisma.user.findMany({
    where: {
      ...(filters.role ? { role: filters.role } : {}),
      ...(filters.programId
        ? { studentProfile: { is: { programId: filters.programId } } }
        : {}),
      ...(trimmedSearch
        ? {
            OR: [
              { firstName: { contains: trimmedSearch, mode: 'insensitive' } },
              { lastName: { contains: trimmedSearch, mode: 'insensitive' } },
              { email: { contains: trimmedSearch, mode: 'insensitive' } },
              {
                documentNumber: {
                  contains: trimmedSearch,
                  mode: 'insensitive',
                },
              },
              {
                studentProfile: {
                  is: {
                    studentCode: {
                      contains: trimmedSearch,
                      mode: 'insensitive',
                    },
                  },
                },
              },
              {
                studentProfile: {
                  is: {
                    program: {
                      name: {
                        contains: trimmedSearch,
                        mode: 'insensitive',
                      },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },
    select: userPublicSelect,
    orderBy: [{ createdAt: 'desc' }],
  });
}

function generateProfileCode(prefix: string): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${suffix}`;
}

/**
 * Creates a user account and its corresponding StudentProfile or TeacherProfile atomically.
 */
export async function createUser(input: CreateUserInput) {
  const passwordHash = await bcrypt.hash(input.password, 10);
  const normalizedEmail = input.email.toLowerCase();

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        documentNumber: input.documentNumber || null,
        phone: input.phone || null,
        role: input.role,
      },
    });

    if (input.role === UserRole.STUDENT && input.programId) {
      await tx.studentProfile.create({
        data: {
          userId: user.id,
          studentCode: generateProfileCode('NX'),
          programId: input.programId,
          currentCycle: input.currentCycle ?? 1,
        },
      });
    }

    if (input.role === UserRole.TEACHER && input.specialty) {
      await tx.teacherProfile.create({
        data: {
          userId: user.id,
          teacherCode: generateProfileCode('DOC'),
          specialty: input.specialty,
        },
      });
    }

    return tx.user.findUniqueOrThrow({
      where: { id: user.id },
      select: userPublicSelect,
    });
  });
}

/**
 * Enables or disables a user account while preventing an administrator from self-disabling.
 */
export async function updateUserStatus(
  targetUserId: string,
  isActive: boolean,
  actorUserId: string,
) {
  if (targetUserId === actorUserId && !isActive) {
    throw new AppError('No puedes desactivar tu propia cuenta de administrador', 400);
  }

  return prisma.user.update({
    where: { id: targetUserId },
    data: { isActive },
    select: userPublicSelect,
  });
}
