import type { NextFunction, Request, Response } from "express";
import type { ResponseLocals } from "../types/index.js";
import { StatusCodes } from "http-status-codes";
import { model } from "../model/index.js";
import { APIError } from "../error/index.js";
import { schema } from "../schema/index.js";

const { FolderId, FileId } = schema.id;

export default {
  async isFolderOwner(
    req: Request,
    res: Response<never, ResponseLocals>,
    next: NextFunction
  ) {
    const parsedParams = FolderId.safeParse(req.params);
    if (!parsedParams.success)
      throw APIError.middleware(StatusCodes.NOT_ACCEPTABLE, "Invalid folderId");

    const { folderId } = parsedParams.data;
    const { Folder } = model;
    const folder = await Folder.findOne({
      where: { id: folderId, userId: req.user!.dataValues.id },
      limit: 1,
      plain: true,
    });
    if (folder === null)
      throw APIError.middleware(StatusCodes.NOT_FOUND, "Folder not found");
    res.locals.folder = folder;
    return next();
  },
  async isFileOwner(
    req: Request,
    res: Response<never, ResponseLocals>,
    next: NextFunction
  ) {
    const parsedParams = FileId.safeParse(req.params);
    if (!parsedParams.success)
      throw APIError.middleware(StatusCodes.NOT_ACCEPTABLE, "Invalid fileId");

    const { fileId } = parsedParams.data;
    const { File } = model;
    const file = await File.findOne({
      where: { id: fileId, userId: req.user!.dataValues.id },
      limit: 1,
      plain: true,
    });
    if (file === null)
      throw APIError.middleware(StatusCodes.NOT_FOUND, "File not found");
    res.locals.file = file;
    return next();
  },
} as const;
