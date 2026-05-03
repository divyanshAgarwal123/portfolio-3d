'use client';

import { create } from 'zustand';

export type ScenePhase = 'intro' | 'falling' | 'walking' | 'flashlight' | 'revealed';

type SceneState = {
  phase: ScenePhase;
  setPhase: (phase: ScenePhase) => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  phase: 'intro',
  setPhase: (phase) => set({ phase }),
}));
