// eslint-disable-next-line import/no-unresolved
import { BASE_URL } from "@env";
import setCookieParser from "set-cookie-parser";
import { AUTHORIZATION, jwt } from "./jwt";

export async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${jwt.get()}`,
    },
    credentials: "include",
  });

  const setCookie = response.headers.get("set-cookie") ?? "";
  if (setCookie.length === 0) return response;

  const cookies = setCookieParser(setCookie);
  if (cookies.length === 0) return response;

  const newToken = cookies.find((cookie) => cookie.name === AUTHORIZATION);
  if (typeof newToken === "undefined" || newToken.value.length === 0)
    return response;

  jwt.set(newToken.value);
  return response;
}

export function object2urlQuery(obj: object) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}
