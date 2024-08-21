import type { Tables } from "../types/index.js";
import { DataTypes } from "sequelize";
import { FileUploader } from "../lib/index.js";
import { User } from "./User.js";

export const Folder = sequelize.define<Tables["Folder"]>(
  "folder",
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
    isStared: {
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
      references: {
        key: "id",
        model: User,
      },
    },
    folderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        key: "id",
        model: "Folder",
      },
    },
  },
  { timestamps: true, tableName: "Folder" }
);

Folder.addHook("beforeDestroy", async (folder) => {
  await FileUploader.remove(folder.dataValues.path);
});
