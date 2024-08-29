import type { File, Folder } from "../../types";
import { type FC, memo, useCallback, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import {
  ActivityIndicator,
  Divider,
  Snackbar,
  Text,
  useTheme,
} from "react-native-paper";
import { useFetch } from "../../hook";
import { request } from "../../util";
import DirectoryItem from "./Item";
import Actions from "./Actions";

const Directory: FC<Props> = ({
  path,
  folderId,
  disableActions = false,
  init = {},
}) => {
  const theme = useTheme();
  const [snackbarContent, setSnackbarContent] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const { isLoading, isFailed, isError, refetch } = useFetch(
    path,
    init,
    async (res) => {
      if (!res.ok || res.status === 204) return;
      const json = await res.json();
      setFolders(json?.data?.folders ?? []);
      setFiles(json?.data?.files ?? []);
    }
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const updateFolder = useCallback(async (id: number, body: FormData) => {
    const res = await request(`/user/folders/${id}`, { method: "PUT", body });

    const json = await res.json();
    setShowSnackbar(true);

    if (!res.ok)
      return setSnackbarContent(json?.data?.message ?? "Can't update folder");

    setSnackbarContent("Folder updated successfully");
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === json.data.folder.id ? json.data.folder : folder
      )
    );
  }, []);

  const deleteFolder = useCallback(async (id: number) => {
    const res = await request(`/user/folders/${id}`, { method: "DELETE" });

    setShowSnackbar(true);

    if (!res.ok) {
      const json = await res.json();
      setSnackbarContent(json?.data?.message ?? "Can't delete folder");
      return;
    }

    setSnackbarContent("Folder deleted successfully");
    setFolders((prev) => prev.filter((folder) => folder.id !== id));
  }, []);

  const updateFile = useCallback(async (id: number, body: FormData) => {
    const res = await request(`/user/files/${id}`, { method: "PUT", body });

    const json = await res.json();
    setShowSnackbar(true);

    if (!res.ok)
      return setSnackbarContent(json?.data?.message ?? "Can't update file");

    setSnackbarContent("File updated successfully");
    setFiles((prev) =>
      prev.map((file) =>
        file.id === json.data.file.id ? json.data.file : file
      )
    );
  }, []);

  const deleteFile = useCallback(async (id: number) => {
    const res = await request(`/user/files/${id}`, { method: "DELETE" });
    setShowSnackbar(true);
    if (!res.ok) {
      const json = await res.json();
      setSnackbarContent(json?.data?.message ?? "Can't delete file");
      return;
    }
    setSnackbarContent("File deleted successfully");
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {folders.length === 0 && files.length === 0 && (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          {isLoading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Text variant="headlineSmall">
              {isFailed
                ? "Failed to fetch"
                : isError
                ? "Error to fetch"
                : "No folders or files"}
            </Text>
          )}
        </View>
      )}
      {folders.length > 0 && (
        <View style={{ padding: 5 }}>
          <FlatList
            ListHeaderComponent={<Text variant="titleMedium">Folders</Text>}
            data={folders}
            renderItem={({ item }) => (
              <DirectoryItem
                {...item}
                type="none"
                isFolder
                isLast={item.id === folders[folders.length - 1].id}
                update={updateFolder}
                remove={deleteFolder}
              />
            )}
            keyExtractor={(item) => `${item.id}`}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      )}
      {folders.length > 0 && <Divider />}
      {files.length > 0 && (
        <View style={{ padding: 5 }}>
          <FlatList
            ListHeaderComponent={<Text variant="titleMedium">Files</Text>}
            data={files}
            renderItem={({ item }) => (
              <DirectoryItem
                {...item}
                isFolder={false}
                isLast={item.id === files[files.length - 1].id}
                update={updateFile}
                remove={deleteFile}
              />
            )}
            keyExtractor={(item) => `${item.id}`}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      )}
      {!disableActions && (
        <Actions
          folderId={folderId}
          setFolders={setFolders}
          setFiles={setFiles}
        />
      )}
      <Snackbar
        visible={showSnackbar}
        duration={Snackbar.DURATION_SHORT}
        onDismiss={() => {
          setShowSnackbar(false);
          setSnackbarContent("");
        }}
        action={{
          label: "Close",
          onPress: () => {
            setShowSnackbar(false);
            setSnackbarContent("");
          },
        }}
      >
        {snackbarContent}
      </Snackbar>
    </View>
  );
};

type Props = {
  path: string;
  folderId: number;
  disableActions?: boolean;
  init?: RequestInit;
};

export default memo(Directory);
