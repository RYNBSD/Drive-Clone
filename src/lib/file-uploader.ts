import fs from "node:fs";
import path from "node:path";

// storage structure: userId/folderName/.../fileName
// userId: uniqueness
// folderName/fileName: avoid folder name equal file name

export type FileUploadFailed = {
  success: false;
  raison: string;
  /** is server error */
  sever: boolean;
};

export type FailUploadSuccess<T> = {
  success: true;
  payload: T;
};

export type FileUploadStatus<T> = FailUploadSuccess<T> | FileUploadFailed;

export type FileUploadSchema = {
  buffer: Buffer;
  fileName: string;
  parentFolder: string;
};

export class FileUploader {
  private readonly files: FileUploadSchema[] = [];

  static readonly UPLOAD_DIR = "upload";

  constructor(...files: FileUploadSchema[]) {
    this.files = files;
  }

  async upload() {
    return Promise.all(
      this.files.map(async ({ parentFolder, fileName, buffer }) =>
        FileUploader.createFile(parentFolder, fileName, buffer)
      )
    );
  }

  static async remove(...paths: string[]) {
    Promise.all(
      paths.map((path) =>
        fs.promises.rm(path, { force: true, recursive: true })
      )
    );
  }

  static async createRootFolder<T extends string = string>(
    userId: number
  ): Promise<FileUploadStatus<T>> {
    const rootPath = path.join(
      global.__root,
      FileUploader.UPLOAD_DIR,
      `${userId}`
    );
    if (rootPath.length === 0)
      return {
        success: false,
        raison: "Invalid root path (FileUploader.createRootFolder)",
        sever: true,
      };
    if (fs.existsSync(rootPath))
      return { success: false, raison: "Root already exists", sever: false };
    await fs.promises.mkdir(rootPath);
    return { success: true, payload: rootPath as T };
  }

  static async createFolder<T extends string = string>(
    parentPath: string,
    folderName: string
  ): Promise<FileUploadStatus<T>> {
    const folderPath = path.join(parentPath, folderName);
    if (folderPath.length === 0)
      return {
        success: false,
        raison: "Invalid folder path (FileUploader.createFolder)",
        sever: true,
      };
    if (fs.existsSync(folderPath))
      return { success: false, raison: "Folder already exists", sever: false };
    await fs.promises.mkdir(folderPath);
    return { success: true, payload: folderPath as T };
  }

  static async renameFolder<T extends string = string>(
    folderPath: string,
    parentFolder: string,
    newName: string
  ): Promise<FileUploadStatus<T>> {
    if (folderPath.length === 0)
      return {
        success: false,
        raison: "Unprovided folder path (FileUploader.renameFolder)",
        sever: true,
      };
    if (!fs.existsSync(folderPath))
      return { success: false, raison: "Folder don't exist", sever: false };

    const newFolderPath = path.join(parentFolder, newName);
    if (newFolderPath.length === 0)
      return {
        success: false,
        raison: "Invalid new folder path (FileUploader.renameFolder)",
        sever: true,
      };
    if (newFolderPath === folderPath)
      return {
        success: false,
        raison: "Folder name not changed",
        sever: false,
      };
    if (fs.existsSync(newFolderPath))
      return {
        success: false,
        raison: "New name is already in use",
        sever: false,
      };

    await fs.promises.rename(folderPath, newFolderPath);
    return { success: true, payload: newFolderPath as T };
  }

  static async createFile<T extends string = string>(
    folderPath: string,
    fileName: string,
    fileBuffer: Buffer
  ): Promise<FileUploadStatus<T>> {
    const filePath = path.join(folderPath, fileName);
    if (filePath.length === 0)
      return {
        success: false,
        raison: "Invalid file path (FileUploader.createFile)",
        sever: true,
      };
    if (fs.existsSync(filePath))
      return { success: false, raison: "File already exists", sever: false };
    await fs.promises.writeFile(filePath, fileBuffer);
    return { success: true, payload: filePath as T };
  }

  static async renameFile<T extends string = string>(
    filePath: string,
    parentFolder: string,
    newName: string
  ): Promise<FileUploadStatus<T>> {
    if (filePath.length === 0)
      return {
        success: false,
        raison: "Invalid file path (FileUploader.renameFile)",
        sever: true,
      };
    if (!fs.existsSync(filePath))
      return {
        success: false,
        raison: "File don't exists",
        sever: false,
      };

    const newFilePath = path.join(parentFolder, newName);
    if (newFilePath.length === 0)
      return {
        success: false,
        raison: "invalid new file path (FileUploader.renameFile)",
        sever: true,
      };
    if (newFilePath === filePath)
      return { success: false, raison: "File name not changed", sever: false };
    if (fs.existsSync(newFilePath))
      return {
        success: false,
        raison: "New name is already in user",
        sever: false,
      };

    await fs.promises.rename(filePath, newFilePath);
    return { success: true, payload: newFilePath as T };
  }
}
