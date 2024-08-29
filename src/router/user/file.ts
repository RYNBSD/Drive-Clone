import { Router } from "express";
import { util } from "../../util/index.js";
import { controller } from "../../controller/index.js";
import { KEYS } from "../../constant/index.js";
import { middleware } from "../../middleware/index.js";
import { config } from "../../config/index.js";

export const file = Router();

const { upload } = config;
const { handleAsync } = util.fn;
const { PARAMS } = KEYS.HTTP.REQUEST;
const { isFileOwner } = middleware.user;
const {
  all,
  one,
  starred,
  public: publicFiles,
  info,
  flags,
  create,
  update,
  remove,
} = controller.user.file;

file.get("/", handleAsync(all));

file.get(`/starred`, handleAsync(starred));

file.get(`/public`, handleAsync(publicFiles));

file.get(`/:${PARAMS.ID.FILE}`, handleAsync(isFileOwner), handleAsync(one));

file.get(
  `/:${PARAMS.ID.FILE}/info`,
  handleAsync(isFileOwner),
  handleAsync(info)
);

file.patch(
  `/:${PARAMS.ID.FILE}`,
  handleAsync(isFileOwner),
  handleAsync(upload.none()),
  handleAsync(flags)
);

file.post("/", handleAsync(upload.array("files")), handleAsync(create));

file.put(
  `/:${PARAMS.ID.FILE}`,
  handleAsync(isFileOwner),
  handleAsync(upload.none()),
  handleAsync(update)
);

file.delete(
  `/:${PARAMS.ID.FILE}`,
  handleAsync(isFileOwner),
  handleAsync(remove)
);
