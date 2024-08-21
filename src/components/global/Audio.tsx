import { memo, useState, useTransition } from "react";
import { View } from "react-native";
import useEffectOnce from "react-use/lib/useEffectOnce";
import { Audio, type AVPlaybackStatusSuccess } from "expo-av";
import { handleAsync } from "../../util";

const AudioComponent = ({}) => {
  const [_isPending, startTransition] = useTransition();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatusSuccess | null>(null);

  useEffectOnce(() => {
    handleAsync(async () => {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: "" },
        { shouldPlay: true },
        (status) => {
          startTransition(() => {
            if (!status.isLoaded) return;
            setStatus(status);
          });
        }
      );

      setSound(sound);
      if (status.isLoaded) setStatus(status);
    });

    return () => {
      if (sound === null) return;
      handleAsync(sound.unloadAsync);
    };
  });

  return <View></View>;
};

export default memo(AudioComponent);
