import { MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  type ElementRef,
  memo,
  useCallback,
  useRef,
  useState,
  useTransition,
} from "react";
import { Button, Dialog, FAB, IconButton, TextInput } from "react-native-paper";
import { create } from "zustand";
import { handleAsync, request } from "../../../util";

type State = {
  openDialog: boolean;
};

type Action = {
  setState: (value: State) => void;
  toggleOpenDialog: () => void;
};

const useStore = create<State & Action>((set, get) => ({
  openDialog: false,
  setState: set,
  toggleOpenDialog: () => set({ openDialog: !get().openDialog }),
}));

function FooterDialog() {
  const [_isPending, startTransition] = useTransition();
  const [value, setValue] = useState("");

  const openDialog = useStore((state) => state.openDialog);
  const toggleOpenDialog = useStore((state) => state.toggleOpenDialog);

  const onClose = useCallback(() => {
    setValue("");
    toggleOpenDialog();
  }, [toggleOpenDialog]);

  return (
    <Dialog visible={openDialog} onDismiss={onClose}>
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
              formData.append("folderId", "1");
              const res = await request("/user/folders", {
                method: "POST",
                body: formData,
              });
              if (!res.ok) return;
              onClose();
            });
          }}
        >
          Create
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}

// eslint-disable-next-line react/display-name
const FooterBottomSheetFAB = memo(({ onPress }: { onPress: () => void }) => {
  const openDialog = useStore((state) => state.openDialog);
  return (
    <FAB
      label="New"
      icon={(props) => <MaterialIcons {...props} name="add" size={24} />}
      style={{
        display: openDialog ? "none" : "flex",
        position: "absolute",
        margin: 16,
        bottom: 80,
        right: 0,
      }}
      onPress={onPress}
    />
  );
});

function FooterBottomSheet() {
  const ref = useRef<ElementRef<typeof BottomSheet>>(null);
  const toggleOpenDialog = useStore((state) => state.toggleOpenDialog);

  const onPress = useCallback(() => ref.current?.expand(), []);

  return (
    <>
      <FooterBottomSheetFAB onPress={onPress} />
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
              toggleOpenDialog();
            }}
          />
          <IconButton
            mode="outlined"
            size={32}
            icon={(props) => <MaterialIcons {...props} name="upload" />}
            onPress={() => ref.current?.close()}
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

export default function MenuFooter() {
  return (
    <>
      <FooterDialog />
      <FooterBottomSheet />
    </>
  );
}
