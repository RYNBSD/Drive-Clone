import fs from "node:fs";
import path from "node:path";

// storage structure: userId/folderName/.../fileName
// userId: uniqueness
// folderName/fileName: avoid folder name equal file name

export type FileUploadSchema = {
  buffer: Buffer;
  userId: number;
  fileName: string;
  folderName?: string | null;
};

export class FileUploader {
  private readonly files: FileUploadSchema[] = [];

  static readonly UPLOAD_DIR = "upload";

  constructor(...files: FileUploadSchema[]) {
    this.files = files;
  }

  async upload() {
    const uris = FileUploader.merge(
      ...this.files.map(({ userId, folderName }) => ({ userId, folderName }))
    );
    return Promise.all(
      uris.map(async (uri, index) => {
        const file = this.files[index]!;
        const fullPath = path.join(uri, `${file.fileName}`);
        await fs.promises.writeFile(fullPath, file.buffer);
        return fullPath;
      })
    );
  }

  static async remove(...paths: string[]) {
    Promise.all(
      paths.map((path) =>
        fs.promises.rm(path, { force: true, recursive: true })
      )
    );
  }

  // static merge(
  //   ...uris: { userId: number; folderName?: string | null; fileName?: string }[]
  // ) {
  //   return uris.map((uri) =>
  //     path.join(
  //       global.__root,
  //       FileUploader.UPLOAD_DIR,
  //       `${uri.userId}`,
  //       `${uri?.folderName ?? ""}`,
  //       `${uri?.fileName ?? ""}`
  //     )
  //   );
  // }

  static async createRootFolder(userId: number) {
    const rootPath = path.join(
      global.__root,
      FileUploader.UPLOAD_DIR,
      `${userId}`
    );
    if (rootPath.length === 0 || fs.existsSync(rootPath)) return false;
    await fs.promises.mkdir(rootPath);
    return rootPath;
  }

  static async createFolder(parentPath: string, folderName: string) {
    const folderPath = path.join(parentPath, folderName);
    if (folderPath.length === 0 || fs.existsSync(folderPath)) return false;
    await fs.promises.mkdir(folderPath);
    return folderPath;
  }

  static async renameFolder(
    folderPath: string,
    parentFolder: string,
    newName: string
  ) {
    if (folderPath.length === 0 || !fs.existsSync(folderPath)) return false;

    const newFolderPath = path.join(parentFolder, newName);
    if (newFolderPath.length === 0 || fs.existsSync(newFolderPath))
      return false;

    await fs.promises.rename(folderPath, newFolderPath);
    return newFolderPath;
  }

  static async createFile(
    folderPath: string,
    fileName: string,
    fileBuffer: Buffer
  ) {
    const filePath = path.join(folderPath, fileName);
    if (filePath.length === 0 || fs.existsSync(filePath)) return false;
    await fs.promises.writeFile(folderPath, fileBuffer);
    return filePath;
  }

  static async renameFile() {}
}
