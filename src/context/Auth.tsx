import type { ChildrenProps, User } from "../types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { Alert } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { handleAsync, jwt, request } from "../util";
import { ROUTER } from "../constant";
import { useStackNavigation } from "../hook";

type AuthValue = {
  user: User | null;
  signUp: (body: FormData) => Promise<void>;
  signIn: (body: FormData) => Promise<void>;
  signOut: () => Promise<void>;
  update: () => Promise<void>;
  remove: () => Promise<void>;
  onChange: <T extends keyof Omit<User, "id" | "image">>(
    key: T,
    value: User[T]
  ) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

SplashScreen.preventAutoHideAsync();

export default function AuthProvider({ children }: ChildrenProps) {
  const stackNavigation = useStackNavigation();
  const [_isPending, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);

  const me = useCallback(async () => {
    const res = await request("/auth/me", { method: "POST" });
    if (!res.ok) return;
    const json = await res.json();
    setUser(json.data.user);
  }, []);

  useEffect(() => {
    handleAsync(me, null, null, () => SplashScreen.hideAsync());
  }, [me]);

  const signUp = useCallback(async (body: FormData) => {
    const res = await request("/auth/sign-up", { method: "POST", body });
    const json = await res.json();
    if (!res.ok) return Alert.alert("Error", json?.message ?? "Can't sign up");
    stackNavigation.navigate(ROUTER.AUTH.SCREENS.SIGN_IN);
  }, [stackNavigation]);

  const signIn = useCallback(async (body: FormData) => {
    const res = await request("/auth/sign-in", { method: "POST", body });
    const json = await res.json();
    if (!res.ok) return Alert.alert("Error", json?.message ?? "Can't sign in");
    setUser(json.data.user);
  }, []);

  const signOut = useCallback(async () => {
    const res = await request("/auth/sign-out", { method: "POST" });
    if (res.ok) {
      await jwt.delete();
      setUser(null);
    } else {
      const json = await res.json();
      Alert.alert("Error", json?.message ?? "Can't sign out");
    }
  }, []);

  const update = useCallback(async () => {}, []);

  const remove = useCallback(async () => {}, []);

  const onChange = useCallback(
    <T extends keyof Omit<User, "id" | "image">>(key: T, value: User[T]) => {
      startTransition(() => {
        setUser((prev) => {
          if (prev === null) return prev;
          const trimmed = value.trimStart();
          return (trimmed.length === 0 && value.length > 0) ||
            trimmed === prev[key]
            ? prev
            : { ...prev, [key]: trimmed };
        });
      });
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{ user, signUp, signIn, signOut, update, remove, onChange }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
