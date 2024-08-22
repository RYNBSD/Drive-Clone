import type { File, Folder } from "../../types";
import type { Dispatch, FC, SetStateAction } from "react";
import { memo, useState, useTransition } from "react";
import { View } from "react-native";
import {
  Divider,
  IconButton,
  Menu,
  Text,
  TextInput,
  TouchableRipple,
} from "react-native-paper";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { handleAsync } from "../../util";

function DirectoryItemIcon({
  isFolder,
  state,
}: Pick<Props, "isFolder"> & StateProp) {
  return (
    !state.isUpdating &&
    (isFolder ? (
      <MaterialIcons name="folder" size={24} />
    ) : (
      <MaterialIcons name="image" size={24} />
    ))
  );
}

function DirectoryItemName({
  name,
  state,
  setState,
}: Pick<Props, "name"> & StateProp) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isPending, startTransaction] = useTransition();

  return state.isUpdating ? (
    <TextInput
      style={{ width: "100%" }}
      value={state.newName}
      onChangeText={(text) => {
        startTransaction(() => {
          const trimmed = text.trimStart();
          if (
            (trimmed.length === 0 && text.length > 0) ||
            trimmed === state.newName
          )
            return;
          setState((prev) => ({ ...prev, newName: trimmed }));
        });
      }}
    />
  ) : (
    <Text variant="labelLarge">{name}</Text>
  );
}

function DirectoryItemUpdateActions({ state, setState }: StateProp) {
  return (
    state.isUpdating && (
      <View style={{ flexDirection: "row" }}>
        <IconButton
          icon={(props) => <MaterialIcons {...props} name="close" size={24} />}
          onPress={async () => {
            await handleAsync(() => {
              setState((prev) => ({ ...prev, isUpdating: false, newName: "" }));
            });
          }}
        />
        <IconButton
          icon={(props) => <MaterialIcons {...props} name="check" size={22} />}
          onPress={async () => {
            await handleAsync(() => {});
          }}
        />
      </View>
    )
  );
}

function DirectoryItemMenu({
  name,
  state,
  setState,
}: Pick<Props, "name"> & StateProp) {
  return (
    !state.isUpdating && (
      <Menu
        visible={state.openMenu}
        onDismiss={() => setState((prev) => ({ ...prev, openMenu: false }))}
        anchor={
          <IconButton
            onPress={() => setState((prev) => ({ ...prev, openMenu: true }))}
            icon={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="dots-vertical"
                size={22}
              />
            )}
          />
        }
      >
        <Menu.Item
          title="Update"
          onPress={async () => {
            setState({ openMenu: false, isUpdating: true, newName: name });
          }}
        />
        <Menu.Item
          title="Delete"
          onPress={async () => {
            await handleAsync(() => {});
          }}
        />
      </Menu>
    )
  );
}

type State = {
  isUpdating: boolean;
  openMenu: boolean;
  newName: string;
};

type StateAction = Dispatch<SetStateAction<State>>;

type StateProp = {
  state: State;
  setState: StateAction;
};

const DirectoryItem: FC<Props> = ({ name, isFolder, isLast }) => {
  const [state, setState] = useState<State>({
    isUpdating: false,
    openMenu: false,
    newName: "",
  });

  return (
    <>
      <TouchableRipple
        style={{
          width: "100%",
          marginVertical: 5,
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              gap: 10,
            }}
          >
            <DirectoryItemIcon state={state} setState={setState} isFolder={isFolder} />
            <DirectoryItemName state={state} setState={setState} name={name} />
          </View>
          <DirectoryItemUpdateActions state={state} setState={setState} />
          <DirectoryItemMenu state={state} setState={setState} name={name} />
        </View>
      </TouchableRipple>
      {!isLast && <Divider />}
    </>
  );
};

type Props = { isFolder: boolean; isLast: boolean } & File & Folder;

export default memo(DirectoryItem);
