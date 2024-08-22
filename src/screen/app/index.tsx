import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTER } from "../../constant";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={ROUTER.APP.SCREENS.MENU.NAME}
        component={require("./menu").default}
      />
      <Stack.Screen
        name={ROUTER.APP.SCREENS.FILE}
        component={require("./File").default}
      />
      <Stack.Screen
        name={ROUTER.APP.SCREENS.FOLDER}
        component={require("./Folder").default}
      />
    </Stack.Navigator>
  );
}
