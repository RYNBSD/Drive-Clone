import { Router } from "express";
import { util } from "../../util/index.js";
import { controller } from "../../controller/index.js";
import { middleware } from "../../middleware/index.js";
import { KEYS } from "../../constant/index.js";
import { config } from "../../config/index.js";

export const folder = Router();

const { upload } = config;
const { handleAsync } = util.fn;
const { PARAMS } = KEYS.HTTP.REQUEST;
const { isFolderOwner } = middleware.user;
const { all, one, create, update, remove } = controller.user.folder;

folder.get("/", handleAsync(all));

folder.get(
  `/:${PARAMS.ID.FOLDER}`,
  handleAsync(isFolderOwner),
  handleAsync(one)
);

folder.post("/", handleAsync(upload.none()), handleAsync(create));

folder.put(
  `/:${PARAMS.ID.FOLDER}`,
  handleAsync(isFolderOwner),
  handleAsync(upload.none()),
  handleAsync(update)
);

folder.delete(
  `/:${PARAMS.ID.FOLDER}`,
  handleAsync(isFolderOwner),
  handleAsync(remove)
);
