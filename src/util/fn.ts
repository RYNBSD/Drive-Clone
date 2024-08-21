import type { NextFunction, Request, RequestHandler, Response } from "express";

type HandleAsyncFn =
  | ((req: Request, res: Response<any, any>, next: NextFunction) => Promise<void>)
  | RequestHandler;

export function handleAsync(fn: HandleAsyncFn) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await sequelize.transaction();
      res.locals.transaction = transaction;
      req.transaction = transaction
      try {
        await fn(req, res, next);
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        next(error);
      }
    } catch (error) {
      next(error);
    }
  };
}
