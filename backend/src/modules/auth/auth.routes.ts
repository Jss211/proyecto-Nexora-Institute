import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { loginController, meController } from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', asyncHandler(loginController));
authRouter.get('/me', authenticate, asyncHandler(meController));
