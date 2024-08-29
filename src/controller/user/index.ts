import type { Request, Response } from "express";
import type { ResponseLocals, ResponseSuccess } from "../../types/index.js";
import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import FileFilter from "@ryn-bsd/file-processing/helper/filter.js";
import folder from "./folder.js";
import { FileUploader } from "../../lib/file-uploader.js";
import { APIError } from "../../error/index.js";
import { schema } from "../../schema/index.js";
import { model } from "../../model/index.js";
import { util } from "../../util/index.js";
import file from "./file.js";

const { Search, Recent, Update } = schema.req.user;

export default {
  async search(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const { Query } = Search;
    const parsedQuery = Query.safeParse(req.query);
    if (!parsedQuery.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request query"
      );

    const {
      q,
      mode,
      lastFolderId = null,
      lastFileId = null,
      limit = 25,
    } = parsedQuery.data;
    if (q.length === 0)
      throw APIError.controller(
        StatusCodes.FORBIDDEN,
        "No search query provided"
      );
    if (lastFileId !== null && lastFileId < 0)
      throw APIError.controller(
        StatusCodes.FORBIDDEN,
        "last file id must be greater than -1"
      );
    if (lastFolderId !== null && lastFolderId < 0)
      throw APIError.controller(
        StatusCodes.FORBIDDEN,
        "last folder id must be greater than -1"
      );

    const filteredQuery = q
      .split(/\s/g)
      .filter((query) => query.length > 1)
      .map((key) => ({ [Op.iLike]: `%${key}%` }));
    if (filteredQuery.length === 0)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid search query"
      );

    const { Folder, File } = model;
    const [folders, files] = await Promise.all([
      Folder.findAll({
        where: {
          id: {
            [Op.lt]: lastFolderId ?? 0,
          },
          userId: {
            [mode === "global" ? Op.ne : Op.eq]: req.user!.dataValues.id,
          },
          name: {
            [Op.or]: filteredQuery,
          },
          isPublic: mode === "global",
        },
        order: [["createdAt", "DESC"]],
        limit: lastFolderId === null ? 0 : limit,
        transaction: req.transaction,
      }),
      File.findAll({
        where: {
          id: {
            [Op.lt]: lastFileId ?? 0,
          },
          userId: {
            [mode === "global" ? Op.ne : Op.eq]: req.user!.dataValues.id,
          },
          name: {
            [Op.or]: filteredQuery,
          },
          isPublic: mode === "global",
        },
        order: [["createdAt", "DESC"]],
        limit: lastFileId === null ? 0 : limit,
        transaction: req.transaction,
      }),
    ]);

    res
      .status(
        folders.length === 0 && files.length === 0
          ? StatusCodes.NO_CONTENT
          : StatusCodes.OK
      )
      .json({
        success: true,
        data: {
          folders: folders.map((folder) => folder.dataValues),
          files: files.map((file) => file.dataValues),
        },
      });
  },
  async recent(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const { Query } = Recent;
    const parsedQuery = Query.safeParse(req.query);
    if (!parsedQuery.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request query"
      );

    const {
      lastFolderId = null,
      lastFileId = null,
      limit = 25,
    } = parsedQuery.data;
    if (lastFileId !== null && lastFileId < 0)
      throw APIError.controller(
        StatusCodes.FORBIDDEN,
        "last file id must be greater than -1"
      );
    if (lastFolderId !== null && lastFolderId < 0)
      throw APIError.controller(
        StatusCodes.FORBIDDEN,
        "last folder id must be greater than -1"
      );

    const { Folder, File } = model;
    const [folders, files] = await Promise.all([
      Folder.findAll({
        where: {
          id: {
            [Op.lt]: lastFolderId ?? 0,
          },
          userId: req.user!.dataValues.id,
        },
        order: [["createdAt", "DESC"]],
        limit: lastFolderId === null ? 0 : limit,
        transaction: req.transaction,
      }),
      File.findAll({
        where: {
          id: {
            [Op.lt]: lastFileId ?? 0,
          },
          userId: req.user!.dataValues.id,
        },
        order: [["createdAt", "DESC"]],
        limit: lastFileId === null ? 0 : limit,
        transaction: req.transaction,
      }),
    ]);

    res
      .status(
        folders.length === 0 && files.length === 0
          ? StatusCodes.NO_CONTENT
          : StatusCodes.OK
      )
      .json({
        success: true,
        data: {
          folders: folders.map((folder) => folder.dataValues),
          files: files.map((file) => file.dataValues),
        },
      });
  },
  async profile(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user: req.user!.dataValues,
      },
    });
  },
  async update(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    let newImage = req.user!.dataValues.image;
    const image = req.file;

    if (typeof image !== "undefined" && image.buffer.length > 0) {
      if (image.originalname.length === 0)
        throw APIError.controller(
          StatusCodes.BAD_REQUEST,
          "Unprovided image name"
        );

      const { file } = util;
      const parsedImageName = file.parseName(image.originalname);
      if (parsedImageName.length === 0)
        throw APIError.controller(
          StatusCodes.BAD_REQUEST,
          "Invalid image name"
        );
      if (!file.isFileNameSafe(parsedImageName))
        throw APIError.controller(StatusCodes.FORBIDDEN, "Unsafe image name");

      const [savedFile, mime] = await Promise.all([
        FileUploader.createFile(
          req.user!.dataValues.path,
          parsedImageName,
          image.buffer
        ),
        FileFilter.mime(image.buffer),
      ]);

      if (!savedFile.success) {
        if (savedFile.sever)
          throw APIError.server(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `${savedFile.raison} (controller.user.update)`
          );
        throw APIError.controller(StatusCodes.BAD_REQUEST, savedFile.raison);
      }

      const { File } = model;
      const createdFile = await File.create(
        {
          userId: req.user!.dataValues.id,
          name: parsedImageName,
          type: "image",
          mime: mime ?? null,
          path: savedFile.payload,
          folderId: null,
          isStarred: false,
          isPublic: false,
        },
        {
          fields: [
            "userId",
            "name",
            "type",
            "mime",
            "path",
            "folderId",
            "isStarred",
            "isPublic",
          ],
          transaction: req.transaction,
        }
      );
      newImage = createdFile.dataValues.id;
    }

    const { Body } = Update;
    const parsedBody = Body.safeParse(req.body);
    if (!parsedBody.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request body"
      );

    const { username } = parsedBody.data;
    if (username.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "Username empty");

    await req.user!.update(
      { username, image: newImage },
      {
        fields: ["username", "image"],
        transaction: req.transaction,
        returning: false,
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user: req.user!.dataValues,
      },
    });
  },
  async remove(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    await req.user!.destroy({ force: true, transaction: req.transaction });
    res.status(StatusCodes.OK).json({
      success: true,
    });
  },
  folder,
  file,
} as const;
