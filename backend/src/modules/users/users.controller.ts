import { UserRole } from '@prisma/client';
import { Response } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import { parseWithSchema } from '../../utils/validate';
import { createUserSchema, toggleUserStatusSchema } from './users.schema';
import { createUser, listUsers, updateUserStatus } from './users.service';

export async function listUsersController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const rawRole = typeof req.query.role === 'string' ? req.query.role : undefined;
  const role =
    rawRole && Object.values(UserRole).includes(rawRole as UserRole)
      ? (rawRole as UserRole)
      : undefined;
  const programId =
    typeof req.query.programId === 'string' && req.query.programId.trim()
      ? req.query.programId.trim()
      : undefined;
  const search =
    typeof req.query.search === 'string' ? req.query.search : undefined;

  const users = await listUsers({ role, programId, search });
  res.json({ ok: true, data: users });
}

export async function createUserController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const input = parseWithSchema(createUserSchema, req.body);
  const created = await createUser(input);
  res.status(201).json({ ok: true, data: created });
}

export async function updateUserStatusController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const input = parseWithSchema(toggleUserStatusSchema, req.body);
  const updated = await updateUserStatus(
    String(req.params.id),
    input.isActive,
    req.user!.id,
  );
  res.json({ ok: true, data: updated });
}
