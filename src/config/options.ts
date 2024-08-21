import { CookieOptions } from "express";

export const cookie = {
  sameSite: global.isProduction,
  httpOnly: global.isProduction,
  secure: global.isProduction,
  maxAge: 1000 * 60 * 60 * 24, // 1 day
  path: "/",
} satisfies CookieOptions;
