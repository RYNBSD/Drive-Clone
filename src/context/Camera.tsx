//! This context is ignored in final video (https://www.youtube.com/@ryn__bsd)
//* Feel free to use this code

import { MaterialIcons } from "@expo/vector-icons";
import type { EventArg, NavigationAction } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import type {
  CameraType,
  FlashMode,
  PermissionResponse,
  CameraMode,
} from "expo-camera";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { ElementRef, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconButton, SegmentedButtons } from "react-native-paper";
import { useAudio } from "./Audio";
import { useMediaLibrary } from "./MediaLibrary";

type CameraValue = {
  isOpen: boolean;
  permission: PermissionResponse | null;
  mode: CameraMode;
  uri: string;
  open: () => void;
  close: () => void;
  pictureMode: () => void;
  videoMode: () => void;
  checkPermission: () => Promise<boolean>;
};

const CameraContext = createContext<CameraValue | null>(null);

export default function CameraProvider({ children }: { children: ReactNode }) {
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation();
  const cameraRef = useRef<ElementRef<typeof CameraView>>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [permission, requestPermission] = useCameraPermissions();

  const { checkPermission: checkMediaLibraryPermission } = useMediaLibrary()!;
  const { checkPermission: checkAudioPermission } = useAudio()!;

  const [uri, setUri] = useState<string>("");

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const pictureMode = useCallback(() => setMode("picture"), []);
  const videoMode = useCallback(() => setMode("video"), []);

  useEffect(() => {
    const callback = (
      e: EventArg<
        "beforeRemove",
        true,
        {
          action: NavigationAction;
        }
      >,
    ) => {
      e.preventDefault();
      close();
    };

    navigation.addListener("beforeRemove", callback);
    return () => navigation.removeListener("beforeRemove", callback);
  }, [close, navigation]);

  // useEffect(() => {
  //   if (!isOpen || !permission || permission.granted) return;
  //   (async () => {
  //     const requestedPermission = await requestPermission();
  //     if (!requestedPermission.granted) close();
  //   })();
  // }, [close, isOpen, permission, requestPermission]);

  const checkPermission = useCallback(async () => {
    if (permission && permission.granted) return true;
    const requestedPermission = await requestPermission();
    return requestedPermission.granted;
  }, [permission, requestPermission]);

  return (
    <CameraContext.Provider
      value={{
        isOpen,
        permission,
        mode,
        uri,
        open,
        close,
        pictureMode,
        videoMode,
        checkPermission,
      }}
    >
      {isOpen ? (
        <View
          style={{
            flex: 1,
            paddingTop: safeAreaInsets.top,
            paddingLeft: safeAreaInsets.left,
            paddingRight: safeAreaInsets.right,
            paddingBottom: safeAreaInsets.bottom,
          }}
        >
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            autofocus="on"
            focusable
            mode={mode}
            flash={flash}
            facing={facing}
            onMountError={(e) => {
              Alert.alert("Can't open the camera", e.message);
              close();
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 5,
              }}
            >
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IconButton
                  mode="contained"
                  onPress={close}
                  icon={(props) => <MaterialIcons {...props} name="close" />}
                />
                <IconButton
                  mode="contained"
                  onPress={() => {
                    setFlash((prev) =>
                      prev === "off"
                        ? "on"
                        : prev === "on"
                          ? "auto"
                          : prev === "auto"
                            ? "off"
                            : prev,
                    );
                  }}
                  icon={(props) => (
                    <MaterialIcons {...props} name={`flash-${flash}`} />
                  )}
                />
              </View>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IconButton
                  mode="contained"
                  onPress={async () => {}}
                  icon={(props) => (
                    <MaterialIcons {...props} name="insert-photo" />
                  )}
                />
                <IconButton
                  mode="contained"
                  onPress={async () => {
                    if (mode === "picture") {
                      const picture = await cameraRef.current?.takePictureAsync(
                        {
                          quality: 1,
                          imageType: "png",
                        },
                      );
                      setUri(picture?.uri ?? "");
                    }

                    if (mode === "video" && !isRecording) {
                      setIsRecording(true);
                      const video = await cameraRef.current?.recordAsync();
                      setUri(video?.uri ?? "");
                    }

                    if (mode === "video" && isRecording) {
                      setIsRecording(false);
                      cameraRef.current?.stopRecording();
                    }
                  }}
                  icon={(props) => (
                    <MaterialIcons
                      {...props}
                      name={
                        mode === "picture"
                          ? "camera"
                          : isRecording
                            ? "videocam-off"
                            : "videocam"
                      }
                    />
                  )}
                />
                <IconButton
                  mode="contained"
                  icon={(props) => (
                    <MaterialIcons
                      onPress={() => {
                        setFacing((prev) =>
                          prev === "back" ? "front" : "back",
                        );
                      }}
                      {...props}
                      name={
                        Platform.OS === "ios"
                          ? "flip-camera-ios"
                          : "flip-camera-android"
                      }
                    />
                  )}
                />
              </View>
            </View>
          </CameraView>
          <View
            style={{
              width: "50%",
              paddingVertical: 5,
              marginHorizontal: "auto",
            }}
          >
            <SegmentedButtons
              value={mode}
              // @ts-ignore
              onValueChange={async (value: CameraMode) => setMode(value)}
              buttons={[
                {
                  value: "video",
                  label: "Video",
                },
                {
                  value: "picture",
                  label: "Picture",
                },
              ]}
            />
          </View>
        </View>
      ) : (
        children
      )}
    </CameraContext.Provider>
  );
}

export const useCamera = () => useContext(CameraContext);