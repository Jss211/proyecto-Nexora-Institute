import { Response } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import { parseWithSchema } from '../../utils/validate';
import {
  createEnrollmentSchema,
  updateEnrollmentStatusSchema,
} from './enrollments.schema';
import {
  createEnrollment,
  listEnrollments,
  updateEnrollmentStatus,
} from './enrollments.service';

export async function listEnrollmentsController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const sectionId =
    typeof req.query.sectionId === 'string' ? req.query.sectionId : undefined;
  const data = await listEnrollments(sectionId);
  res.json({ ok: true, data });
}

export async function createEnrollmentController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const input = parseWithSchema(createEnrollmentSchema, req.body);
  const data = await createEnrollment(input);
  res.status(201).json({ ok: true, data });
}

export async function updateEnrollmentStatusController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const input = parseWithSchema(updateEnrollmentStatusSchema, req.body);
  const data = await updateEnrollmentStatus(
    String(req.params.id),
    input.status,
  );
  res.json({ ok: true, data });
}
