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

const { Flags, Create, Update } = schema.req.user.file;

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
        "file undefined (controller.user.file.one)"
      );

    res.contentType(res.locals.file.dataValues.mime ?? "");
    const stream = fs.createReadStream(res.locals.file.dataValues.path);
    stream.on("error", (error) => {
      throw error;
    });
    stream.pipe(res);
  },
  async starred(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const { File } = model;
    const files = await File.findAll({
      where: {
        userId: req.user!.dataValues.id,
        isStarred: true,
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
  async public(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const { File } = model;
    const files = await File.findAll({
      where: {
        userId: req.user!.dataValues.id,
        isPublic: true,
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
  async info(_req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.file === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "file undefined (controller.user.file.info)"
      );
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        file: res.locals.file.dataValues,
      },
    });
  },
  async flags(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.file === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "file undefined (controller.user.file.flags)"
      );

    const { Body } = Flags;
    const parsedBody = Body.safeParse(req.body);
    if (!parsedBody.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request body"
      );

    const {
      isStarred = res.locals.file.dataValues.isStarred,
      isPublic = res.locals.file.dataValues.isPublic,
    } = parsedBody.data;

    if (
      isStarred === res.locals.file.dataValues.isStarred &&
      isPublic === res.locals.file.dataValues.isPublic
    )
      throw APIError.controller(StatusCodes.FORBIDDEN, "Nothing changed");

    await res.locals.file.update(
      { isPublic, isStarred },
      {
        fields: ["isPublic", "isStarred"],
        transaction: req.transaction,
        returning: false,
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        file: res.locals.file.dataValues,
      },
    });
  },
  async create(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const uploadedFiles = req.files;
    if (!Array.isArray(uploadedFiles))
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "files are not array (controller.user.file.create)"
      );

    const filteredFiles = uploadedFiles.filter(
      (file) => file.buffer.length > 0
    );
    if (filteredFiles.length === 0)
      throw APIError.controller(StatusCodes.FORBIDDEN, "Unprovided file");

    const parsedFilesName = filteredFiles.map((file) => {
      if (file.originalname.length === 0)
        throw APIError.controller(
          StatusCodes.BAD_REQUEST,
          "Unprovided file name"
        );

      const { parseName, isFileNameSafe } = util.file;
      const parsedName = parseName(file.originalname);
      if (parsedName.length === 0)
        throw APIError.controller(StatusCodes.BAD_REQUEST, "Invalid file name");
      if (!isFileNameSafe(parsedName))
        throw APIError.controller(StatusCodes.FORBIDDEN, "unsafe file name");

      return parsedName;
    });

    const { Body } = Create;
    const parsedBody = Body.safeParse(req.body);
    if (!parsedBody.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request body"
      );

    const { folderId = 0 } = parsedBody.data;

    let parentFolder = req.user!.dataValues.path;

    if (folderId > 0) {
      const { Folder } = model;
      const checkFolder = await Folder.findOne({
        attributes: ["path"],
        where: { userId: req.user!.dataValues.id, folderId },
        limit: 1,
        plain: true,
        transaction: req.transaction,
      });
      if (checkFolder === null)
        throw APIError.controller(StatusCodes.NOT_FOUND, "Folder not found");
      parentFolder = checkFolder.dataValues.path;
    }

    const { File } = model;
    const bulkedFiles = await Promise.all(
      filteredFiles.map(async (file, index) => {
        const mime = await FileFilter.mime(file.buffer);
        let type: (typeof ENUM.FILE_TYPE)[number] = "none";

        if (mime?.startsWith("image")) type = "image";
        else if (mime?.startsWith("video")) type = "video";
        else if (mime?.startsWith("audio")) type = "audio";
        else if (mime?.includes("pdf")) type = "pdf";

        const savedFile = await FileUploader.createFile(
          parentFolder,
          parsedFilesName[index]!,
          file.buffer
        );
        if (!savedFile.success) {
          if (savedFile.sever)
            throw APIError.server(
              StatusCodes.INTERNAL_SERVER_ERROR,
              `${savedFile.raison} (controller.user.file.create)`
            );
          throw APIError.controller(StatusCodes.BAD_REQUEST, savedFile.raison);
        }

        return {
          name: parsedFilesName[index]!,
          mime: typeof mime !== "string" ? null : mime,
          type,
          isStarred: false,
          isPublic: false,
          path: savedFile.payload,
          userId: req.user!.dataValues.id,
          folderId: folderId === 0 ? null : folderId,
        };
      })
    );

    const createdFiles = await File.bulkCreate(bulkedFiles, {
      fields: [
        "name",
        "userId",
        "folderId",
        "isStarred",
        "isPublic",
        "path",
        "type",
        "mime",
      ],
      transaction: req.transaction,
    });

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
        "file undefined (controller.user.file.update)"
      );

    const { Body } = Update;
    const parsedBody = Body.safeParse(req.body);
    if (!parsedBody.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request body"
      );

    const {
      name,
      isStarred = res.locals.file.dataValues.isStarred,
      isPublic = res.locals.file.dataValues.isPublic,
    } = parsedBody.data;
    if (name.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "empty name");

    const { file } = util;
    const parsedFileName = file.parseName(name);
    if (parsedFileName.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "Invalid file name");
    if (!file.isFolderNameSafe(name))
      throw APIError.controller(StatusCodes.FORBIDDEN, "Unsafe folder name");

    let newPath = res.locals.file.dataValues.path;
    if (res.locals.file.dataValues.name !== parsedFileName) {
      const { File } = model;
      const checkFile = await File.findOne({
        where: { userId: req.user!.dataValues.id, name: parsedFileName },
        limit: 1,
        plain: true,
        transaction: req.transaction,
      });
      if (checkFile !== null)
        throw APIError.controller(StatusCodes.CONFLICT, "Duplicate file name");

      let parentFolderPath = req.user!.dataValues.path;
      if (res.locals.file.dataValues.folderId !== null) {
        const { Folder } = model;
        const parentFolder = await Folder.findOne({
          attributes: ["path"],
          where: {
            userId: req.user!.dataValues.id,
            id: res.locals.file.dataValues.folderId,
          },
          limit: 1,
          plain: true,
          transaction: req.transaction,
        });
        if (parentFolder !== null)
          parentFolderPath = parentFolder.dataValues.path;
      }

      const newFilePath = await FileUploader.renameFile(
        res.locals.file.dataValues.path,
        parentFolderPath,
        parsedFileName
      );
      if (!newFilePath.success) {
        if (newFilePath.sever)
          throw APIError.server(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `${newFilePath.raison} (controller.user.file.update)`
          );
        throw APIError.controller(StatusCodes.BAD_REQUEST, newFilePath.raison);
      }
      newPath = newFilePath.payload;
    }

    await res.locals.file.update(
      { name: parsedFileName, isStarred, isPublic, path: newPath },
      {
        fields: ["name", "isStarred", "isPublic", "path"],
        transaction: req.transaction,
        returning: false,
      }
    );
    res
      .status(StatusCodes.OK)
      .json({ success: true, data: { file: res.locals.file.dataValues } });
  },
  async remove(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.file === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "file undefined (controller.user.file.remove)"
      );
    if (res.locals.file.dataValues.id === req.user!.dataValues.image)
      throw APIError.controller(
        StatusCodes.FORBIDDEN,
        "You can't remove this file, unless you change the profile picture"
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
