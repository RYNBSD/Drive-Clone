import type { ChildrenProps } from "../types";
import { useEffect, useState } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useReactQueryDevTools } from '@dev-plugins/react-query';

export default function QueryProvider({ children }: ChildrenProps) {
  const [queryClient] = useState(new QueryClient());
  useReactQueryDevTools(queryClient);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        if (Platform.OS !== "web") {
          focusManager.setFocused(status === "active");
        }
      }
    );

    onlineManager.setEventListener((setOnline) => {
      return NetInfo.addEventListener((state) => {
        setOnline(!!state.isConnected);
      });
    });

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
