import type { ElementRef } from "react"
import type { ChildrenProps } from "../types";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { getDocumentAsync } from "expo-document-picker";
import { FAB, IconButton } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { request } from "../util";

const ActionContext = createContext(null);

export default function ActionProvider({ children }: ChildrenProps) {
  const bottomSheetRef = useRef<ElementRef<typeof BottomSheet>>(null);
  const [state, setState] = useState({
    openDialog: false,
    showSnackbar: false,
  });

  const onUploadFiles = useCallback(async (folderId: number) => {
    const documents = await getDocumentAsync({ multiple: true });
    if (documents.canceled || documents.assets.length === 0) return;

    const formData = new FormData();
    formData.append("folderId", `${folderId}`);

    documents.assets.forEach((document) => {
      // @ts-ignore
      formData.append("files", {
        uri: document.uri,
        name: document.name,
        type: document.mimeType,
      });
    });

    const res = await request(`/user/files`, {
      method: "POST",
      body: formData,
    });

    return res;
  }, []);

  return (
    <ActionContext.Provider value={null}>
      {children}
      <FAB
        label="New"
        icon={(props) => <MaterialIcons {...props} name="add" size={24} />}
        style={{
          display: state.openDialog ? "none" : "flex",
          position: "absolute",
          margin: 16,
          bottom: 0,
          right: 0,
        }}
        // onPress={onPress}
      />
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["25%"]}
        enablePanDownToClose
      >
        <BottomSheetView
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <IconButton
            mode="outlined"
            size={32}
            icon={(props) => <MaterialIcons {...props} name="folder" />}
            onPress={() => {
              bottomSheetRef.current?.close();
              setState((prev) => ({ ...prev, openDialog: true }));
            }}
          />
          <IconButton
            mode="outlined"
            size={32}
            icon={(props) => <MaterialIcons {...props} name="upload" />}
            onPress={async () => {
              bottomSheetRef.current?.close();
            }}
          />
          <IconButton
            mode="outlined"
            size={32}
            icon={(props) => <MaterialIcons {...props} name="camera-alt" />}
            onPress={() => bottomSheetRef.current?.close()}
          />
        </BottomSheetView>
      </BottomSheet>
    </ActionContext.Provider>
  );
}

export const useAction = () => useContext(ActionContext);
