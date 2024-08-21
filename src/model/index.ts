import { File } from "./File.js";
import { Folder } from "./Folder.js";
import { User } from "./User.js";

export const model = { User, Folder, File } as const;
