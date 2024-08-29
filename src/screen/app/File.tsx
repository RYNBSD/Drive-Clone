// eslint-disable-next-line import/no-unresolved
import { BASE_URL } from "@env";
import type { File, NavigationProps } from "../../types";
import { useState } from "react";
import { View } from "react-native";
import { useFetch } from "../../hook";
import { global } from "../../components";
import { jwt } from "../../util";
import { ActivityIndicator } from "react-native-paper";

export default function File({ route }: NavigationProps) {
  const [file, setFile] = useState<File | null>(null);

  useFetch(`/user/files/${route.params!.fileId}/info`, {}, async (res) => {
    if (!res.ok) return;
    const json = await res.json();
    setFile(json.data.file);
  });

  if (file === null)
    return (
      <View
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <View style={{ width: "100%", height: "100%" }}>
      {file.type === "image" && <ImageFile {...file} />}
    </View>
  );
}

function NoneFile() {}

function ImageFile({ name, id }: File) {
  return (
    <global.Image
      width="100%"
      height="100%"
      source={{
        uri: `${BASE_URL}/user/files/${id}`,
        headers: {
          Authorization: jwt.bearer(),
        },
      }}
      alt={name}
      contentFit="contain"
    />
  );
}

function AudioFile() {}

function VideoFile() {}

function PdfFile() {}
