import { z } from "zod";

export default {
  SignUp: {
    Body: z.object({
      username: z.string().trim(),
      email: z.string().trim().email(),
      password: z.string().trim(),
    }),
  },
  SignIn: {
    Body: z.object({
      email: z.string().trim().email(),
      password: z.string().trim(),
    }),
  },
} as const;
