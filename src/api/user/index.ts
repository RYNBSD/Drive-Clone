import type { File, Folder, User } from "../../types";
import {
  type InfiniteData,
  type QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { FetchError } from "../../error";
import { object2urlQuery, request } from "../../util";
import { QUERY } from "../../constant";

type FoldersFiles = {
  folders: Folder[];
  files: File[];
};

type InitialParams = {
  lastFolderId: number;
  lastFileId: number;
};

export function useSearch(options?: object) {
  return useInfiniteQuery<
    FoldersFiles,
    FetchError,
    InfiniteData<FoldersFiles, number>,
    QueryKey,
    InitialParams
  >({
    initialPageParam: { lastFolderId: 0, lastFileId: 0 },
    queryKey: QUERY.USER.SEARCH(options),
    async queryFn(context) {
      const urlQuery = object2urlQuery({
        ...options,
        ...context.pageParam,
      });
      const res = await request(`/user/search?${urlQuery}`, {
        signal: context.signal,
      });
      if (res.status === 204) return { folders: [], files: [] };

      const json = await res.json();
      if (!res.ok)
        throw new FetchError(json?.data?.message ?? "Can't search", res.status);
      return {
        folders: json?.data?.folders ?? [],
        files: json?.data?.files ?? [],
      };
    },
    getNextPageParam(lastPage) {
      return lastPage.folders.length === 0 && lastPage.files.length === 0
        ? null
        : {
            lastFolderId:
              lastPage.folders[lastPage.folders.length - 1]?.id ?? 0,
            lastFileId: lastPage.files[lastPage.files.length - 1]?.id ?? 0,
          };
    },
  });
}

export function useRecent() {
  return useInfiniteQuery<
    FoldersFiles,
    FetchError,
    InfiniteData<FoldersFiles, number>,
    QueryKey,
    InitialParams
  >({
    initialPageParam: { lastFolderId: 0, lastFileId: 0 },
    queryKey: QUERY.USER.RECENT(),
    async queryFn(context) {
      const urlQuery = object2urlQuery({
        ...context.pageParam,
      });
      const res = await request(`/user/recent?${urlQuery}`, {
        signal: context.signal,
      });
      if (res.status === 204) return { folders: [], files: [] };

      const json = await res.json();
      if (!res.ok)
        throw new FetchError(
          json?.data?.message ?? "Can't get recent folders or files",
          res.status
        );
      return {
        folders: json?.data?.folders ?? [],
        files: json?.data?.files ?? [],
      };
    },
    getNextPageParam(lastPage) {
      return lastPage.folders.length === 0 && lastPage.files.length === 0
        ? null
        : {
            lastFolderId:
              lastPage.folders[lastPage.folders.length - 1]?.id ?? 0,
            lastFileId: lastPage.files[lastPage.files.length - 1]?.id ?? 0,
          };
    },
  });
}

export function useProfile() {
  return useQuery<User | null, FetchError, User | null>({
    queryKey: QUERY.USER.PROFILE,
    async queryFn(context) {
      const res = await request("/user/recent", {
        signal: context.signal,
      });
      if (res.status === 204) return null;
      const json = await res.json();
      if (!res.ok)
        throw new FetchError(
          json?.data?.message ?? "Cen't fetch profile",
          res.status
        );
      return json?.data?.user ?? null;
    },
  });
}

export function useUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(body: FormData) {
      const res = await request("/user", { method: "PUT", body });
      if (!res.ok) {
        const json = await res.json();
        throw new FetchError(
          json?.data?.message ?? "Can't update profile",
          res.status
        );
      }
      await queryClient.invalidateQueries({ queryKey: QUERY.USER.PROFILE });
    },
  });
}

export function useDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(body: FormData) {
      const res = await request("/user", { method: "DELETE", body });
      if (!res.ok) {
        const json = await res.json();
        throw new FetchError(
          json?.data?.message ?? "Can't delete profile",
          res.status
        );
      }
      await queryClient.invalidateQueries({ queryKey: QUERY.USER.PROFILE });
    },
  });
}

export * as folders from "./folders";
export * as files from "./files";
