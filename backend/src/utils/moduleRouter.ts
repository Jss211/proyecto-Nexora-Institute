import { Request, Response, Router } from 'express';

/**
 * Creates a lightweight placeholder router for modules awaiting full implementation.
 */
export function createModulePlaceholderRouter(moduleName: string): Router {
  const router = Router();

  router.get('/status', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      module: moduleName,
      status: 'pending_implementation',
    });
  });

  return router;
}
