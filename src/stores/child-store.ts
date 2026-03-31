import { create } from "zustand";
import type { Child } from "@/lib/types";

interface ChildStore {
  selectedChild: Child | null;
  children: Child[];
  setSelectedChild: (child: Child | null) => void;
  setChildren: (children: Child[]) => void;
  updateChild: (child: Partial<Child> & { id: string }) => void;
}

export const useChildStore = create<ChildStore>((set) => ({
  selectedChild: null,
  children: [],
  setSelectedChild: (child) => set({ selectedChild: child }),
  setChildren: (children) => set({ children }),
  updateChild: (update) =>
    set((state) => ({
      children: state.children.map((c) =>
        c.id === update.id ? { ...c, ...update } : c
      ),
      selectedChild:
        state.selectedChild?.id === update.id
          ? { ...state.selectedChild, ...update }
          : state.selectedChild,
    })),
}));
