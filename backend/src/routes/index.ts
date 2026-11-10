import { Request, Response, Router } from 'express';
import { prisma } from '../config/prisma';
import { academicRouter } from '../modules/academic/academic.routes';
import { attendanceRouter } from '../modules/attendance/attendance.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { enrollmentsRouter } from '../modules/enrollments/enrollments.routes';
import { gradesRouter } from '../modules/grades/grades.routes';
import { usersRouter } from '../modules/users/users.routes';

export const apiRouter = Router();

apiRouter.get('/health', async (_req: Request, res: Response) => {
  let database: 'connected' | 'disconnected' = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'connected';
  } catch {
    database = 'disconnected';
  }

  res.json({
    ok: true,
    service: 'nexora-institute-api',
    database,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/academic', academicRouter);
apiRouter.use('/enrollments', enrollmentsRouter);
apiRouter.use('/grades', gradesRouter);
apiRouter.use('/attendance', attendanceRouter);
