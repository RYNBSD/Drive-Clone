import type { NextFunction, Request, Response } from "express";
import type {
  ResponseLocals,
  ResponseSuccess,
  Tables,
} from "../types/index.js";
import FileFilter from "@ryn-bsd/file-processing/helper/filter.js";
import { StatusCodes } from "http-status-codes";
import { serialize } from "cookie";
import { schema } from "../schema/index.js";
import { APIError } from "../error/index.js";
import { util } from "../util/index.js";
import { model } from "../model/index.js";
import { FileUploader } from "../lib/index.js";
import { authenticate } from "../passport/fn.js";
import { config } from "../config/index.js";

const { SignUp, SignIn } = schema.req.auth;

export default {
  async signUp(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    const image = req.file;
    if (typeof image === "undefined" || image.buffer.length === 0)
      throw APIError.controller(StatusCodes.FORBIDDEN, "Unprovided image");
    if (image.originalname.length === 0)
      throw APIError.controller(
        StatusCodes.BAD_REQUEST,
        "Unprovided image name"
      );

    const { bcrypt, file } = util;
    const parsedImageName = file.parseName(image.originalname);
    if (parsedImageName.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "Invalid image name");
    if (!file.isFileNameSafe(parsedImageName))
      throw APIError.controller(StatusCodes.FORBIDDEN, "Unsafe image name");

    const { Body } = SignUp;
    const [parsedBody, filteredImage] = await Promise.all([
      Body.safeParseAsync(req.body),
      new FileFilter(image.buffer).image(),
    ]);

    if (filteredImage.length === 0)
      throw APIError.controller(
        StatusCodes.UNSUPPORTED_MEDIA_TYPE,
        "Invalid image file"
      );
    if (!parsedBody.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request body"
      );

    const { username, email, password } = parsedBody.data;
    if (username.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "empty username");
    if (email.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "empty email");
    if (password.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "empty password");

    const { User, File } = model;

    const createdUser = await User.create(
      { username, email, password: bcrypt.hash(password), image: 0, path: "" },
      {
        fields: ["username", "email", "password", "image", "path"],
        transaction: req.transaction,
      }
    );
    const rootPath = await FileUploader.createRootFolder(
      createdUser.dataValues.id
    );
    if (!rootPath.success) {
      if (rootPath.sever)
        throw APIError.server(
          StatusCodes.INTERNAL_SERVER_ERROR,
          `${rootPath.raison} (controller.auth.signUp)`
        );
      throw APIError.controller(StatusCodes.BAD_REQUEST, rootPath.raison);
    }

    const imagePath = await FileUploader.createFile(
      rootPath.payload,
      parsedImageName,
      image.buffer
    );
    if (!imagePath.success) {
      if (imagePath.sever)
        throw APIError.server(
          StatusCodes.INTERNAL_SERVER_ERROR,
          `${imagePath.raison} (controller.auth.signUp)`
        );
      throw APIError.controller(StatusCodes.BAD_REQUEST, imagePath.raison);
    }

    const createdFile = await File.create(
      {
        name: parsedImageName,
        mime: (await FileFilter.mime(image.buffer))!,
        type: "image",
        isStarred: false,
        isPublic: false,
        path: imagePath.payload,
        userId: createdUser.dataValues.id,
        folderId: null,
      },
      {
        fields: [
          "name",
          "mime",
          "type",
          "isStarred",
          "isPublic",
          "path",
          "userId",
          "folderId",
        ],
        transaction: req.transaction,
      }
    );

    await createdUser.update(
      { image: createdFile.dataValues.id, path: rootPath.payload },
      {
        fields: ["image", "path"],
        transaction: req.transaction,
        returning: false,
      }
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: {
        user: createdUser.dataValues,
      },
    });
  },
  async signIn(
    req: Request,
    res: Response<ResponseSuccess, ResponseLocals>,
    next: NextFunction
  ) {
    const { Body } = SignIn;
    const parsedBody = Body.safeParse(req.body);

    if (!parsedBody.success)
      throw APIError.controller(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid request body"
      );

    const { email, password } = parsedBody.data;
    if (email.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "empty email");
    if (password.length === 0)
      throw APIError.controller(StatusCodes.BAD_REQUEST, "empty password");

    const user = (await authenticate(
      "local",
      req,
      res,
      next
    )) as Tables["User"];

    const { options } = config;
    const { jwt } = util;

    res
      .status(StatusCodes.OK)
      .setHeader(
        "Set-Cookie",
        serialize(
          "authorization",
          jwt.sign({ id: user.dataValues.id }),
          options.cookie
        )
      )
      .json({
        success: true,
        data: {
          user: user.dataValues,
        },
      });
  },
  async signOut(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    req.logOut((error) => {
      if (error) throw error;
      req.session.destroy((error) => {
        if (error) throw error;
        res.status(StatusCodes.OK).json({ success: true });
      });
    });
  },
  async me(req: Request, res: Response<ResponseSuccess, ResponseLocals>) {
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        user: req.user!.dataValues,
      },
    });
  },
} as const;
