import { z } from "zod";
import { KEYS } from "../constant/index.js";

export const FolderId = z.object({
  [KEYS.HTTP.REQUEST.PARAMS.ID.FOLDER]: z.coerce.number(),
});

export const FileId = z.object({
  [KEYS.HTTP.REQUEST.PARAMS.ID.FILE]: z.coerce.number(),
});
