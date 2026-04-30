import Scene from '@/components/three/Scene';
import SectionsStack from './sections/SectionsStack';

export default function Home() {
  return (
    <main className="relative w-full bg-[#0a0a0a]">
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
