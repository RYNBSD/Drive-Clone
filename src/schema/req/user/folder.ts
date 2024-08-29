import { z } from "zod";
import file from "./file.js";

export default {
  Flags: {
    Body: z.object({
      isStarred: z.coerce.boolean().optional(),
      isPublic: z.coerce.boolean().optional(),
    }),
  },
  Create: {
    Body: z.object({
      name: z.string().trim(),
      folderId: z.coerce.number().optional(),
    }),
  },
  Update: {
    Body: z.object({
      name: z.string().trim(),
      isStarred: z.coerce.boolean().optional(),
      isPublic: z.coerce.boolean().optional(),
    }),
  },
  file,
} as const;
