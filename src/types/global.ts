import type { Sequelize, Transaction } from "sequelize";
import type { Tables } from "./db.js";

type RequestTransaction = { transaction: Transaction };
type PassportUser = Tables["User"];

declare global {
  var sequelize: Sequelize;
  var __root: string;
  var isProduction: boolean;
  var isDevelopment: boolean;

  namespace NodeJS {
    interface ProcessEnv {
      PORT: number | `${number}`;
      NODE_ENV: "development" | "production" | "test";
      POSTGRESQL_URI: string;
      MONGODB_URI: string;
      COOKIE_ENCRYPT: string;
      COOKIE_PARSER: string;
      JWT_SECRET: string;
      SESSION_SECRET: string;
    }
  }

  namespace Express {
    interface Request extends RequestTransaction {}
    interface User extends PassportUser {}
  }
}

export {};
