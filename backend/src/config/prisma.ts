import { PrismaClient } from '@prisma/client';

/**
 * Shared Prisma Client instance for database access across backend modules.
 */
export const prisma = new PrismaClient();
