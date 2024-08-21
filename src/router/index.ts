import { Router } from "express";
import { auth } from "./auth.js";
import { user } from "./user/index.js";
import { util } from "../util/index.js";
import { middleware } from "../middleware/index.js";

export const router = Router();

const { handleAsync } = util.fn;
const { checkJWT, isAuthenticated } = middleware.fn;

router.use("/auth", auth);

router.use("/user", handleAsync(checkJWT), handleAsync(isAuthenticated), user);
