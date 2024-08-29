export default {
  ERROR: {
    HANDLERS: ["controller", "middleware", "socket", "passport", "server"],
  },
  HTTP: {
    REQUEST: {
      PARAMS: {
        ID: {
          FOLDER: "folderId",
          FILE: "fileId",
        },
      },
    },
  },
} as const;
