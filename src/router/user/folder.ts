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
const {
  all,
  one,
  starred,
  public: publicFolders,
  folders,
  files,
  info,
  flags,
  create,
  update,
  remove,
} = controller.user.folder;

folder.get("/", handleAsync(all));

folder.get("/starred", handleAsync(starred));

folder.get("/public", handleAsync(publicFolders));

folder.get(
  `/:${PARAMS.ID.FOLDER}`,
  handleAsync(isFolderOwner),
  handleAsync(one)
);

folder.get(
  `/:${PARAMS.ID.FOLDER}/folders`,
  handleAsync(isFolderOwner),
  handleAsync(folders)
);

folder.get(
  `/:${PARAMS.ID.FOLDER}/files`,
  handleAsync(isFolderOwner),
  handleAsync(files)
);

folder.get(
  `/:${PARAMS.ID.FOLDER}/info`,
  handleAsync(isFolderOwner),
  handleAsync(info)
);

folder.patch(
  `/:${PARAMS.ID.FOLDER}`,
  handleAsync(isFolderOwner),
  handleAsync(upload.none()),
  handleAsync(flags)
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
