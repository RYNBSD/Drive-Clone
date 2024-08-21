import type { NavigationProps } from "../../types";
import { useEffect, useState, useTransition } from "react";
import {
  Button,
  Card,
  HelperText,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { Alert, View } from "react-native";
import isEmail from "validator/lib/isEmail";
import isEmpty from "validator/lib/isEmpty";
import isStrongPassword from "validator/lib/isStrongPassword";
import { create } from "zustand";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import { useAuth } from "../../context";
import { handleAsync, object2formData } from "../../util";
import { store } from "../../hook";
import { Image } from "../../components/global";

type State = {
  username: string;
  email: string;
  password: string;
};

type Action = {
  setFields: (value: State) => void;
  onChange: <T extends keyof State>(key: T, value: State[T]) => void;
  reset: () => void;
};

const initialState: State = {
  username: "",
  email: "",
  password: "",
} as const;

const useFields = create<State & Action>((set) => ({
  ...initialState,
  setFields: (value) => set(value),
  onChange: (key, value) => set({ [key]: value }),
  reset: () => set(initialState),
}));

function ImagePicker() {
  const theme = useTheme();
  const { image, setImage } = store.useImagePicker((state) => state);

  return (
    <TouchableRipple
      rippleColor={theme.colors.background}
      onPress={async () => {
        await handleAsync(async () => {
          const result = await launchImageLibraryAsync({
            mediaTypes: MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
          });
          if (!result.canceled) setImage(result.assets[0]);
        });
      }}
    >
      <Image
        width={150}
        height={150}
        alt="default profile image"
        source={
          image !== null
            ? { uri: image.uri }
            : require("../../../assets/image/default-profile-image.webp")
        }
        style={{ borderRadius: 75 }}
        contentFit="cover"
        showSpinner
      />
    </TouchableRipple>
  );
}

function UsernameField() {
  const [_isPending, startTransition] = useTransition();
  const onChange = useFields((state) => state.onChange);
  const username = useFields((state) => state.username);

  return (
    <View style={{ width: "100%" }}>
      <TextInput
        mode="outlined"
        label="Username"
        value={username}
        onChangeText={(text) => {
          startTransition(() => {
            const trimmed = text.trimStart();
            if (
              (trimmed.length === 0 && text.length > 0) ||
              trimmed === username
            )
              return;
            onChange("username", trimmed);
          });
        }}
      />
      <HelperText type="error" visible={isEmpty(username)}>
        Username required!
      </HelperText>
    </View>
  );
}

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
      <HelperText type="info" visible={!isStrongPassword(password)}>
        Add strong password
      </HelperText>
    </View>
  );
}

function SubmitButton() {
  const [disabled, setDisabled] = useState(false);
  const image = store.useImagePicker((state) => state.image);
  const { username, email, password } = useFields((state) => state);
  const { signUp } = useAuth()!;

  return (
    <Button
      mode="contained"
      disabled={disabled}
      style={{ width: "100%", borderRadius: 12 }}
      onPress={() =>
        handleAsync(
          async () => {
            setDisabled(true);

            if (username.length === 0)
              return Alert.alert("Missing", "Make sure to add username");
            if (email.length === 0)
              return Alert.alert("Missing", "Make sure to add email");
            if (password.length === 0)
              return Alert.alert("Missing", "Make sure to add password");

            if (image === null)
              return Alert.alert("Messing", "Make sure to add image");
            if (!isEmail(email))
              return Alert.alert("Invalid", "Make to add a valid email");

            const formData = object2formData({ username, email, password });

            // @ts-ignore
            formData.append("image", {
              uri: image.uri,
              name: image.fileName ?? `image-${Date.now()}.png`,
              type: image.mimeType ?? "image/png",
            });

            await signUp(formData);
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

export default function SignUp({ navigation }: NavigationProps) {
  const theme = useTheme();
  const resetFields = useFields((state) => state.reset);
  const resetImagePicker = store.useImagePicker((state) => state.reset);

  useEffect(() => {
    return () => {
      resetFields();
      resetImagePicker();
    };
  }, [resetFields, resetImagePicker]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 25,
        backgroundColor: theme.colors.background,
      }}
    >
      <Card
        mode="contained"
        style={{ width: "100%", backgroundColor: theme.colors.background }}
      >
        <Card.Title title="Sign up" titleVariant="headlineLarge" />
        <Card.Content>
          <View style={{ width: "100%", alignItems: "center" }}>
            <ImagePicker />
          </View>
          <UsernameField />
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
            <Text>Don't have an account?</Text>
            <Button mode="text" onPress={() => navigation.navigate("SignIn")}>
              Sign in
            </Button>
          </View>
        </Card.Actions>
      </Card>
    </View>
  );
}
