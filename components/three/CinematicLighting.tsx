'use client';

import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';

/**
 * CinematicLighting — manages the full dark-to-reveal lighting sequence.
 *
 * - ambientLight + directionalLight start at intensity 0
 * - SpotLight flickers on via GSAP timeline when phase === 'flashlight'
 * - GSAP reveal brings all lights up
 */
export default function CinematicLighting() {
  const { scene } = useThree();
  const phase = useSceneStore((s) => s.phase);
  const setPhase = useSceneStore((s) => s.setPhase);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Set up SpotLight target
  useEffect(() => {
    if (!spotRef.current) return;

    spotRef.current.target.position.set(0, 0, 0);
    scene.add(spotRef.current.target);

    return () => {
      if (spotRef.current) {
        scene.remove(spotRef.current.target);
      }
    };
  }, [scene]);

  // Kill the GSAP timeline on unmount
  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'flashlight') return;
    if (!spotRef.current || !ambientRef.current || !directionalRef.current) return;

    timelineRef.current?.kill();

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase('revealed');
      },
    });

    timelineRef.current = tl;

    // Beat of silence
    tl.to({}, { duration: 0.4 });

    // First flicker attempts — weak
    tl.to(spotRef.current, { intensity: 0.3, duration: 0.05 });
    tl.to(spotRef.current, { intensity: 0, duration: 0.05 });
    tl.to(spotRef.current, { intensity: 0.2, duration: 0.03 });
    tl.to(spotRef.current, { intensity: 0, duration: 0.08 });

    // Second attempt — stronger
    tl.to({}, { duration: 0.15 });
    tl.to(spotRef.current, { intensity: 0.7, duration: 0.04 });
    tl.to(spotRef.current, { intensity: 0, duration: 0.06 });
    tl.to(spotRef.current, { intensity: 0.5, duration: 0.03 });
    tl.to(spotRef.current, { intensity: 0, duration: 0.1 });

    // Final attempt — holds on
    tl.to({}, { duration: 0.1 });
    tl.to(spotRef.current, { intensity: 1.2, duration: 0.04 });
    tl.to(spotRef.current, { intensity: 0.4, duration: 0.03 });
    tl.to(spotRef.current, { intensity: 2.5, duration: 0.06 });
    tl.to(spotRef.current, { intensity: 1.8, duration: 0.04 });

    // Flashlight locks on — now reveal the scene
    tl.to(spotRef.current, { intensity: 3.5, duration: 0.8, ease: 'power2.out' });

    // Ambient slowly fills in so background becomes visible
    tl.to(
      ambientRef.current,
      { intensity: 0.5, duration: 2.0, ease: 'power3.out' },
      '-=0.4',
    );

    // Directional light brings in the details
    tl.to(
      directionalRef.current,
      { intensity: 1.0, duration: 1.8, ease: 'power3.out' },
      '-=1.6',
    );
  }, [phase, setPhase]);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0} />
      <directionalLight
        ref={directionalRef}
        position={[5, 5, 3]}
        intensity={0}
        castShadow
      />
      <spotLight
        ref={spotRef}
        position={[0, 1, 5]}
        angle={0.25}
        penumbra={0.6}
        intensity={0}
        distance={12}
        castShadow={false}
        decay={1.5}
        color="#fff8e7"
      />
      {process.env.NODE_ENV === 'development' && spotRef.current && (
        <primitive object={new THREE.SpotLightHelper(spotRef.current)} />
      )}
    </>
  );
}
