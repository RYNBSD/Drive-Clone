import React from "react";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { enableScreens } from "react-native-screens";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import ErrorBoundary from "./src/error-boundary";
import { QueryProvider } from "./src/provider";
import { AlertProvider, AuthProvider } from "./src/context";
import { Loading } from "./src/components";
import Screen from "./src/screen";

enableScreens(true);
export default gestureHandlerRootHOC(
  function App() {
    return (
      <React.Suspense>
        <StatusBar style="auto" />
        <SafeAreaProvider>
          <PaperProvider>
            <AlertProvider>
              <ErrorBoundary>
                <QueryProvider>
                  <NavigationContainer>
                    <AuthProvider>
                      <React.Suspense fallback={<Loading />}>
                        <Screen />
                      </React.Suspense>
                    </AuthProvider>
                  </NavigationContainer>
                </QueryProvider>
              </ErrorBoundary>
            </AlertProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </React.Suspense>
    );
  },
  { flex: 1 }
);
