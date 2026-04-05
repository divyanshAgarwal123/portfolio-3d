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
  fallingTransform = { position: [0, 0, -1.2], scale: 0.03 },
  pointingTransform = { position: [0, 0, -1.2], scale: 0.03 },
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
  const bounceRef = useRef(0);
  const fallClipRef = useRef('');
  const pointClipRef = useRef('');

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
      if (groupRef.current) {
        groupRef.current.position.set(
          fallingTransform.position[0],
          6 + fallingTransform.position[1],
          fallingTransform.position[2]
        );
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

    if (sceneMode === 'pointing') {
      Object.values(actions).forEach((action) => action?.stop());
      if (groupRef.current) {
        groupRef.current.position.set(
          pointingTransform.position[0],
          TARGET_Y + pointingTransform.position[1],
          pointingTransform.position[2]
        );
      }
      startPointing(false);
    } else {
      startFalling();
    }

    const onFinished = (event: THREE.Event & { action?: THREE.AnimationAction }) => {
      if (sceneMode !== 'auto') return;
      if (!fallAction || !pointAction) return;
      if (phase.current !== 'falling') return;
      if (event.action !== fallAction) return;
      startPointing(true);
    };

    mixer.addEventListener('finished', onFinished);

    return () => {
      mixer.removeEventListener('finished', onFinished);
      Object.values(actions).forEach((action) => action?.fadeOut(0.3));
    };
  }, [actions, mixer, fallingTransform, pointingTransform, sceneMode]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    group.rotation.y = Math.PI;

    if (phase.current === 'falling') {
      group.position.x = fallingTransform.position[0];
      group.position.z = fallingTransform.position[2];
      group.scale.setScalar(fallingTransform.scale);

      const landingY = TARGET_Y + fallingTransform.position[1];
      group.position.y = Math.max(landingY, group.position.y - delta * 4);

      if (group.position.y <= landingY + 0.01 && sceneMode !== 'falling') {
        const fallAction = actions[fallClipRef.current];
        const pointAction = actions[pointClipRef.current];
        phase.current = 'pointing';
        bounceRef.current = 0;
        fallAction?.fadeOut(0.3);
        pointAction?.reset().fadeIn(0.3).play();
      }

      return;
    }

    group.position.x = pointingTransform.position[0];
    group.position.z = pointingTransform.position[2];
    group.scale.setScalar(pointingTransform.scale);

    const landingY = TARGET_Y + pointingTransform.position[1];
    if (bounceRef.current < 1) {
      group.position.y = landingY + Math.sin(bounceRef.current * Math.PI) * 0.15;
      bounceRef.current += delta * 3;
      return;
    }

    group.position.y = landingY;
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(FALLING_MODEL_PATH);
useGLTF.preload(POINTING_MODEL_PATH);
