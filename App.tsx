import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { enableScreens } from "react-native-screens";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context";
import Screen from "./src/screen";

enableScreens(true);
export default gestureHandlerRootHOC(
  function App() {
    return (
      <React.Suspense>
        <StatusBar style="auto" />
        <SafeAreaProvider>
          <PaperProvider>
            <NavigationContainer>
              <AuthProvider>
                <Screen />
              </AuthProvider>
            </NavigationContainer>
          </PaperProvider>
        </SafeAreaProvider>
      </React.Suspense>
    );
  },
  { flex: 1 }
);
