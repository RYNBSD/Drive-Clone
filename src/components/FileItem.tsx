import type { File } from "../types";
import { type FC, memo, useState } from "react";
import { View } from "react-native";
import {
  Divider,
  IconButton,
  Menu,
  Text,
  TextInput,
  TouchableRipple,
} from "react-native-paper";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { handleAsync } from "../util";

const ImageItem: FC<Props> = ({ name, isLast }) => {
  const [isUpdate, setIsUpdate] = useState(false);
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableRipple
        style={{
          width: "100%",
          marginVertical: 5,
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MaterialIcons name="image" size={24} />
            {isUpdate ? (
              <TextInput value={value} />
            ) : (
              <Text variant="labelLarge">{name}</Text>
            )}
          </View>
          {isUpdate ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <IconButton
                icon={(props) => (
                  <MaterialIcons {...props} name="close" size={24} />
                )}
                onPress={async () => {
                  await handleAsync(() => {
                    setIsUpdate(false);
                    setValue("");
                  });
                }}
              />
              <IconButton
                icon={(props) => (
                  <MaterialIcons {...props} name="check" size={22} />
                )}
                onPress={async () => {
                  await handleAsync(() => {});
                }}
              />
            </View>
          ) : (
            <Menu
              visible={visible}
              onDismiss={() => setVisible(false)}
              anchor={
                <IconButton
                  onPress={() => setVisible(true)}
                  icon={(props) => (
                    <MaterialCommunityIcons
                      {...props}
                      name="dots-vertical"
                      size={22}
                    />
                  )}
                />
              }
            >
              <Menu.Item
                title="Update"
                onPress={async () => {
                  await handleAsync(() => {
                    setVisible(false);
                    setIsUpdate(true);
                    setValue(name);
                  });
                }}
              />
              <Menu.Item
                title="Delete"
                onPress={async () => {
                  await handleAsync(() => {});
                }}
              />
            </Menu>
          )}
        </View>
      </TouchableRipple>
      {!isLast && <Divider />}
    </>
  );
};

type Props = { isLast: boolean } & File;

export default memo(ImageItem);
