import { Strategy as LocalStrategy } from "passport-local";
import { StatusCodes } from "http-status-codes";
import { APIError } from "../error/index.js";
import { model } from "../model/index.js";
import { util } from "../util/index.js";

export const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  (req, email, password, done) => {
    if (typeof req.transaction === "undefined")
      return done(
        APIError.server(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "req.transaction undefined (passport.local)"
        )
      );

    const { User } = model;
    User.findOne({
      where: { email },
      limit: 1,
      plain: true,
      transaction: req.transaction,
    })
      .then((user) => {
        if (user === null)
          return done(
            APIError.passport(StatusCodes.NOT_FOUND, "User not found")
          );
        const { compare } = util.bcrypt;
        if (!compare(password, user.dataValues.password))
          return done(
            APIError.passport(StatusCodes.UNAUTHORIZED, "Invalid password")
          );

        return done(null, user);
      })
      .catch(done);
  }
);
