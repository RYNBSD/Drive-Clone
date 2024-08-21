import type { NavigationProps } from "../../types";
import { useDeferredValue, useEffect, useState, useTransition } from "react";
import { Alert, View } from "react-native";
import {
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import isEmail from "validator/lib/isEmail";
import isEmpty from "validator/lib/isEmpty";
import { create } from "zustand";
import { useAuth } from "../../context";
import { handleAsync, object2formData } from "../../util";

type State = {
  email: string;
  password: string;
};

type Action = {
  setFields: (value: State) => void;
  onChange: <T extends keyof State>(key: T, value: State[T]) => void;
  reset: () => void;
};

const initialState: State = {
  email: "",
  password: "",
} as const;

const useFields = create<State & Action>((set) => ({
  ...initialState,
  setFields: (value) => set(value),
  onChange: (key, value) => set({ [key]: value }),
  reset: () => set(initialState),
}));

function EmailField() {
  const [_isPending, startTransition] = useTransition();
  const onChange = useFields((state) => state.onChange);
  const email = useFields((state) => state.email);

  return (
    <View style={{ width: "100%" }}>
      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={(text) => {
          startTransition(() => {
            const trimmed = text.trimStart();
            if ((trimmed.length === 0 && text.length > 0) || trimmed === email)
              return;
            onChange("email", trimmed);
          });
        }}
      />
      <HelperText type="error" visible={!isEmail(email)}>
        Email address is invalid!
      </HelperText>
    </View>
  );
}

function PasswordField() {
  const [_isPending, startTransition] = useTransition();
  const onChange = useFields((state) => state.onChange);
  const password = useFields((state) => state.password);

  return (
    <View style={{ width: "100%" }}>
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        secureTextEntry
        onChangeText={(text) => {
          startTransition(() => {
            const trimmed = text.trimStart();
            if (
              (trimmed.length === 0 && text.length > 0) ||
              trimmed === password
            )
              return;
            onChange("password", trimmed);
          });
        }}
      />
      <HelperText type="error" visible={isEmpty(password)}>
        Password required!
      </HelperText>
    </View>
  );
}

function SubmitButton() {
  const { signIn } = useAuth()!;
  const [disabled, setDisabled] = useState(false);
  const { email, password } = useFields((state) => state);

  return (
    <Button
      mode="contained"
      disabled={disabled}
      style={{ width: "100%", borderRadius: 12 }}
      onPress={() =>
        handleAsync(
          async () => {
            setDisabled(true);

            if (email.length === 0)
              return Alert.alert("Missing", "Make sure to add email");
            if (password.length === 0)
              return Alert.alert("Missing", "Make sure to add password");
            if (!isEmail(email))
              return Alert.alert("Invalid", "Make to add a valid email");

            const formData = object2formData({ email, password });
            await signIn(formData);
          },
          null,
          null,
          () => setDisabled(false)
        )
      }
    >
      Submit
    </Button>
  );
}

export default function SignIn({ navigation }: NavigationProps) {
  const theme = useTheme();
  const resetFields = useFields((state) => state.reset);

  useEffect(() => {
    return () => {
      resetFields();
    };
  }, [resetFields]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <Card
        mode="contained"
        style={{ width: "100%", backgroundColor: theme.colors.background }}
      >
        <Card.Title title="Sign in" titleVariant="headlineLarge" />
        <Card.Content>
          <EmailField />
          <PasswordField />
        </Card.Content>
        <Card.Actions style={{ flexDirection: "column", gap: 10 }}>
          <SubmitButton />
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text>Already have an account?</Text>
            <Button
              mode="text"
              onPress={() => {
                navigation.navigate("SignUp");
              }}
            >
              Sign up
            </Button>
          </View>
        </Card.Actions>
      </Card>
    </View>
  );
}
