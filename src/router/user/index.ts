import { Router } from "express";
import { file } from "./file.js";
import { folder } from "./folder.js";
import { util } from "../../util/index.js";
import { config } from "../../config/index.js";
import { controller } from "../../controller/index.js";

export const user = Router();

const { upload } = config;
const { handleAsync } = util.fn;
const { search, recent, profile, update, remove } = controller.user;

user.get("/search", handleAsync(search));

user.get("/recent", handleAsync(recent));

user.get("/", handleAsync(profile));

user.put("/", handleAsync(upload.single("image")), handleAsync(update));

user.delete("/", handleAsync(remove));

user.use("/folders", folder);

user.use("/files", file);
