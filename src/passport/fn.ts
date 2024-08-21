import type { Request, Response, NextFunction } from "express";
import type { Strategy } from "passport";
import type { Tables } from "../types/db.js";
import { StatusCodes } from "http-status-codes";
import { APIError } from "../error/index.js";
import passport from "./index.js";

export async function authenticate(
  strategy: Strategy | string | string[],
  req: Request,
  res: Response,
  next: NextFunction
) {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      strategy,
      (
        err: unknown,
        user: Tables["User"] | null | false,
        info: { message: string }
      ) => {
        if (err) return reject(err);
        if (!user)
          return reject(
            APIError.passport(
              StatusCodes.BAD_REQUEST,
              info?.message ?? "Invalid info"
            )
          );

        req.logIn(user, (err) => {
          if (err) return reject(err);
          return resolve(user);
        });
      }
    )(req, res, next);
  });
}
