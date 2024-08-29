import type { ChildrenProps } from "../types";
import { createContext, useCallback, useContext, useState } from "react";
import { Alert } from "react-native";
import { Snackbar, useTheme } from "react-native-paper";

type AlertValues = {
  alert: (mode: AlertMode, message: string, title?: string) => void;
};

const AlertContext = createContext<AlertValues | null>(null);

type AlertMode = "native" | "snackbar";

export default function AlertProvider({ children }: ChildrenProps) {
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState({
    visible: false,
    content: "",
  });

  const alert = useCallback(
    (mode: AlertMode, message: string, title: string = "Alert") => {
      if (mode === "native")
        return Alert.alert(title, message, [], {
          userInterfaceStyle: theme.dark ? "dark" : "light",
        });

      setSnackbar({ visible: true, content: message });
    },
    [theme.dark]
  );

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, content: "" })}
        action={{
          label: "Close",
          onPress: () => setSnackbar({ visible: false, content: "" }),
        }}
      >
        {snackbar.content}
      </Snackbar>
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);
