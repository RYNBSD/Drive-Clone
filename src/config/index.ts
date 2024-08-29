import { upload } from "./upload.js";
import * as options from "./options.js";
import swagger from "./swagger.js";

export const config = {
  upload,
  options,
  swagger,
} as const;
