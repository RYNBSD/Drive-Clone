import jsonwebtoken from "jsonwebtoken";
import { ENV } from "../constant/index.js";

export default {
  sign: (data: unknown, expiresIn = 1000 * 60 * 60 * 24 * 30) =>
    jsonwebtoken.sign({ data: JSON.stringify(data) }, ENV.JWT.SECRET, {
      expiresIn,
    }),
  verify(token: string) {
    let payload: unknown = null;

    try {
      payload = jsonwebtoken.verify(token, ENV.JWT.SECRET);
      payload =
        payload === null ||
        typeof payload !== "object" ||
        !("data" in payload) ||
        typeof payload.data !== "string"
          ? null
          : JSON.parse(payload.data);
    } catch (_) {
      payload = null;
    }

    return payload;
  },
} as const;
