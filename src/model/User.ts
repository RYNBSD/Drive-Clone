import type { Tables } from "../types/index.js";
import { DataTypes } from "sequelize";
import { FileUploader } from "../lib/index.js";

export const User = sequelize.define<Tables["User"]>(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
  },
  { timestamps: true, tableName: "User" }
);

User.addHook("beforeDestroy", async (user) => {
  await FileUploader.remove(user.dataValues.path);
});
