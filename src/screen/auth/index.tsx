import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { ROUTER } from "../../constant";

const Stack = createNativeStackNavigator();

export default function Auth() {
  const theme = useTheme();
  const safeAreInsets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        paddingTop: safeAreInsets.top,
        backgroundColor: theme.colors.background,
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name={ROUTER.AUTH.SCREENS.SIGN_UP}
          component={require("./SignUp").default}
        />
        <Stack.Screen
          name={ROUTER.AUTH.SCREENS.SIGN_IN}
          component={require("./SignIn").default}
        />
      </Stack.Navigator>
    </View>
  );
}
