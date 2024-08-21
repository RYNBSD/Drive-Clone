import { hashSync, genSaltSync, compareSync } from "bcrypt";

export default {
  hash: (str: string) => hashSync(str, genSaltSync(12)),
  compare: (str: string, hash: string) => compareSync(str, hash),
} as const;