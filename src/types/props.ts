import type { ReactNode } from "react";
import type {
  NavigationProp,
  ParamListBase,
  RouteProp,
} from "@react-navigation/native";

export type ChildrenProps = { children: ReactNode };

export type NavigationProps<T extends ParamListBase = ParamListBase> = {
  navigation: NavigationProp<T>;
  route: RouteProp<T>;
};
