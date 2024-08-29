export const USER = {
  PROFILE: ["user"],
  SEARCH: (options?: object) => [...USER.PROFILE, options] as const,
  RECENT: () => [...USER.PROFILE, "recent"] as const,
} as const;

export const FOLDER = {
  ALL: ["folders"],
  ONE: (id: number) => [...FOLDER.ALL, `${id}`] as const,
  PUBLIC: () => [...FOLDER.ALL, "public"] as const,
  STARRED: () => [...FOLDER.ALL, "starred"] as const,
  INFO: (id: number) => [...FOLDER.ALL, `${id}`, "info"] as const,
  NESTED: {
    FOLDERS: (id: number) => [...FOLDER.ALL, `${id}`, "folders"] as const,
    FILES: (id: number) => [...FOLDER.ALL, `${id}`, "files"] as const,
  },
} as const;

export const FILE = {} as const;
