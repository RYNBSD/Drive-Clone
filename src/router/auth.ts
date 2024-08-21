import { Router } from "express";
import { util } from "../util/index.js";
import { middleware } from "../middleware/index.js";
import { controller } from "../controller/index.js";
import { config } from "../config/index.js";

export const auth = Router();

const { upload } = config;
const { handleAsync } = util.fn;
const { isAuthenticated, isUnauthenticated, checkJWT } = middleware.fn;
const { signUp, signIn, signOut, me } = controller.auth;

auth.post(
  "/sign-up",
  handleAsync(isUnauthenticated),
  handleAsync(upload.single("image")),
  handleAsync(signUp)
);

auth.post(
  "/sign-in",
  handleAsync(isUnauthenticated),
  handleAsync(upload.none()),
  handleAsync(signIn)
);

auth.post(
  "/sign-out",
  handleAsync(checkJWT),
  handleAsync(isAuthenticated),
  handleAsync(signOut)
);

auth.post(
  "/me",
  handleAsync(checkJWT),
  handleAsync(isAuthenticated),
  handleAsync(me)
);
