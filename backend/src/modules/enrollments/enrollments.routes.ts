import { Router } from 'express';
import {
  authenticate,
  authorizeRoles,
} from '../../middlewares/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createEnrollmentController,
  listEnrollmentsController,
  updateEnrollmentStatusController,
} from './enrollments.controller';

export const enrollmentsRouter = Router();

enrollmentsRouter.use(authenticate, authorizeRoles('ADMIN'));

enrollmentsRouter.get('/', asyncHandler(listEnrollmentsController));
enrollmentsRouter.post('/', asyncHandler(createEnrollmentController));
enrollmentsRouter.patch(
  '/:id/status',
  asyncHandler(updateEnrollmentStatusController),
);
