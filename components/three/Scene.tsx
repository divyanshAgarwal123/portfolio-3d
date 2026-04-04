'use client';

import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { Suspense, useEffect, useRef } from 'react';
import LaptopScene from './LaptopScene';

function CameraIntroAnimation() {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.position.z = 4;
    const tween = gsap.to(camera.position, {
      z: 1.2,
      duration: 1.5,
      ease: 'expo.out',
    });

    return () => {
      tween.kill();
    };
  }, [camera]);

  return null;
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 3]} intensity={1.2} castShadow />
    </>
  );
}

function WireframeFloors() {
  return (
    <>
      <gridHelper args={[30, 60, '#d4d4d4', '#e5e5e5']} position={[0, -1.2, 0]} />
      <gridHelper args={[60, 80, '#d4d4d4', '#e5e5e5']} position={[0, -2.4, -8]} />
      <gridHelper args={[100, 120, '#d4d4d4', '#e5e5e5']} position={[0, -3.8, -20]} />
      <gridHelper args={[160, 160, '#d4d4d4', '#e5e5e5']} position={[0, -5.5, -40]} />
    </>
  );
}

function SceneContent() {
  return (
    <>
      <Lighting />
      <WireframeFloors />
      <LaptopScene />
      <CameraIntroAnimation />
    </>
  );
}

function LoadingFallback() {
  return <div className="h-screen w-screen bg-white" />;
}

export default function Scene() {
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasWrapRef.current) return;
    canvasWrapRef.current.style.opacity = '0';

    const tween = gsap.to(canvasWrapRef.current, {
      opacity: 1,
      duration: 1,
      ease: 'power1.out',
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div ref={canvasWrapRef} className="fixed left-0 top-0 h-screen w-screen" style={{ opacity: 0 }}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          className="h-screen w-screen"
          shadows
          camera={{ fov: 40, position: [0, -0.25, 1.2], near: 0.1, far: 100 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#ffffff', 1);
          }}
        >
          <SceneContent />
        </Canvas>
      </Suspense>
    </div>
  );
}
