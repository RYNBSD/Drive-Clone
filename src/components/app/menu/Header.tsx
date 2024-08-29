import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Appbar, Menu } from "react-native-paper";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useStackNavigation } from "../../../hook";
import { handleAsync } from "../../../util";
import { useAuth } from "../../../context";
import { ROUTER } from "../../../constant";

function MenuAppBar() {
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
  const stackNavigation = useStackNavigation();
  return (
    <Appbar.Header>
      <Appbar.Content title="Drive" />
      <Appbar.Action
        icon={(props) => <MaterialIcons {...props} name="search" />}
        onPress={() => stackNavigation.navigate(ROUTER.APP.SCREENS.SEARCH.NAME)}
      />
      <MenuAppBar />
    </Appbar.Header>
  );
}
