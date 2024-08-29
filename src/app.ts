import type { ResponseFailed, ResponseLocals } from "./types/index.js";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import responseTime from "response-time";
import timeout from "connect-timeout";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import useragent from "express-useragent";
import session from "express-session";
import requestIp from "request-ip";
import { StatusCodes } from "http-status-codes";
import passport from "./passport/index.js";
import { router } from "./router/index.js";
import { BaseError } from "./error/index.js";
import { config } from "./config/index.js";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.enable("view cache");
app.enable("json escape");
app.enable("etag");

/* Entry */
app.use(timeout(6000 * 5)); // 5 minute
app.use(responseTime());
app.use(rateLimit({ windowMs: 6000, limit: 100 }));
app.use(cors({ credentials: true }));
app.use(useragent.express());

//! Block Bots
app.use((req, res, next) => {
  if (typeof req.useragent === "undefined" || !req.useragent.isBot)
    return next();
  res.status(StatusCodes.NOT_ACCEPTABLE).json({
    success: false,
    message: "Bot are not allowed",
  });
});

const { swagger } = config;

/* Config */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());
app.use(hpp());
app.use(cookieParser());
app.use(morgan(global.isProduction ? "combined" : "dev"));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: global.isProduction,
      httpOnly: global.isProduction,
      sameSite: global.isProduction,
      maxAge: 6000 * 15, // 15 minutes,
      path: "/",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(requestIp.mw());

app.use("/", router);

const docs = swagger.init();
app.use("/docs", docs.serve, docs.ui);

app.all("*", async (_req, res) =>
  res.status(StatusCodes.NOT_FOUND).json({ success: false })
);

app.use(
  async (
    error: unknown,
    _req: Request,
    res: Response<ResponseFailed, ResponseLocals>,
    _next: NextFunction
  ) => {
    let status = StatusCodes.BAD_REQUEST;
    let message = "";

    if (BaseError.isError(error)) {
      if (BaseError.isBaseError(error)) {
        status = error.isOperational
          ? error.statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;
        message = error.isOperational ? error.message : "Server error";
      } else if (BaseError.isMulterError(error)) {
        status = StatusCodes.UNSUPPORTED_MEDIA_TYPE;
        message = error.message;
      } else if (BaseError.isZodError(error)) {
        message = error.flatten().formErrors.join("\n");
      } else {
        status = StatusCodes.INTERNAL_SERVER_ERROR;
        message = "Server error";
      }
    } else {
      status = StatusCodes.INTERNAL_SERVER_ERROR;
      message = "Server Error";
    }

    await BaseError.handleError(error);
    res.status(status).json({ success: false, message });
  }
);

export default app;
