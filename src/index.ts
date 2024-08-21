import process from "node:process";
import path from "node:path";
import http from "node:http";
import url from "node:url";
import * as db from "./config/db.js";
import { BaseError } from "./error/index.js";
import env from "./constant/env.js";
// import fs from "node:fs";

global.__filename = url.fileURLToPath(import.meta.url);
global.__dirname = path.dirname(global.__filename);

global.isProduction = env.NODE.ENV === "production";
global.isDevelopment = env.NODE.ENV === "development";
global.__root = process.cwd();

if (global.isDevelopment) await import("colors");

// if (global.isDevelopment)
//   fs.rmSync(path.join(global.__root, "upload"), {
//     force: true,
//     recursive: true,
//   });

await db.connect();
const { default: app } = await import("./app.js");
await db.sync();

process.on("unhandledRejection", (error) => {
  throw error;
});

process.on("uncaughtException", async (error) => {
  await Promise.all([BaseError.handleError(error), db.close()]);
  process.exit(1);
});

const server = http.createServer(async (req, res) => app(req, res));

server.listen(env.NODE.PORT, () => {
  if (global.isProduction) return;
  console.log(`Listening on port ${env.NODE.PORT}`.white.bgGreen);
});
