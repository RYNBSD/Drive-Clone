import * as SecureStore from "expo-secure-store";

export const AUTHORIZATION = "authorization";

export const jwt = {
  get() {
    return SecureStore.getItem(AUTHORIZATION) ?? "";
  },
  set(token: string) {
    SecureStore.setItem(AUTHORIZATION, token);
  },
  bearer() {
    return `Bearer ${this.get()}`;
  },
  async delete() {
    await SecureStore.deleteItemAsync(AUTHORIZATION)
  },
} as const;
