import { Response } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import { parseWithSchema } from '../../utils/validate';
import {
  createCourseSchema,
  createPeriodSchema,
  createProgramSchema,
  createSectionSchema,
  toggleProgramStatusSchema,
} from './academic.schema';
import {
  createCourse,
  createPeriod,
  createProgram,
  createSection,
  getDashboardSummary,
  listCourses,
  listPeriods,
  listPrograms,
  listSections,
  setCurrentPeriod,
  updateProgramStatus,
} from './academic.service';

export async function dashboardSummaryController(
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const data = await getDashboardSummary();
  res.json({ ok: true, data });
}

export async function listProgramsController(
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const data = await listPrograms();
  res.json({ ok: true, data });
}

export async function createProgramController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const input = parseWithSchema(createProgramSchema, req.body);
  const data = await createProgram(input);
  res.status(201).json({ ok: true, data });
}

export async function updateProgramStatusController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const input = parseWithSchema(toggleProgramStatusSchema, req.body);
  const data = await updateProgramStatus(String(req.params.id), input.isActive);
  res.json({ ok: true, data });
}

export async function listPeriodsController(
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const data = await listPeriods();
  res.json({ ok: true, data });
}

export async function createPeriodController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const input = parseWithSchema(createPeriodSchema, req.body);
  const data = await createPeriod(input);
  res.status(201).json({ ok: true, data });
}

export async function setCurrentPeriodController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const data = await setCurrentPeriod(String(req.params.id));
  res.json({ ok: true, data });
}

export async function listCoursesController(
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const data = await listCourses();
  res.json({ ok: true, data });
}

export async function createCourseController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const input = parseWithSchema(createCourseSchema, req.body);
  const data = await createCourse(input);
  res.status(201).json({ ok: true, data });
}

export async function listSectionsController(
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const data = await listSections();
  res.json({ ok: true, data });
}

export async function createSectionController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const input = parseWithSchema(createSectionSchema, req.body);
  const data = await createSection(input);
  res.status(201).json({ ok: true, data });
}
