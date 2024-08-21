import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context";
import { ROUTER } from "../constant";

const Stack = createNativeStackNavigator();

function Routes() {
  const { user } = useAuth()!;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user === null ? (
        <Stack.Screen name={ROUTER.AUTH.NAME} component={require("./auth").default} />
      ) : (
        <Stack.Screen name={ROUTER.APP.NAME} component={require("./app").default} />
      )}
    </Stack.Navigator>
  );
}

export default function Screen() {
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        paddingBottom: safeAreaInsets.bottom,
        paddingLeft: safeAreaInsets.left,
        paddingRight: safeAreaInsets.right,
      }}
    >
      <Routes />
    </View>
  );
}
