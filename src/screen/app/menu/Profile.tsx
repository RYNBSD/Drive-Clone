// eslint-disable-next-line import/no-unresolved
import { BASE_URL } from "@env";
import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Button,
  Card,
  HelperText,
  TextInput,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import isEmpty from "validator/lib/isEmail";
import { Image } from "expo-image";
import { useAuth } from "../../../context";
import { store } from "../../../hook";
import {
  AUTHORIZATION,
  handleAsync,
  jwt,
  object2formData,
} from "../../../util";

function ImagePicker() {
  const theme = useTheme();
  const { user } = useAuth()!;
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
        source={{
          uri: `${BASE_URL}/user/folders/0/files/${user!.image}`,
          headers: {
            [AUTHORIZATION]: jwt.bearer(),
          },
        }}
        style={{ width: 150, height: 150, borderRadius: 75 }}
        contentFit="cover"
      />
    </TouchableRipple>
  );
}

function UsernameField() {
  const { user, onChange } = useAuth()!;
  return (
    <View style={{ width: "100%" }}>
      <TextInput
        mode="outlined"
        label="Username"
        value={user!.username}
        onChangeText={(text) => {
          onChange("username", text);
        }}
      />
      <HelperText type="error" visible={isEmpty(user!.username)}>
        Username required!
      </HelperText>
    </View>
  );
}

function EmailInput() {
  const { user } = useAuth()!;
  return (
    <TextInput
      editable={false}
      mode="outlined"
      label="Email"
      value={user!.email}
    />
  );
}

function UpdateButton() {
  const [disabled, setDisabled] = useState(false);
  const { user, update } = useAuth()!;

  return (
    <Button
      mode="contained"
      disabled={disabled}
      onPress={() =>
        handleAsync(
          async () => {
            setDisabled(true);
            const formData = object2formData(user!);
            await update(formData);
          },
          null,
          null,
          () => setDisabled(false)
        )
      }
    >
      Update
    </Button>
  );
}

function DeleteButton() {
  const [disabled, setDisabled] = useState(false);
  const { remove } = useAuth()!;

  return (
    <Button
      mode="outlined"
      disabled={disabled}
      onPress={() =>
        handleAsync(
          () => {
            setDisabled(false);
            remove();
          },
          null,
          null,
          () => setDisabled(false)
        )
      }
    >
      Delete
    </Button>
  );
}

export default function Profile() {
  const theme = useTheme();
  const resetImagePicker = store.useImagePicker((state) => state.reset);

  useEffect(() => {
    return () => {
      resetImagePicker();
    };
  }, [resetImagePicker]);

  return (
    <View style={{ flex: 1 }}>
      <Card
        mode="contained"
        style={{ backgroundColor: theme.colors.background }}
      >
        <Card.Content>
          <View style={{ width: "100%", alignItems: "center" }}>
            <ImagePicker />
          </View>
          <UsernameField />
          <View>
            <EmailInput />
            <HelperText type="error" visible={false}>
              Email address is invalid!
            </HelperText>
          </View>
        </Card.Content>
        <Card.Actions style={{ gap: 4 }}>
          <DeleteButton />
          <UpdateButton />
        </Card.Actions>
      </Card>
    </View>
  );
}
