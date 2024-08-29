import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "node:path";
import { ENV } from "../constant/index.js";

const options: swaggerJsdoc.Options = {
  failOnErrors: true,
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Drive API",
      version: "1",
      description:
        "This is a swagger documentation for drive, this is not for testing api, if you want to test it use for eg: postman",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Boussayed Rayen",
        url: "https://rynbsd.vercel.app/",
        email: "rynbsd04@gmail.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${ENV.NODE.PORT}/`,
      },
    ],
  },
  apis: [path.join(global.__root, "src/**/*.ts")],
};

export default {
  init() {
    const json = swaggerJsdoc(options);
    const ui = swaggerUi.setup(json, { explorer: true });
    return {
      json,
      serve: swaggerUi.serve,
      ui,
    };
  },
} as const;
