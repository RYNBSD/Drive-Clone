import type { File, Folder } from "../../../types";
import { useState } from "react";
import { View, FlatList } from "react-native";
import { ActivityIndicator, Divider, Text, useTheme } from "react-native-paper";
import { useFetch } from "../../../hook";
import { ImageItem } from "../../../components";

export default function Home() {
  const theme = useTheme();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const { isLoading, isFailed, isError } = useFetch(
    "/user/recent",
    {},
    async (res) => {
      if (!res.ok || res.status === 204) return;
      const json = await res.json();
      setFolders(json.data.folders);
      setFiles(json.data.files);
    }
  );

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
            renderItem={({ item }) => <Text>{item.name}</Text>}
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
              <ImageItem
                {...item}
                isLast={item.id === files[files.length - 1].id}
              />
            )}
            keyExtractor={(item) => `${item.id}`}
          />
        </View>
      )}
    </View>
  );
}
