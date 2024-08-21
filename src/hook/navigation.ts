import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { type ParamListBase, useNavigation } from "@react-navigation/native";

export const useStackNavigation = () =>
  useNavigation<NativeStackNavigationProp<ParamListBase>>();
