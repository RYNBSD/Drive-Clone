import type { ElementRef, ForwardRefRenderFunction } from "react";
import { forwardRef, memo, useDeferredValue, useMemo, useState } from "react";
import { type DimensionValue, View } from "react-native";
import { ActivityIndicator, ProgressBar } from "react-native-paper";
import {
  Image as ExpoImage,
  type ImageProps as ExpoImageProps,
} from "expo-image";

export const Image: ForwardRefRenderFunction<
  ElementRef<typeof ExpoImage>,
  Props
> = (
  {
    source,
    alt,
    width,
    height,
    showProgress = false,
    showSpinner = false,
    ...rest
  },
  ref
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [progress, setProgress] = useState(0);
  const deferredProgress = useDeferredValue(progress);

  const memorizedImage = useMemo(
    () => (
      <ExpoImage
        {...rest}
        ref={ref}
        alt={alt}
        source={
          isError
            ? require("../../../assets/image/image-loading-failed.webp")
            : source
        }
        onProgress={({ loaded, total }) => setProgress(loaded / total)}
        onError={(error) => {
          if (__DEV__) console.error(error);
          setIsError(true);
        }}
        onLoad={() => setIsLoaded(true)}
        style={{
          ...(rest?.style as object),
          width,
          height,
        }}
      />
    ),
    [alt, height, isError, ref, rest, source, width]
  );

  return (
    <View style={{ width, height, position: "relative" }}>
      {memorizedImage}
      {!isLoaded && (showProgress || showSpinner) && (
        <View
          style={{
            width,
            height,
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
          }}
        >
          {showProgress && (
            <ProgressBar style={{ width }} progress={deferredProgress} />
          )}
          {showSpinner && <ActivityIndicator size="small" />}
        </View>
      )}
    </View>
  );
};

type Props = {
  alt: string;
  width: DimensionValue;
  height: DimensionValue;
  /** @default false */
  showProgress?: boolean;
  /** @default false */
  showSpinner?: boolean;
  // fallback?: ExpoImageProps["source"];
} & Omit<ExpoImageProps, "ref">;

export default memo(forwardRef(Image));
