import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context";
import { Appbar, Menu } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { handleAsync } from "../../../util";

function HeaderAppBar() {
  const safeAreaInsets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const { signOut } = useAuth()!;

  return (
    <Menu
      style={{ paddingTop: safeAreaInsets.top }}
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Appbar.Action
          icon={(props) => (
            <MaterialCommunityIcons
              {...props}
              name="dots-vertical"
              size={24}
              onPress={() => setVisible(true)}
            />
          )}
        />
      }
    >
      <Menu.Item
        title="Sign out"
        onPress={async () => {
          await handleAsync(async () => {
            setVisible(false);
            await signOut();
          });
        }}
      />
    </Menu>
  );
}

export default function MenuHeader() {
  return (
    <Appbar.Header>
      <Appbar.Content title="Drive" />
      <HeaderAppBar />
    </Appbar.Header>
  );
}
