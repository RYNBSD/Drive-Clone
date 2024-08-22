import type { Request, Response } from "express";
import type { ResponseLocals, ResponseSuccess } from "../../types/http.js";
import type { ENUM } from "../../constant/index.js";
import fs from "node:fs";
import { StatusCodes } from "http-status-codes";
import FileFilter from "@ryn-bsd/file-processing/helper/filter.js";
import { APIError } from "../../error/index.js";
import { model } from "../../model/index.js";
import { FileUploader } from "../../lib/index.js";
import { util } from "../../util/index.js";
import { schema } from "../../schema/index.js";

const { Update } = schema.req.user.file;

export default {
  async all(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const { File } = model;
    const files = await File.findAll({
      where: {
        userId: req.user!.dataValues.id,
      },
      order: [["createdAt", "DESC"]],
      transaction: req.transaction,
    });
    res
      .status(files.length === 0 ? StatusCodes.NO_CONTENT : StatusCodes.OK)
      .json({
        success: true,
        data: {
          files: files.map((file) => file.dataValues),
        },
      });
  },
  async one(_req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.file === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "file undefined (user.folder.file.one)"
      );
    const stream = fs.createReadStream(res.locals.file.dataValues.path);
    stream.on("error", (error) => {
      throw error;
    });
    stream.pipe(res);
  },
  async create(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.folder === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "folder undefined (user.folder.file.create)"
      );

    const uploadedFiles = req.files;
    if (!Array.isArray(uploadedFiles))
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "files are not array (user.folder.file.create)"
      );

    const filteredFiles = uploadedFiles.filter(
      (file) => file.buffer.length > 0
    );
    if (filteredFiles.length === 0)
      throw APIError.controller(StatusCodes.FORBIDDEN, "Unprovided file");

    const folderId =
      res.locals.folder === false ? null : res.locals.folder!.dataValues.id;
    const { isFileNameSafe } = util.file;
    const { File } = model;

    const bulkedFiles = await Promise.all(
      filteredFiles.map(async (file) => {
        if (!isFileNameSafe(file.originalname))
          throw APIError.controller(StatusCodes.FORBIDDEN, "Invalid file name");

        const mime = await FileFilter.mime(file.buffer);
        let type: (typeof ENUM.FILE_TYPE)[number] = "none";

        if (mime?.startsWith("image")) type = "image";
        else if (mime?.startsWith("video")) type = "video";
        else if (mime?.startsWith("audio")) type = "audio";
        else if (mime?.includes("pdf")) type = "pdf";

        return {
          name: file.fieldname,
          mime: typeof mime !== "string" ? null : mime,
          type,
          isStared: false,
          userId: req.user!.dataValues.id,
          folderId,
        };
      })
    );

    const createdFiles = await File.bulkCreate(bulkedFiles, {
      fields: ["name", "userId", "folderId", "isStared", "type", "mime"],
      transaction: req.transaction,
    });

    await new FileUploader(
      ...createdFiles.map((_file, index) => ({
        buffer: filteredFiles[index]!.buffer,
        userId: req.user!.dataValues.id,
        fileName: createdFiles[index]!.dataValues.id,
        folderName,
      }))
    ).upload();

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        files: createdFiles.map((file) => file.dataValues),
      },
    });
  },
  async update(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.file === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "file undefined (user.folder.file.update)"
      );

    const { Body } = Update;
    const parsedBody = Body.safeParse(req.body);
    if (!parsedBody.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request body"
      );

    const { name } = parsedBody.data;
    if (name.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "empty name");

    const { isFolderNameSafe } = util.file;
    if (!isFolderNameSafe(name))
      throw APIError.controller(StatusCodes.FORBIDDEN, "Invalid folder name");

    const { File } = model;
    const checkFile = await File.findOne({
      where: { userId: req.user!.dataValues.id, name },
      limit: 1,
      plain: true,
      transaction: req.transaction,
    });
    if (checkFile !== null)
      throw APIError.controller(StatusCodes.CONFLICT, "Duplicate file name");

    await res.locals.file.update(
      { name },
      { fields: ["name"], transaction: req.transaction, returning: false }
    );
    res
      .status(StatusCodes.OK)
      .json({ success: true, data: { folder: res.locals.file.dataValues } });
  },
  async remove(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.file === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "file undefined (user.folder.file.remove)"
      );
    await res.locals.file.destroy({
      force: true,
      transaction: req.transaction,
    });
    res.status(StatusCodes.OK).json({
      success: true,
    });
  },
} as const;
