import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppMode = "viewer" | "curator";

interface AppModeState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggle: () => void;
}

export const useAppModeStore = create<AppModeState>()(
  persist(
    (set) => ({
      mode: "viewer",
      setMode: (mode) => set({ mode }),
      toggle: () => set((s) => ({ mode: s.mode === "viewer" ? "curator" : "viewer" })),
    }),
    { name: "gallery-app-mode" }
  )
);
