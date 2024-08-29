import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { MaterialIcons } from "@expo/vector-icons";
import { MenuHeader } from "../../../components/app/menu";
import { ROUTER } from "../../../constant";

const BottomTab = createMaterialBottomTabNavigator();

export default function Menu() {
  return (
    <>
      <MenuHeader />
      <BottomTab.Navigator>
        <BottomTab.Screen
          name={ROUTER.APP.SCREENS.MENU.SCREENS.HOME}
          component={require("./Home").default}
          options={{
            tabBarIcon: (props) => (
              <MaterialIcons {...props} name="home" size={24} />
            ),
          }}
        />
        <BottomTab.Screen
          name={ROUTER.APP.SCREENS.MENU.SCREENS.STARRED}
          component={require("./Starred").default}
          options={{
            tabBarIcon: (props) => (
              <MaterialIcons {...props} name="star-border" size={24} />
            ),
          }}
        />
        <BottomTab.Screen
          name={ROUTER.APP.SCREENS.MENU.SCREENS.PUBLIC}
          component={require("./Public").default}
          options={{
            tabBarIcon: (props) => (
              <MaterialIcons {...props} name="public" size={24} />
            ),
          }}
        />
        <BottomTab.Screen
          name={ROUTER.APP.SCREENS.MENU.SCREENS.PROFILE}
          component={require("./Profile").default}
          options={{
            tabBarIcon: (props) => (
              <MaterialIcons {...props} name="person" size={24} />
            ),
          }}
        />
      </BottomTab.Navigator>
    </>
  );
}
