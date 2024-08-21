import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Text } from "react-native-paper";
import { ROUTER } from "../../../../constant";

const TopTab = createMaterialTopTabNavigator();

export default function Files() {
  return (
    <TopTab.Navigator>
      <TopTab.Screen
        name={ROUTER.APP.SCREENS.MENU.SCREENS.FILES.SCREENS.ALL}
        component={require("./All").default}
        options={{
          tabBarLabel: (props) => <Text {...props}>All</Text>,
        }}
      />
      <TopTab.Screen
        name={ROUTER.APP.SCREENS.MENU.SCREENS.FILES.SCREENS.FOLDER}
        component={require("./Folder").default}
        options={{
          tabBarLabel: (props) => <Text {...props}>Folder</Text>,
        }}
      />
      <TopTab.Screen
        name={ROUTER.APP.SCREENS.MENU.SCREENS.FILES.SCREENS.FILE}
        component={require("./File").default}
        options={{
          tabBarLabel: (props) => <Text {...props}>File</Text>,
        }}
      />
    </TopTab.Navigator>
  );
}
