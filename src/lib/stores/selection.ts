import { create } from "zustand";

interface SelectionState {
  selectMode: boolean;
  selected: Set<string>;
  toggle: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clear: () => void;
  setSelectMode: (on: boolean) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectMode: false,
  selected: new Set(),
  toggle: (id) =>
    set((s) => {
      const next = new Set(s.selected);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selected: next };
    }),
  selectAll: (ids) => set({ selected: new Set(ids) }),
  clear: () => set({ selected: new Set(), selectMode: false }),
  setSelectMode: (on) =>
    set((s) => ({ selectMode: on, selected: on ? s.selected : new Set() })),
}));
