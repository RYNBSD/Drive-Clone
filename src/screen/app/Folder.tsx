import type { Folder as TFolder, NavigationProps } from "../../types";
import { useState } from "react";
import { Appbar, Snackbar } from "react-native-paper";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Directory } from "../../components";
import { ROUTER } from "../../constant";
import { request } from "../../util";
import { useFetch } from "../../hook";

export default function Folder({ navigation, route }: NavigationProps) {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarContent, setSnackbarContent] = useState("");
  const [folder, setFolder] = useState<TFolder | null>(null);

  useFetch(`/user/folders/${route.params!.folderId}/info`, {}, async (res) => {
    const json = await res.json();
    setFolder(json.data.folder);
  });

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() =>
            navigation.canGoBack()
              ? navigation.goBack()
              : navigation.navigate(ROUTER.APP.SCREENS.MENU.NAME)
          }
        />
        <Appbar.Content title={route.params!.name} />
        <Appbar.Action
          icon={(props) => (
            <MaterialCommunityIcons
              {...props}
              name={folder?.isStarred ? "star-outline" : "star-off-outline"}
            />
          )}
          onPress={async () => {
            const formData = new FormData();
            formData.append("isStarred", folder?.isStarred ? "" : "1");
            const res = await request(
              `/user/folders/${route.params!.folderId}`,
              {
                method: "PATCH",
                body: formData,
              }
            );
            const json = await res.json();
            if (!res.ok) return;
            setFolder(json?.data?.folder);
          }}
        />
        <Appbar.Action
          icon={(props) => (
            <MaterialIcons
              {...props}
              name={folder?.isPublic ? "public" : "public-off"}
            />
          )}
          onPress={async () => {
            const formData = new FormData();
            formData.append("isPublic", folder?.isPublic ? "" : "1");
            const res = await request(
              `/user/folders/${route.params!.folderId}`,
              {
                method: "PATCH",
                body: formData,
              }
            );
            const json = await res.json();
            if (!res.ok) return;
            setFolder(json?.data?.folder);
          }}
        />
      </Appbar.Header>
      <Snackbar
        visible={showSnackbar}
        duration={Snackbar.DURATION_SHORT}
        onDismiss={() => {
          setSnackbarContent("");
          setShowSnackbar(true);
        }}
        action={{
          label: "Close",
          onPress() {
            setSnackbarContent("");
            setShowSnackbar(true);
          },
        }}
      >
        {snackbarContent}
      </Snackbar>
      <Directory
        path={`/user/folders/${route.params!.folderId}`}
        folderId={route.params!.folderId}
      />
    </>
  );
}
