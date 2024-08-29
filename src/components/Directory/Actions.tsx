import type { Dispatch, ElementRef, FC, SetStateAction } from "react";
import type { File, Folder } from "../../types";
import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { memo, useCallback, useRef, useState, useTransition } from "react";
import {
  Button,
  Dialog,
  FAB,
  IconButton,
  Snackbar,
  TextInput,
} from "react-native-paper";
import { handleAsync, request } from "../../util";
import { getDocumentAsync } from "expo-document-picker";

function ActionDialog({
  folderId,
  state,
  toggleDialog,
  openSnackbar,
  setFolders,
}: Pick<Props, "folderId" | "setFolders"> &
  Pick<StateProps, "state"> &
  StateActions) {
  const [_isPending, startTransition] = useTransition();
  const [value, setValue] = useState("");

  const onClose = useCallback(() => {
    setValue("");
    toggleDialog();
  }, [toggleDialog]);

  return (
    <Dialog visible={state.openDialog} onDismiss={onClose}>
      <Dialog.Title>New folder</Dialog.Title>
      <Dialog.Content>
        <TextInput
          mode="outlined"
          value={value}
          placeholder="Folder name"
          onChangeText={(text) => {
            startTransition(() => {
              const trimmed = text.trimStart();
              if (
                (trimmed.length === 0 && text.length > 0) ||
                trimmed === value
              )
                return;
              setValue(trimmed);
            });
          }}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onClose}>Cancel</Button>
        <Button
          onPress={async () => {
            await handleAsync(async () => {
              const formData = new FormData();
              formData.append("name", value);
              formData.append("folderId", `${folderId}`);
              const res = await request("/user/folders", {
                method: "POST",
                body: formData,
              });
              const json = await res.json();
              onClose();

              if (!res.ok)
                return openSnackbar(
                  json?.data?.message ?? "Can't create folder"
                );

              setFolders((prev) => [json.data.folder, ...prev]);
            });
          }}
        >
          Create
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}

function ActionBottomSheetFAB({
  state,
  onPress,
}: Pick<StateProps, "state"> & {
  onPress: () => void;
}) {
  return (
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
      onPress={onPress}
    />
  );
}

function ActionBottomSheet({
  folderId,
  setFiles,
  state,
  toggleDialog,
}: Pick<Props, "folderId" | "setFiles"> &
  Pick<StateProps, "state"> &
  Pick<StateActions, "toggleDialog">) {
  const ref = useRef<ElementRef<typeof BottomSheet>>(null);
  const onPress = useCallback(() => ref.current?.expand(), []);

  return (
    <>
      <ActionBottomSheetFAB state={state} onPress={onPress} />
      <BottomSheet ref={ref} snapPoints={["25%"]} enablePanDownToClose>
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
              ref.current?.close();
              toggleDialog();
            }}
          />
          <IconButton
            mode="outlined"
            size={32}
            icon={(props) => <MaterialIcons {...props} name="upload" />}
            onPress={async () => {
              ref.current?.close();
              await handleAsync(async () => {
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
                if (!res.ok) return;

                const json = await res.json();
                setFiles(json.data.files);
              });
            }}
          />
          <IconButton
            mode="outlined"
            size={32}
            icon={(props) => <MaterialIcons {...props} name="camera-alt" />}
            onPress={() => ref.current?.close()}
          />
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

type State = {
  openDialog: boolean;
  showSnackbar: boolean;
  snackbarContent: string;
};

type StateActions = {
  toggleDialog: () => void;
  openSnackbar: (message: string) => void;
};

type StateProps = {
  state: State;
  setState: Dispatch<SetStateAction<State>>;
};

const Actions: FC<Props> = ({ folderId, setFolders, setFiles }) => {
  const [state, setState] = useState<State>({
    openDialog: false,
    showSnackbar: false,
    snackbarContent: "",
  });

  const toggleDialog = useCallback(
    () => setState((prev) => ({ ...prev, openDialog: !prev.openDialog })),
    []
  );

  const openSnackbar = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      showSnackbar: true,
      snackbarContent: message,
    }));
  }, []);

  return (
    <>
      <ActionDialog
        folderId={folderId}
        state={state}
        toggleDialog={toggleDialog}
        openSnackbar={openSnackbar}
        setFolders={setFolders}
      />
      <ActionBottomSheet
        folderId={folderId}
        setFiles={setFiles}
        toggleDialog={toggleDialog}
        state={state}
      />
      <Snackbar
        visible={state.showSnackbar}
        duration={Snackbar.DURATION_SHORT}
        onDismiss={() => {
          setState((prev) => ({
            ...prev,
            showSnackbar: false,
            snackbarContent: "",
          }));
        }}
        action={{
          label: "Close",
          onPress() {
            setState((prev) => ({
              ...prev,
              showSnackbar: false,
              snackbarContent: "",
            }));
          },
        }}
      >
        {state.snackbarContent}
      </Snackbar>
    </>
  );
};

type Props = {
  folderId: number;
  setFolders: Dispatch<SetStateAction<Folder[]>>;
  setFiles: Dispatch<SetStateAction<File[]>>;
};

export default memo(Actions);
