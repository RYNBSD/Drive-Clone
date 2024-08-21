import { z } from "zod";
import file from "./file.js";

export default {
  Create: {
    Body: z.object({
      name: z.string().trim(),
      folderId: z.coerce.number().optional(),
    }),
  },
  Update: {
    Body: z.object({
      name: z.string().trim(),
      isStared: z.coerce.boolean().optional(),
      isPublic: z.coerce.boolean().optional(),
    }),
  },
  file,
} as const;
