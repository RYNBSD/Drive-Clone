import passport from "passport";
import { model } from "../model/index.js";
import { localStrategy } from "./local.js";
import { bearerStrategy } from "./bearer.js";

passport.serializeUser((user, done) => done(null, user.dataValues.id));
passport.deserializeUser((id: number, done) => {
  if (!Number.isInteger(id)) return done(null, false);

  const { User } = model;
  User.findOne({
    where: { id },
    limit: 1,
    plain: true,
  })
    .then((user) => {
      if (user === null) return done(null, false);
      return done(null, user);
    })
    .catch(done);
});

passport.use(localStrategy);
passport.use(bearerStrategy);

export default passport;
