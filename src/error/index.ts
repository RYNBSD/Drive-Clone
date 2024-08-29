import { ZodError } from "zod";
import { MulterError } from "multer";
import { getReasonPhrase, StatusCodes, ReasonPhrases } from "http-status-codes";
import { KEYS } from "../constant/index.js";

export class BaseError extends Error {
  public readonly isOperational: boolean;
  public readonly handler: HandlerTypes;
  public readonly statusText: ReasonPhrases;
  public readonly statusCode: StatusCodes;
  public readonly rollback: Rollback;

  constructor(
    statusCode: StatusCodes,
    message: string,
    handler: HandlerTypes,
    isOperational: boolean,
    rollback: Rollback
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusText = getReasonPhrase(this.statusCode) as ReasonPhrases;
    this.handler = handler;
    this.isOperational = isOperational;
    this.rollback = rollback;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }

  public static async handleError(error: unknown) {
    if (global.isDevelopment) console.error(error);

    type NewErrorType = {
      message: string;
      stack: string;
      statusCode: StatusCodes;
      isOperational: boolean;
      handler: HandlerTypes;
      rollback: Rollback;
    };

    const err = BaseError.isError(error) ? error : new Error(`${error}`);

    const newError: NewErrorType = {
      message: err.message,
      stack: (err.stack ?? "").replaceAll("\n", "<br/>"),
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      isOperational: false,
      handler: "server",
      rollback: null,
    };
    if (BaseError.isBaseError(err)) {
      newError.statusCode = err.statusCode;
      newError.handler = err.handler;
      newError.isOperational = err.isOperational;
      newError.rollback = err.rollback;
    }

    try {
    } catch (error) {
      if (global.isDevelopment) console.error(error);
      process.exit(1);
    }
  }

  public static checkOperational(error: Error): boolean {
    return BaseError.isBaseError(error) ? error.isOperational : false;
  }

  public static isZodError(error: unknown): error is ZodError {
    return (
      BaseError.isError(error) &&
      (error instanceof ZodError || error.name === ZodError.name)
    );
  }

  public static isMulterError(error: unknown): error is MulterError {
    return (
      BaseError.isError(error) &&
      (error instanceof MulterError || error.name === MulterError.name)
    );
  }

  public static isBaseError(error: unknown): error is BaseError {
    return (
      BaseError.isError(error) &&
      (error instanceof BaseError || error.name === BaseError.name)
    );
  }

  public static isError(error: unknown): error is Error {
    return (
      error instanceof Error ||
      (typeof error !== "undefined" &&
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        typeof error.name === "string" &&
        "message" in error &&
        typeof error.message === "string")
    );
  }
}

export class APIError {
  static controller(
    statusCode: StatusCodes,
    message: string = "",
    rollback: Rollback = null
  ) {
    return new BaseError(statusCode, message, "controller", true, rollback);
  }

  static middleware(
    statusCode: StatusCodes,
    message: string = "",
    rollback: Rollback = null
  ) {
    return new BaseError(statusCode, message, "middleware", true, rollback);
  }

  static socket(
    statusCode: StatusCodes,
    message: string = "",
    rollback: Rollback = null
  ) {
    return new BaseError(statusCode, message, "socket", true, rollback);
  }

  static passport(
    statusCode: StatusCodes,
    message: string = "",
    rollback: Rollback = null
  ) {
    return new BaseError(statusCode, message, "passport", true, rollback);
  }

  static server(
    statusCode: StatusCodes,
    message: string = "",
    rollback: Rollback = null
  ) {
    return new BaseError(statusCode, message, "server", false, rollback);
  }
}

type HandlerTypes = (typeof KEYS.ERROR.HANDLERS)[number];

type Rollback = RollbackFields | null;

type RollbackFields = {
  files: string[];
};
