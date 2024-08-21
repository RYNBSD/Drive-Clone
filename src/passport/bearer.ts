import type { Request } from "express";
import {
  Strategy as BearerStrategy,
  type IVerifyOptions,
} from "passport-http-bearer";
import { StatusCodes } from "http-status-codes";
import { util } from "../util/index.js";
import { APIError } from "../error/index.js";
import { model } from "../model/index.js";

export const bearerStrategy = new BearerStrategy(
  { passReqToCallback: true },
  (
    req: Request,
    authorization: string,
    done: (error: any, user?: any, options?: IVerifyOptions | string) => void
  ) => {
    if (typeof req.transaction === "undefined")
      return done(
        APIError.server(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "req.transaction undefined (passport.bearer)"
        )
      );

    const { verify } = util.jwt;
    const token = verify(authorization) as { id?: number } | null;
    if (token === null || typeof token.id === "undefined")
      return done(APIError.passport(StatusCodes.UNAUTHORIZED, "Invalid token"));

    const { id } = token;
    const { User } = model;

    User.findOne({
      where: { id },
      limit: 1,
      plain: true,
      transaction: req.transaction,
    })
      .then((user) => {
        if (user === null)
          return done(
            APIError.passport(StatusCodes.NOT_FOUND, "User not found")
          );
        return done(null, user);
      })
      .catch(done);
  }
);
