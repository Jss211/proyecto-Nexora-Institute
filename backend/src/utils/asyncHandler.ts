import { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Wraps an async Express handler and forwards rejected promises to errorHandler.
 */
export function asyncHandler<TReq extends Request = Request>(
  handler: AsyncRouteHandler<TReq>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void Promise.resolve(handler(req as TReq, res, next)).catch(next);
  };
}
