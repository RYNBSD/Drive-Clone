import type { File, Folder } from "../../types";
import { type FC, memo, useCallback, useState } from "react";
import { View, FlatList } from "react-native";
import { ActivityIndicator, Divider, Text, useTheme } from "react-native-paper";
import { useFetch, useStackNavigation } from "../../hook";
import DirectoryItem from "./Item";

const Directory: FC<Props> = ({ path, init = {} }) => {
  const theme = useTheme();
  const stackNavigation = useStackNavigation();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const { isLoading, isFailed, isError } = useFetch(path, init, async (res) => {
    if (!res.ok || res.status === 204) return;
    const json = await res.json();
    setFolders(json.data.folders);
    setFiles(json.data.files);
  });

  const updateFolder = useCallback(async (id: number) => {}, []);
  const deleteFolder = useCallback(async (id: number) => {}, []);

  const updateFile = useCallback(async (id: number) => {}, []);
  const deleteFile = useCallback(async (id: number) => {}, []);

  if (folders.length === 0 && files.length === 0)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Text variant="headlineSmall">
            {isFailed
              ? "Failed to fetch"
              : isError
              ? "Error ro fetch"
              : "No folders or files"}
          </Text>
        )}
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {folders.length > 0 && (
        <View style={{ padding: 5 }}>
          <Text variant="titleMedium">Folders</Text>
          <FlatList
            data={folders}
            renderItem={({ item }) => (
              <DirectoryItem
                {...item}
                type="none"
                isFolder
                isLast={item.id === folders[folders.length - 1].id}
                updateFolder={updateFolder}
                deleteFolder={deleteFolder}
              />
            )}
            keyExtractor={(item) => `${item.id}`}
          />
        </View>
      )}
      {folders.length > 0 && <Divider />}
      {files.length > 0 && (
        <View style={{ padding: 5 }}>
          <Text variant="titleMedium">files</Text>
          <FlatList
            data={files}
            renderItem={({ item }) => (
              <DirectoryItem
                {...item}
                isFolder={false}
                isLast={item.id === files[files.length - 1].id}
                updateFile={updateFile}
                deleteFile={deleteFile}
              />
            )}
            keyExtractor={(item) => `${item.id}`}
          />
        </View>
      )}
    </View>
  );
};

type Props = {
  path: string;
  init?: RequestInit;
};

export default memo(Directory);
