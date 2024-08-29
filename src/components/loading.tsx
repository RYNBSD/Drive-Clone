import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

export default function Loading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
