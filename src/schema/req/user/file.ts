import { z } from "zod";

export default {
  Flags: {
    Body: z.object({
      isStarred: z.coerce.boolean().optional(),
      isPublic: z.coerce.boolean().optional(),
    }),
  },
  Create: {
    Body: z.object({
      folderId: z.coerce.number().optional(),
    }),
  },
  Update: {
    Body: z.object({
      name: z.string().trim(),
      isStarred: z.coerce.boolean(),
      isPublic: z.coerce.boolean(),
    }),
  },
} as const;
