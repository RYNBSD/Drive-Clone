import type { Request, Response } from "express";
import type { ResponseLocals, ResponseSuccess } from "../../types/index.js";
import { StatusCodes } from "http-status-codes";
import { APIError } from "../../error/index.js";
import { schema } from "../../schema/index.js";
import { util } from "../../util/index.js";
import { model } from "../../model/index.js";
import { FileUploader } from "../../lib/index.js";

const { Flags, Create, Update } = schema.req.user.folder;

export default {
  async all(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const { Folder } = model;
    const folders = await Folder.findAll({
      where: {
        userId: req.user!.dataValues.id,
      },
      order: [["createdAt", "DESC"]],
      transaction: req.transaction,
    });
    res
      .status(folders.length === 0 ? StatusCodes.NO_CONTENT : StatusCodes.OK)
      .json({
        success: true,
        data: {
          folders: folders.map((folder) => folder.dataValues),
        },
      });
  },
  async one(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.folder === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "folder undefined (controller.user.folder.one)"
      );
    const { Folder, File } = model;
    const [folders, files] = await Promise.all([
      Folder.findAll({
        where: {
          userId: req.user!.dataValues.id,
          folderId: res.locals.folder.dataValues.id,
        },
        order: [["createdAt", "DESC"]],
        transaction: req.transaction,
      }),
      File.findAll({
        where: {
          userId: req.user!.dataValues.id,
          folderId: res.locals.folder.dataValues.id,
        },
        order: [["createdAt", "DESC"]],
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
  async starred(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const { Folder } = model;
    const folders = await Folder.findAll({
      where: {
        userId: req.user!.dataValues.id,
        isStarred: true,
      },
      order: [["createdAt", "DESC"]],
      transaction: req.transaction,
    });
    res
      .status(folders.length === 0 ? StatusCodes.NO_CONTENT : StatusCodes.OK)
      .json({
        success: true,
        data: {
          folders: folders.map((folder) => folder.dataValues),
        },
      });
  },
  async public(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const { Folder } = model;
    const folders = await Folder.findAll({
      where: {
        userId: req.user!.dataValues.id,
        isPublic: true,
      },
      order: [["createdAt", "DESC"]],
      transaction: req.transaction,
    });
    res
      .status(folders.length === 0 ? StatusCodes.NO_CONTENT : StatusCodes.OK)
      .json({
        success: true,
        data: {
          folders: folders.map((folder) => folder.dataValues),
        },
      });
  },
  async folders(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.folder === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "folder undefined (controller.user.folder.folders)"
      );
    const { Folder } = model;
    const folders = await Folder.findAll({
      where: {
        userId: req.user!.dataValues.id,
        folderId: res.locals.folder.dataValues.id,
      },
      order: [["createdAt", "DESC"]],
      transaction: req.transaction,
    });
    res
      .status(folders.length === 0 ? StatusCodes.NO_CONTENT : StatusCodes.OK)
      .json({
        success: true,
        data: {
          folders: folders.map((folder) => folder.dataValues),
        },
      });
  },
  async files(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.folder === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "folder undefined (controller.user.folder.files)"
      );
    const { File } = model;
    const files = await File.findAll({
      where: {
        userId: req.user!.dataValues.id,
        folderId: res.locals.folder.dataValues.id,
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
    if (typeof res.locals.folder === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "folder undefined (controller.user.folder.info)"
      );
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        folder: res.locals.folder.dataValues,
      },
    });
  },
  async flags(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.folder === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "folder undefined (controller.user.folder.flags)"
      );

    const { Body } = Flags;
    const parsedBody = Body.safeParse(req.body);
    if (!parsedBody.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request body"
      );

    const {
      isPublic = res.locals.folder.dataValues.isPublic,
      isStarred = res.locals.folder.dataValues.isStarred,
    } = parsedBody.data;

    if (
      isPublic === res.locals.folder.dataValues.isPublic &&
      isStarred === res.locals.folder.dataValues.isStarred
    )
      throw APIError.controller(StatusCodes.FORBIDDEN, "Nothing changed");

    await res.locals.folder.update(
      { isStarred, isPublic },
      {
        fields: ["isPublic", "isStarred"],
        transaction: req.transaction,
        returning: false,
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        folder: res.locals.folder.dataValues,
      },
    });
  },
  async create(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const { Body } = Create;
    const parsedBody = Body.safeParse(req.body);
    if (!parsedBody.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request body"
      );

    const { name, folderId = 0 } = parsedBody.data;
    if (name.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "empty name");

    const { file } = util;
    const parsedFolderName = file.parseName(name);
    if (parsedFolderName.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "Invalid folder name");
    if (!file.isFolderNameSafe(name))
      throw APIError.controller(StatusCodes.FORBIDDEN, "Invalid folder name");

    const { Folder, File } = model;

    let isRootFolder = true;
    let parentFolderPath = req.user!.dataValues.path;

    if (folderId > 0) {
      const checkParentFolder = await Folder.findOne({
        where: { userId: req.user!.dataValues.id, id: folderId },
        limit: 1,
        plain: true,
        transaction: req.transaction,
      });
      if (checkParentFolder === null)
        throw APIError.controller(StatusCodes.NOT_FOUND, "Folder not found");
      isRootFolder = false;
      parentFolderPath = checkParentFolder.dataValues.path;
    }

    const [checkDuplicateFolder, checkDuplicateFile] = await Promise.all([
      Folder.findOne({
        where: {
          userId: req.user!.dataValues.id,
          folderId: isRootFolder ? null : folderId,
          name: parsedFolderName,
        },
        limit: 1,
        plain: true,
        transaction: req.transaction,
      }),
      File.findOne({
        where: {
          userId: req.user!.dataValues.id,
          folderId: isRootFolder ? null : folderId,
          name: parsedFolderName,
        },
        limit: 1,
        plain: true,
        transaction: req.transaction,
      }),
    ]);
    if (checkDuplicateFolder !== null)
      throw APIError.controller(StatusCodes.CONFLICT, "Duplicate folder name");
    if (checkDuplicateFile !== null)
      throw APIError.controller(
        StatusCodes.CONFLICT,
        "Exist file with the same name"
      );

    const savedFolder = await FileUploader.createFolder(
      parentFolderPath,
      parsedFolderName
    );
    if (!savedFolder.success) {
      if (savedFolder.sever)
        throw APIError.server(
          StatusCodes.INTERNAL_SERVER_ERROR,
          `${savedFolder.raison} (controller.user.folder.create)`
        );
      throw APIError.controller(StatusCodes.BAD_REQUEST, savedFolder.raison);
    }

    const createdFolder = await Folder.create(
      {
        name: parsedFolderName,
        isStarred: false,
        isPublic: false,
        folderId: isRootFolder ? null : folderId,
        userId: req.user!.dataValues.id,
        path: savedFolder.payload,
      },
      {
        fields: ["name", "isStarred", "isPublic", "userId", "folderId", "path"],
        transaction: req.transaction,
      }
    );

    // if (inRoot) {
    //   await FileUploader.createFolder(
    //     req.user!.dataValues.id,
    //     createdFolder.dataValues.name
    //   );
    // } else {
    //   const parents = await sequelize.query(
    //     `
    //   WITH RECURSIVE parent_folders AS (
    //     SELECT *
    //     FROM "Folder"
    //     WHERE id = $folderId
    //     UNION ALL
    //     SELECT f.*
    //     FROM "Folder" f
    //     INNER JOIN parent_folders  ON parent_folders."folderId" = f.id
    //   )
    //   SELECT * FROM parent_folders;
    // `,
    //     {
    //       type: QueryTypes.SELECT,
    //       bind: { folderId },
    //       model: Folder,
    //       mapToModel: true,
    //       transaction: req.transaction,
    //     }
    //   );
    //   await FileUploader.createFolder(
    //     req.user!.dataValues.id,
    //     ...parents.map((folder) => folder.dataValues.name),
    //     name
    //   );
    // }

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        folder: createdFolder.dataValues,
      },
    });
  },
  async update(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.folder === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "folder undefined (controller.user.folder.update)"
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
      isStarred = res.locals.folder.dataValues.isStarred,
      isPublic = res.locals.folder.dataValues.isPublic,
    } = parsedBody.data;
    if (name.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "empty name");

    const { file } = util;
    const parsedFolderName = file.parseName(name);
    if (parsedFolderName.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "Invalid folder name");
    if (!file.isFolderNameSafe(name))
      throw APIError.controller(StatusCodes.FORBIDDEN, "Unsafe folder name");

    let newPath = res.locals.folder.dataValues.path;

    if (res.locals.folder.dataValues.name !== parsedFolderName) {
      const { Folder } = model;
      const checkFolder = await Folder.findOne({
        attributes: ["id"],
        where: {
          userId: req.user!.dataValues.id,
          name: parsedFolderName,
        },
        limit: 1,
        plain: true,
        transaction: req.transaction,
      });
      if (checkFolder !== null)
        throw APIError.controller(
          StatusCodes.CONFLICT,
          "Duplicate folder name"
        );

      let parentFolderPath = req.user!.dataValues.path;
      if (res.locals.folder.dataValues.folderId !== null) {
        const parentFolder = await Folder.findOne({
          attributes: ["path"],
          where: {
            userId: req.user!.dataValues.id,
            id: res.locals.folder.dataValues.folderId,
          },
          limit: 1,
          plain: true,
          transaction: req.transaction,
        });
        if (parentFolder !== null)
          parentFolderPath = parentFolder.dataValues.path;
      }

      const newFolderPath = await FileUploader.renameFolder(
        res.locals.folder.dataValues.path,
        parentFolderPath,
        parsedFolderName
      );
      if (!newFolderPath.success) {
        if (newFolderPath.sever)
          throw APIError.server(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `${newFolderPath.raison} (controller.user.folder.update)`
          );
        throw APIError.controller(
          StatusCodes.BAD_REQUEST,
          newFolderPath.raison
        );
      }
      newPath = newFolderPath.payload;
    }

    await res.locals.folder.update(
      {
        name: parsedFolderName,
        isStarred,
        isPublic,
        path: newPath,
      },
      {
        fields: ["name", "isStarred", "isPublic", "path"],
        transaction: req.transaction,
        returning: false,
      }
    );

    res
      .status(StatusCodes.OK)
      .json({ success: true, data: { folder: res.locals.folder.dataValues } });
  },
  async remove(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    if (typeof res.locals.folder === "undefined")
      throw APIError.server(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "folder undefined (controller.user.folder.remove)"
      );
    await res.locals.folder.destroy({
      force: true,
      transaction: req.transaction,
    });
    res.status(StatusCodes.OK).json({
      success: true,
    });
  },
} as const;
