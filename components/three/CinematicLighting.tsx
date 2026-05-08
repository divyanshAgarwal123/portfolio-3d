'use client';

import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';

/**
 * CinematicLighting — manages the full dark-to-reveal lighting sequence.
 *
 * - ambientLight + directionalLight start at intensity 0
 * - FogExp2 at density 0.8 creates deep darkness
 * - SpotLight at camera position simulates a flashlight
 * - Flicker sequence fires when phase === 'flashlight'
 * - GSAP reveal brings all lights up and clears fog
 */
export default function CinematicLighting() {
  const { scene, gl } = useThree();
  const phase = useSceneStore((s) => s.phase);
  const setPhase = useSceneStore((s) => s.setPhase);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const fogRef = useRef<THREE.FogExp2>(null);

  // Flicker state
  const flickerStartedRef = useRef(false);
  const flickerElapsedRef = useRef(0);
  const flickerFrameRef = useRef(0);
  const revealStartedRef = useRef(false);

  // GSAP tween refs for cleanup
  const tweensRef = useRef<gsap.core.Tween[]>([]);

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

  // Kill all GSAP tweens on unmount
  useEffect(() => {
    return () => {
      tweensRef.current.forEach((t) => t.kill());
      tweensRef.current = [];
    };
  }, []);

  // Reset flicker state when phase changes to flashlight
  useEffect(() => {
    if (phase === 'flashlight') {
      flickerStartedRef.current = false;
      flickerElapsedRef.current = 0;
      flickerFrameRef.current = 0;
      revealStartedRef.current = false;
    }
  }, [phase]);

  useFrame((_, delta) => {
    if (phase !== 'flashlight') return;
    if (!spotRef.current) return;
    if (revealStartedRef.current) return;

    flickerElapsedRef.current += delta;
    flickerFrameRef.current += 1;

    const elapsed = flickerElapsedRef.current;
    const frame = flickerFrameRef.current;
    const spot = spotRef.current;

    // 0.0s to 0.3s — stay dark
    if (elapsed < 0.3) {
      spot.intensity = 0;
      return;
    }

    // 0.3s to 0.5s — weak flicker: toggle 0/0.15 every 3 frames
    if (elapsed < 0.5) {
      if (frame % 3 === 0) {
        spot.intensity = Math.random() > 0.5 ? 0.15 : 0;
      }
      return;
    }

    // 0.5s to 0.8s — dark again
    if (elapsed < 0.8) {
      spot.intensity = 0;
      return;
    }

    // 0.8s to 1.0s — stronger flicker: toggle 0/0.35 every 2 frames
    if (elapsed < 1.0) {
      if (frame % 2 === 0) {
        spot.intensity = Math.random() > 0.5 ? 0.35 : 0;
      }
      return;
    }

    // 1.0s to 1.2s — dark again
    if (elapsed < 1.2) {
      spot.intensity = 0;
      return;
    }

    // 1.2s to 1.4s — rapid strong flicker: toggle 0/0.6 every frame
    if (elapsed < 1.4) {
      spot.intensity = Math.random() > 0.5 ? 0.6 : 0;
      return;
    }

    // 1.4s+ — trigger the reveal
    if (!revealStartedRef.current) {
      revealStartedRef.current = true;
      startReveal();
    }
  });

  const startReveal = () => {
    // Kill any existing tweens
    tweensRef.current.forEach((t) => t.kill());
    tweensRef.current = [];

    // SpotLight punches in first
    if (spotRef.current) {
      tweensRef.current.push(
        gsap.to(spotRef.current, {
          intensity: 2.5,
          duration: 0.8,
          ease: 'power2.out',
        }),
      );
    }

    // Ambient and directional ease in slower
    if (ambientRef.current) {
      tweensRef.current.push(
        gsap.to(ambientRef.current, {
          intensity: 0.4,
          duration: 1.2,
          ease: 'power2.out',
        }),
      );
    }

    if (directionalRef.current) {
      tweensRef.current.push(
        gsap.to(directionalRef.current, {
          intensity: 0.8,
          duration: 1.2,
          ease: 'power2.out',
        }),
      );
    }

    // Fog clears slowly — the longest tween
    if (fogRef.current) {
      tweensRef.current.push(
        gsap.to(fogRef.current, {
          density: 0.05,
          duration: 1.5,
          ease: 'power2.out',
          onComplete: () => {
            // Reveal complete — enable scroll
            setPhase('revealed');
          },
        }),
      );
    }

    // Transition canvas clear color from black to white
    const colorProxy = { r: 0, g: 0, b: 0 };
    tweensRef.current.push(
      gsap.to(colorProxy, {
        r: 1,
        g: 1,
        b: 1,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          gl.setClearColor(
            new THREE.Color(colorProxy.r, colorProxy.g, colorProxy.b),
            0,
          );
        },
      }),
    );

    // Also transition fog color from black to white
    if (fogRef.current) {
      const fogColorProxy = { r: 0, g: 0, b: 0 };
      tweensRef.current.push(
        gsap.to(fogColorProxy, {
          r: 1,
          g: 1,
          b: 1,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: () => {
            if (fogRef.current) {
              fogRef.current.color.setRGB(
                fogColorProxy.r,
                fogColorProxy.g,
                fogColorProxy.b,
              );
            }
          },
        }),
      );
    }
  };

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
        position={[0, 0, 6]}
        angle={0.35}
        penumbra={0.4}
        intensity={0}
        distance={20}
        castShadow={false}
        decay={2}
      />
      <fogExp2 ref={fogRef} attach="fog" args={['#000000', 0.8]} />
    </>
  );
}
