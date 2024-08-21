import * as model from "./model.js";
import * as id from "./id.js";
import req from "./req/index.js";

export const schema = { model, id, req } as const;
