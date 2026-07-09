import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewMode = "card" | "thumbnail";

interface ViewPrefsState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewPrefsStore = create<ViewPrefsState>()(
  persist(
    (set) => ({
      viewMode: "card",
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    { name: "gallery-view-prefs" }
  )
);
