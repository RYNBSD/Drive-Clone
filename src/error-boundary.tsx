import type { ChildrenProps } from "./types";
import { Component, type ErrorInfo } from "react";
import { reloadAppAsync } from "expo";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";

type State = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

export default class ErrorBoundary extends Component<ChildrenProps, State> {
  constructor(props: ChildrenProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    return this.state.hasError || this.state.error ? (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text variant="bodyLarge">
          {this.state.error ? this.state.error.message : "Error"}
        </Text>
        <Button mode="contained" onPress={() => reloadAppAsync()}>
          Reload app
        </Button>
      </View>
    ) : (
      this.props.children
    );
  }
}
