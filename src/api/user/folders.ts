import type { Folder, File } from "../../types";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { QUERY } from "../../constant";
import { object2urlQuery, request } from "../../util";

export function useGetAll() {
  return useInfiniteQuery<Folder[], Error>({
    initialPageParam: { lastId: 0 },
    queryKey: QUERY.FOLDER.ALL,
    async queryFn(context) {
      const urlQuery = object2urlQuery(context.pageParam as object);
      const res = await request(`/user/folders?${urlQuery}`, {
        signal: context.signal,
      });
      if (!res.ok || res.status === 204) return [];
      const json = await res.json();
      return json?.data?.folders ?? [];
    },
    getNextPageParam(lastPage) {
      return lastPage.length === 0
        ? null
        : { lastId: lastPage[lastPage.length - 1]?.id };
    },
  });
}

export function useGetOne(id: number) {
  return useQuery<{ folders: Folder[]; files: File[] }>({
    queryKey: QUERY.FOLDER.ONE(id),
    async queryFn(context) {
      const res = await request(`/user/folders/${id}`, {
        signal: context.signal,
      });
      if (!res.ok || res.status === 204) return { folders: [], files: [] };
      const json = await res.json();
      return {
        folders: json?.data?.folders ?? [],
        files: json?.data?.files ?? [],
      };
    },
  });
}

export function useGetStarred() {
  return useQuery({
    queryKey: QUERY.FOLDER.STARRED(),
    async queryFn(context): Promise<Folder[]> {
      const res = await request("/user/folders/starred", {
        signal: context.signal,
      });
      if (!res.ok || res.status === 204) return [];
      const json = await res.json();
      return json?.data?.folders ?? [];
    },
  });
}

export function useGetPublic() {
  return useQuery({
    queryKey: QUERY.FOLDER.PUBLIC(),
    async queryFn(context) {
      const res = await request("/user/folders/public", {
        signal: context.signal,
      });
      if (!res.ok || res.status === 204) return [];
      const json = await res.json();
      return json?.data?.folders ?? [];
    },
  });
}

export function useGetNestedFolders(id: number) {
  return useQuery({
    queryKey: QUERY.FOLDER.NESTED.FOLDERS(id),
    async queryFn(context): Promise<Folder[]> {
      const res = await request(`/user/folders/${id}/folders`, {
        signal: context.signal,
      });
      if (!res.ok || res.status === 204) return [];
      const json = await res.json();
      return json?.data?.folders ?? [];
    },
  });
}

export function useGetNestedFiles(id: number) {
  return useQuery({
    queryKey: QUERY.FOLDER.NESTED.FILES(id),
    async queryFn(context): Promise<File[]> {
      const res = await request(`/user/folders/${id}/files`, {
        signal: context.signal,
      });
      if (!res.ok || res.status === 204) return [];
      const json = await res.json();
      return json?.data?.files ?? [];
    },
  });
}

export function useGetInfo(id: number) {
  return useQuery({
    queryKey: QUERY.FOLDER.NESTED.FILES(id),
    async queryFn(context): Promise<Folder | null> {
      const res = await request(`/user/folders/${id}/info`, {
        signal: context.signal,
      });
      if (!res.ok || res.status === 204) return null;
      const json = await res.json();
      return json?.data?.folder ?? null;
    },
  });
}

export function usePatch(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(body: FormData) {
      const res = await request(`/user/folders/${id}`, {
        method: "PATCH",
        body,
      });
      if (!res.ok) return;
      await Promise.all([
        /* User */
        queryClient.invalidateQueries({ queryKey: QUERY.USER.RECENT() }),

        /* Folder */
        queryClient.invalidateQueries({ queryKey: QUERY.FOLDER.ONE(id) }),
        queryClient.invalidateQueries({ queryKey: QUERY.FOLDER.INFO(id) }),
        queryClient.invalidateQueries({ queryKey: QUERY.FOLDER.ALL }),
      ]);
    },
  });
}

export function useCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(body: FormData) {
      const res = await request("/user/folders", { method: "POST", body });
      if (!res.ok) return;
      await Promise.all([
        /* User */
        await queryClient.invalidateQueries({ queryKey: QUERY.USER.RECENT() }),

        /* Folder */
        await queryClient.invalidateQueries({ queryKey: QUERY.FOLDER.ALL }),
      ]);
    },
  });
}

export function useUpdate(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(body: FormData) {
      const res = await request(`/user/folders/${id}`, { method: "PUT", body });
      if (!res.ok) return;
      await Promise.all([
        /* User */
        queryClient.invalidateQueries({ queryKey: QUERY.USER.RECENT() }),

        /* Folder */
        queryClient.invalidateQueries({ queryKey: QUERY.FOLDER.ONE(id) }),
        queryClient.invalidateQueries({ queryKey: QUERY.FOLDER.INFO(id) }),
        queryClient.invalidateQueries({ queryKey: QUERY.FOLDER.ALL }),
      ]);
    },
  });
}

export function useDelete(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn(body: FormData) {
      const res = await request(`/user/folders/${id}`, {
        method: "DELETE",
        body,
      });
      if (!res.ok) return;
      await Promise.all([
        /* User */
        queryClient.invalidateQueries({ queryKey: QUERY.USER.RECENT() }),

        /* Folder */
        queryClient.invalidateQueries({ queryKey: QUERY.FOLDER.ONE(id) }),
        queryClient.invalidateQueries({ queryKey: QUERY.FOLDER.INFO(id) }),
        queryClient.invalidateQueries({ queryKey: QUERY.FOLDER.ALL }),
      ]);
    },
  });
}
