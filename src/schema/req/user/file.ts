import { z } from "zod";

export default {
  Update: {
    Body: z.object({
      name: z.string().trim(),
    }),
  },
} as const;
