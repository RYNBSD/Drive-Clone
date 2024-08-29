import { z } from "zod";
import folder from "./folder.js";
import file from "./file.js";
import { ENUM } from "../../../constant/index.js";

export default {
  Search: {
    Query: z.object({
      q: z.string().trim(),
      mode: z.enum(ENUM.SEARCH_MODE),
      lastFolderId: z.coerce.number().optional(),
      lastFileId: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
    }),
  },
  Recent: {
    Query: z.object({
      lastFolderId: z.coerce.number().optional(),
      lastFileId: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
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
