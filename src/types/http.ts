import type { Transaction } from "sequelize";
import type { Tables } from "./db.js";

export type ResponseBody = Record<any, any> | Record<any, any>[];

export type ResponseLocals = {
  transaction: Transaction;
  folder?: Tables["Folder"];
  file?: Tables["File"];
};

export type ResponseSuccess = {
  success: true;
  data?: ResponseBody;
};

export type ResponseFailed = {
  success: false;
  message?: string;
};
