import { z } from "zod";
import folder from "./folder.js";
import file from "./file.js";

export default {
  Search: {
    Query: z.object({
      q: z.string().trim(),
    }),
  },
  Update: {
    Body: z.object({
      username: z.string().trim(),
    }),
  },
  folder,
  file,
} as const;
