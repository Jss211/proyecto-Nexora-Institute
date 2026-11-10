import { Response } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import { parseWithSchema } from '../../utils/validate';
import { loginSchema } from './auth.schema';
import { loginUser } from './auth.service';

export async function loginController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const input = parseWithSchema(loginSchema, req.body);
  const data = await loginUser(input);

  res.json({
    ok: true,
    data,
  });
}

export async function meController(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  res.json({
    ok: true,
    data: {
      user: req.user,
    },
  });
}
