import { Sequelize } from "sequelize";
import { ENV } from "../constant/index.js";

export async function connect() {
  const sequelize = new Sequelize(ENV.URI.POSTGRES, {
    dialect: "postgres",
    benchmark: !global.isProduction,
    define: {
      freezeTableName: true,
    },
    logging(sql, timing) {
      if (global.isProduction) return;
      console.log(`${sql}`.black.bgWhite);
      console.log(`${timing} ms`.bgYellow.black);
    },
  });
  await sequelize.authenticate();
  global.sequelize = sequelize;
}

export async function close() {
  await global.sequelize?.close();
}

export async function sync() {
  await global.sequelize.sync();
}
