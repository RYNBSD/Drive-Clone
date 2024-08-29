import { create } from "zustand";

type State = {
  search: string;
};

type Action = {
  setState: (state: State) => void;
  reset: () => void;
};

const initialState: State = {
  search: "",
} as const;

export const useSearch = create<State & Action>((set) => ({
  ...initialState,
  setState: set,
  reset: () => set(initialState),
}));
