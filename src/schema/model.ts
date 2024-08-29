import { z } from "zod";
import { ENUM } from "../constant/index.js";

const Id = z.object({ id: z.number() });
const UserId = z.object({ userId: z.number() });
// const FolderId = z.object({ folderId: z.number() });
const OptionalFolderId = z.object({ folderId: z.number().nullable() });

export const User = z
  .object({
    username: z.string(),
    email: z.string().email(),
    image: z.number(),
    password: z.string(),
    path: z.string(),
  })
  .merge(Id);

export const Folder = z
  .object({
    name: z.string(),
    isStarred: z.boolean(),
    isPublic: z.boolean(),
    path: z.string(),
  })
  .merge(Id)
  .merge(UserId)
  .merge(OptionalFolderId);

export const File = z
  .object({
    name: z.string(),
    mime: z.string().nullable(),
    type: z.enum(ENUM.FILE_TYPE),
    isStarred: z.boolean(),
    isPublic: z.boolean(),
    path: z.string(),
  })
  .merge(Id)
  .merge(UserId)
  .merge(OptionalFolderId);
