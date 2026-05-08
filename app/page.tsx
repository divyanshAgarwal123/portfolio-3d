import { FlickeringGrid } from '@/components/ui/flickering-grid';
import Scene from '@/components/three/Scene';
import SectionsStack from './sections/SectionsStack';

export default function Home() {
  return (
    <main className="relative w-full">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <FlickeringGrid
          className="opacity-25"
          squareSize={4}
          gridGap={6}
          flickerChance={0.2}
          maxOpacity={0.35}
        />
      </div>

      {/* Fixed fullscreen 3D canvas — never moves, never fades */}
      <Scene />

      {/* Spacer: scrolling through this 100vh opens the laptop lid */}
      <div style={{ height: '100vh' }} className="w-full" />

      {/* Sections in normal document flow — scroll up over the fixed canvas */}
      <div className="relative z-10">
        <SectionsStack />
      </div>
    </main>
  );
}
