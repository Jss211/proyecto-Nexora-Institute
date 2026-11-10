import { Router } from 'express';
import {
  authenticate,
  authorizeRoles,
} from '../../middlewares/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createCourseController,
  createPeriodController,
  createProgramController,
  createSectionController,
  dashboardSummaryController,
  listCoursesController,
  listPeriodsController,
  listProgramsController,
  listSectionsController,
  setCurrentPeriodController,
  updateProgramStatusController,
} from './academic.controller';

export const academicRouter = Router();

academicRouter.use(authenticate, authorizeRoles('ADMIN'));

academicRouter.get('/dashboard-summary', asyncHandler(dashboardSummaryController));

academicRouter.get('/programs', asyncHandler(listProgramsController));
academicRouter.post('/programs', asyncHandler(createProgramController));
academicRouter.patch(
  '/programs/:id/status',
  asyncHandler(updateProgramStatusController),
);

academicRouter.get('/periods', asyncHandler(listPeriodsController));
academicRouter.post('/periods', asyncHandler(createPeriodController));
academicRouter.patch(
  '/periods/:id/current',
  asyncHandler(setCurrentPeriodController),
);

academicRouter.get('/courses', asyncHandler(listCoursesController));
academicRouter.post('/courses', asyncHandler(createCourseController));

academicRouter.get('/sections', asyncHandler(listSectionsController));
academicRouter.post('/sections', asyncHandler(createSectionController));
