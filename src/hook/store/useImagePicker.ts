import { ImagePickerAsset } from "expo-image-picker";
import { create } from "zustand";

type State = {
  image: ImagePickerAsset | null;
};

type Action = {
  setImage: (image: ImagePickerAsset | null) => void;
  reset: () => void;
};

const initialState: State = {
  image: null,
} as const;

export const useImagePicker = create<State & Action>((set) => ({
  ...initialState,
  setImage: (image) => set({ image }),
  reset: () => set(initialState),
}));
