import path from "node:path";

export function parseName(name: string) {
  const trimmed = name.trim();
  if (trimmed !== path.basename(trimmed)) return "";
  return trimmed;
}

export function isFolderNameSafe(name: string) {
  return /([a-zA-Z0-9]|_|-|\s)+/g.test(name);
}

export function isFileNameSafe(name: string) {
  return /([a-zA-Z0-9]|_|.|-|\s)+/g.test(name);
}
