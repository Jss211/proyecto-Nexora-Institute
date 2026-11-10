import { Router } from 'express';
import {
  authenticate,
  authorizeRoles,
} from '../../middlewares/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createUserController,
  listUsersController,
  updateUserStatusController,
} from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate, authorizeRoles('ADMIN'));

usersRouter.get('/', asyncHandler(listUsersController));
usersRouter.post('/', asyncHandler(createUserController));
usersRouter.patch('/:id/status', asyncHandler(updateUserStatusController));
