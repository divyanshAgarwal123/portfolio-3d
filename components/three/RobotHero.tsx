'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const DRACO_DECODER_PATH = '/draco-gltf/';
const FALLING_MODEL_PATH = '/models/robot_cute_falling.glb';
const POINTING_MODEL_PATH = '/models/robot_cute_pointing_back.glb';
const TARGET_Y = -0.5;

export type RobotHeroTransform = {
  position: [number, number, number];
  scale: number;
};

export type RobotHeroSceneMode = 'falling' | 'pointing' | 'auto';

type RobotHeroProps = {
  fallingTransform?: RobotHeroTransform;
  pointingTransform?: RobotHeroTransform;
  sceneMode?: RobotHeroSceneMode;
};

export default function RobotHero({
  fallingTransform = { position: [0, 0, -1.2], scale: 0.0006 },
  pointingTransform = { position: [0, 0, -1.2], scale: 0.0006 },
  sceneMode = 'auto',
}: RobotHeroProps) {
  const fallingGltf = useGLTF(FALLING_MODEL_PATH, DRACO_DECODER_PATH);
  const pointingGltf = useGLTF(POINTING_MODEL_PATH, DRACO_DECODER_PATH);

  const clonedScene = useMemo(() => fallingGltf.scene.clone(true), [fallingGltf.scene]);

  const allClips = useMemo(() => {
    const fallingClips = fallingGltf.animations.map((clip, index) => {
      const next = clip.clone();
      next.name = index === 0 ? 'hero_falling' : `hero_falling_${index}`;
      return next;
    });

    const pointingClips = pointingGltf.animations.map((clip, index) => {
      const next = clip.clone();
      next.name = index === 0 ? 'hero_pointing_back' : `hero_pointing_back_${index}`;
      return next;
    });

    return [...fallingClips, ...pointingClips];
  }, [fallingGltf.animations, pointingGltf.animations]);

  const { actions, mixer } = useAnimations(allClips, clonedScene);

  const phase = useRef<'falling' | 'pointing' | 'done'>('falling');
  const groupRef = useRef<THREE.Group>(null);
  const motionRef = useRef<THREE.Group>(null);
  const bounceRef = useRef(0);
  const fallClipRef = useRef('');
  const pointClipRef = useRef('');
  const initializedRef = useRef(false);
  const lastSceneModeRef = useRef<RobotHeroSceneMode>(sceneMode);

  useEffect(() => {
    clonedScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [clonedScene]);

  useEffect(() => {
    const actionNames = Object.keys(actions);
    console.log('Hero clips:', actionNames);

    if (actionNames.length === 0) {
      return;
    }

    const FALL_CLIP = actions.hero_falling ? 'hero_falling' : actionNames[0] ?? '';
    const POINT_CLIP = actions.hero_pointing_back
      ? 'hero_pointing_back'
      : actionNames[1] ?? actionNames[0] ?? '';

    fallClipRef.current = FALL_CLIP;
    pointClipRef.current = POINT_CLIP;

    const fallAction = actions[FALL_CLIP];
    const pointAction = actions[POINT_CLIP];

    if (fallAction) {
      fallAction.clampWhenFinished = true;
      fallAction.setLoop(THREE.LoopOnce, 1);
    }

    if (pointAction) {
      pointAction.clampWhenFinished = true;
      pointAction.setLoop(THREE.LoopRepeat, Infinity);
    }

    const startFalling = () => {
      phase.current = 'falling';
      bounceRef.current = 0;
      Object.values(actions).forEach((action) => action?.stop());
      if (motionRef.current) {
        motionRef.current.position.y = TARGET_Y + 6;
      }
      fallAction?.reset().play();
    };

    const startPointing = (withBounce: boolean) => {
      phase.current = 'pointing';
      bounceRef.current = withBounce ? 0 : 1;
      fallAction?.fadeOut(0.3);
      if (pointAction) {
        pointAction.clampWhenFinished = true;
        pointAction.setLoop(THREE.LoopRepeat, Infinity);
        pointAction.reset().fadeIn(0.3).play();
      }
    };

    const onFinished = (event: THREE.Event & { action?: THREE.AnimationAction }) => {
      if (sceneMode !== 'auto') return;
      if (!fallAction || !pointAction) return;
      if (phase.current !== 'falling') return;
      if (event.action !== fallAction) return;
      startPointing(true);
    };

    mixer.addEventListener('finished', onFinished);

    if (!initializedRef.current) {
      if (sceneMode === 'pointing') {
        Object.values(actions).forEach((action) => action?.stop());
        if (motionRef.current) {
          motionRef.current.position.y = TARGET_Y;
        }
        startPointing(false);
      } else {
        startFalling();
      }

      initializedRef.current = true;
      lastSceneModeRef.current = sceneMode;
    }

    return () => {
      mixer.removeEventListener('finished', onFinished);
    };
  }, [actions, mixer, sceneMode]);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (lastSceneModeRef.current === sceneMode) return;
    lastSceneModeRef.current = sceneMode;

    const fallAction = actions[fallClipRef.current];
    const pointAction = actions[pointClipRef.current];

    if (sceneMode === 'falling') {
      phase.current = 'falling';
      bounceRef.current = 0;
      pointAction?.fadeOut(0.3);
      fallAction?.reset().fadeIn(0.3).play();
      if (motionRef.current) {
        motionRef.current.position.y = TARGET_Y + 6;
      }
      return;
    }

    if (sceneMode === 'pointing') {
      phase.current = 'pointing';
      bounceRef.current = 1;
      fallAction?.fadeOut(0.3);
      pointAction?.reset().fadeIn(0.3).play();
      if (motionRef.current) {
        motionRef.current.position.y = TARGET_Y;
      }
      return;
    }

    phase.current = 'falling';
    bounceRef.current = 0;
    pointAction?.fadeOut(0.3);
    fallAction?.reset().fadeIn(0.3).play();
    if (motionRef.current) {
      motionRef.current.position.y = TARGET_Y + 6;
    }
  }, [sceneMode, actions]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const motion = motionRef.current;
    if (!group || !motion) return;

    const activeTransform = phase.current === 'falling' ? fallingTransform : pointingTransform;
    const x = Number.isFinite(activeTransform.position[0]) ? activeTransform.position[0] : 0;
    const y = Number.isFinite(activeTransform.position[1]) ? activeTransform.position[1] : 0;
    const z = Number.isFinite(activeTransform.position[2]) ? activeTransform.position[2] : -1.2;
    const safeScale = THREE.MathUtils.clamp(
      Number.isFinite(activeTransform.scale) ? activeTransform.scale : 0.0006,
      0.0001,
      0.03,
    );

    group.position.set(x, y, z);
    group.rotation.y = Math.PI;
    group.scale.setScalar(safeScale);

    if (phase.current === 'falling') {
      motion.position.y = Math.max(TARGET_Y, motion.position.y - delta * 4);

      if (motion.position.y <= TARGET_Y + 0.01 && sceneMode !== 'falling') {
        const fallAction = actions[fallClipRef.current];
        const pointAction = actions[pointClipRef.current];
        phase.current = 'pointing';
        bounceRef.current = 0;
        fallAction?.fadeOut(0.3);
        pointAction?.reset().fadeIn(0.3).play();
      }

      return;
    }

    if (bounceRef.current < 1) {
      motion.position.y = TARGET_Y + Math.sin(bounceRef.current * Math.PI) * 0.15;
      bounceRef.current += delta * 3;
      return;
    }

    motion.position.y = TARGET_Y;
  });

  return (
    <group ref={groupRef}>
      <group ref={motionRef}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(FALLING_MODEL_PATH);
useGLTF.preload(POINTING_MODEL_PATH);
