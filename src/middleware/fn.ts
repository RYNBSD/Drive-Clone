import type { NextFunction, Request, Response } from "express";
import { authenticate } from "../passport/fn.js";
import { APIError } from "../error/index.js";
import { StatusCodes } from "http-status-codes";

export async function isAuthenticated(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) return next();
  throw APIError.middleware(StatusCodes.UNAUTHORIZED, "Unauthorized");
}

export async function isUnauthenticated(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (req.isUnauthenticated()) return next();
  throw APIError.middleware(StatusCodes.FORBIDDEN, "Already authenticated");
}

export async function checkJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) return next();

  const authorization = req.headers.authorization ?? "";
  if (authorization.length === 0) return next();

  const token = authorization.split(" ")?.[1] ?? "";
  if (token.length === 0) return next();

  await authenticate("bearer", req, res, next);
  return next();
}
