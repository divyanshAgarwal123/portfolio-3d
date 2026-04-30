import Scene from '@/components/three/Scene';
import SectionsStack from './sections/SectionsStack';

export default function Home() {
  return (
    <main className="relative w-full bg-[#0a0a0a]">
      <Scene
        htmlSections={
          <div className="relative z-10">
            <div className="h-screen w-full" />
            <SectionsStack />
          </div>
        }
      />
    </main>
  );
}
