import type { NotifyOnChangeProps } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

export function useQueryFocusAware(notifyOnChangeProps?: NotifyOnChangeProps) {
  const focusedRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      focusedRef.current = true;

      return () => {
        focusedRef.current = false;
      };
    }, [])
  );

  return () => focusedRef.current;
}
