import { useState } from "react";
import { useFetch } from "../../hook";
import type { NavigationProps } from "../../types";
import { View, Text } from "react-native";

export default function Folder({ route }: NavigationProps) {
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])

  const {} = useFetch("", {}, async (res) => {
    if (!res.ok || res.status === 204) return;

  });

  return (
    <View>
      <Text>Folder</Text>
    </View>
  );
}
