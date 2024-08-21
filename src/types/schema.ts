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
  isStared: boolean;
  userId: number;
};

export type FileType = "image" | "video" | "audio" | "pdf" | "none";

export type File = {
  id: number;
  name: string;
  isStared: boolean;
  mime?: string;
  type: FileType;
  userId: number;
  folderId?: number;
};
