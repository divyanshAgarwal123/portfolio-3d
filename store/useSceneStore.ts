import { create } from 'zustand';

export type ScenePhase = 'intro' | 'falling' | 'walking' | 'flashlight' | 'revealed';

interface SceneStore {
  phase: ScenePhase;
  setPhase: (phase: ScenePhase) => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
  phase: 'intro',
  setPhase: (phase) => set({ phase }),
}));
