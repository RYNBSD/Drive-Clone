import type { ElementRef, ForwardRefRenderFunction } from "react";
import { forwardRef, memo, useDeferredValue, useState } from "react";
import { type DimensionValue, View } from "react-native";
import { ActivityIndicator, ProgressBar, Text } from "react-native-paper";
import { default as RNPdf, type PdfProps } from "react-native-pdf";

const PDF: ForwardRefRenderFunction<ElementRef<typeof RNPdf>, Props> = (
  {
    source,
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

  if (isError || (!isLoaded && showProgress || showSpinner))
    return (
      <View
        style={{
          width,
          height,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showProgress && <ProgressBar progress={deferredProgress} />}
        {showSpinner && <ActivityIndicator size="small" />}
        {isError && <Text variant="bodyMedium">Can't load pdf</Text>}
      </View>
    );

  return (
    <RNPdf
      {...rest}
      ref={ref}
      source={source}
      onError={() => setIsError(true)}
      onLoadComplete={() => setIsLoaded(true)}
      onLoadProgress={(progress) => setProgress(progress)}
      style={{
        width,
        height,
        ...(rest.style as object),
      }}
    />
  );
};

type Props = {
  width: DimensionValue;
  height: DimensionValue;
  /** @default false */
  showProgress?: boolean;
  /** @default false */
  showSpinner?: boolean;
} & Omit<PdfProps, "ref">;

export default memo(forwardRef(PDF));
