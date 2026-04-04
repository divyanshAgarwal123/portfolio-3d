'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 3]} intensity={1.2} />
    </>
  );
}

function SceneContent() {
  return (
    <>
      {/* White background */}
      <color attach="background" args={['#ffffff']} />
      <Lighting />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
        <p className="text-sm text-neutral-500">Loading scene…</p>
      </div>
    </div>
  );
}

export default function Scene() {
  return (
    <div className="h-screen w-screen bg-white">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ fov: 45, position: [0, 0, 6], near: 0.1, far: 100 }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <SceneContent />
        </Canvas>
      </Suspense>
    </div>
  );
}
