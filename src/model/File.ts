import type { Tables } from "../types/index.js";
import { DataTypes } from "sequelize";
import { FileUploader } from "../lib/index.js";
import { Folder } from "./Folder.js";
import { User } from "./User.js";
import { ENUM } from "../constant/index.js";

export const File = sequelize.define<Tables["File"]>(
  "file",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...ENUM.FILE_TYPE),
      allowNull: false,
    },
    isStarred: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    path: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      allowNull: false,
      references: {
        key: "id",
        model: User,
      },
    },
    folderId: {
      type: DataTypes.INTEGER,
      onDelete: "CASCADE",
      allowNull: true,
      references: {
        key: "id",
        model: Folder,
      },
    },
  },
  { timestamps: true, tableName: "File" }
);

File.addHook("beforeDestroy", async (file) => {
  await FileUploader.remove(file.dataValues.path);
});
