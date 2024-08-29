export type User = {
  id: number;
  username: string;
  image: number;
  email: string;
  password: string;
};

export type Folder = {
  id: number;
  name: string;
  isStarred: boolean;
  isPublic: boolean;
  userId: number;
};

export type FileType = "image" | "video" | "audio" | "pdf" | "none";

export type File = {
  id: number;
  name: string;
  isStarred: boolean;
  isPublic: boolean;
  mime?: string;
  type: FileType;
  userId: number;
  folderId?: number;
};
