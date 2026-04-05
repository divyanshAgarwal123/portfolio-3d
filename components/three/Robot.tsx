'use client';

import { useAnimations, useGLTF, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

type RobotBehaviorConfig = {
  runStart: number;
  runEnd: number;
  pointStart: number;
  startX: number;
  endX: number;
  y: number;
  z: number;
  runFacingY: number;
  idleFacingY: number;
};

type RobotProps = {
  scale?: number;
  behavior?: RobotBehaviorConfig;
};

const IDLE_MODEL_PATH = '/public/models/robot_cute_idle.glb';
const RUNNING_MODEL_PATH = '/public/models/robot_cute_running.glb';
const WAVING_MODEL_PATH = '/public/models/robot_cute_waving.glb';
const POINTING_MODEL_PATH = '/public/models/robot_cute_pointing.glb';
const CLAPPING_MODEL_PATH = '/public/models/robot_cute_clapping.glb';

const ANIM_IDLE = 'robot_idle';
const ANIM_RUN = 'robot_running';
const ANIM_WAVE = 'robot_waving';
const ANIM_POINT = 'robot_pointing';
const ANIM_CLAP = 'robot_clapping';

const DRACO_DECODER_PATH = '/draco-gltf/';

export default function Robot({
  scale = 0.025,
  behavior = {
    runStart: 0.15,
    runEnd: 0.45,
    pointStart: 0.65,
    startX: -4,
    endX: 0.8,
    y: -1,
    z: -1,
    runFacingY: -1.5,
    idleFacingY: 0.3,
  },
}: RobotProps) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const currentAnim = useRef<string>('');
  const introTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIntroPlaying = useRef(true);

  const idleGltf = useGLTF(IDLE_MODEL_PATH, DRACO_DECODER_PATH);
  const runningGltf = useGLTF(RUNNING_MODEL_PATH, DRACO_DECODER_PATH);
  const wavingGltf = useGLTF(WAVING_MODEL_PATH, DRACO_DECODER_PATH);
  const pointingGltf = useGLTF(POINTING_MODEL_PATH, DRACO_DECODER_PATH);
  const clappingGltf = useGLTF(CLAPPING_MODEL_PATH, DRACO_DECODER_PATH);

  const clonedScene = useMemo(() => idleGltf.scene.clone(true), [idleGltf.scene]);

  const allClips = useMemo(() => {
    const namedIdle = idleGltf.animations.map((clip) => {
      const next = clip.clone();
      next.name = ANIM_IDLE;
      return next;
    });
    const namedRunning = runningGltf.animations.map((clip) => {
      const next = clip.clone();
      next.name = ANIM_RUN;
      return next;
    });
    const namedWaving = wavingGltf.animations.map((clip) => {
      const next = clip.clone();
      next.name = ANIM_WAVE;
      return next;
    });
    const namedPointing = pointingGltf.animations.map((clip) => {
      const next = clip.clone();
      next.name = ANIM_POINT;
      return next;
    });
    const namedClapping = clappingGltf.animations.map((clip) => {
      const next = clip.clone();
      next.name = ANIM_CLAP;
      return next;
    });

    return [
      ...namedIdle,
      ...namedRunning,
      ...namedWaving,
      ...namedPointing,
      ...namedClapping,
    ];
  }, [
    idleGltf.animations,
    runningGltf.animations,
    wavingGltf.animations,
    pointingGltf.animations,
    clappingGltf.animations,
  ]);

  const { actions } = useAnimations(allClips, clonedScene);

  const switchTo = useCallback(
    (name: string) => {
      if (!name || currentAnim.current === name) {
        return;
      }

      if (currentAnim.current) {
        actions[currentAnim.current]?.fadeOut(0.4);
      }

      actions[name]?.reset().fadeIn(0.4).play();
      currentAnim.current = name;
    },
    [actions]
  );

  useEffect(() => {
    console.log('Robot animation:', Object.keys(actions));

    switchTo(ANIM_WAVE);

    introTimeoutRef.current = setTimeout(() => {
      isIntroPlaying.current = false;
      switchTo(ANIM_IDLE);
    }, 3000);

    return () => {
      if (introTimeoutRef.current) {
        clearTimeout(introTimeoutRef.current);
      }
      Object.values(actions).forEach((action) => {
        action?.fadeOut(0.2);
      });
    };
  }, [actions, switchTo]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const offset = scroll.offset;
    const runStart = Math.min(behavior.runStart, behavior.runEnd);
    const runEnd = Math.max(behavior.runStart, behavior.runEnd);
    const pointStart = Math.max(runEnd, behavior.pointStart);

    if (!isIntroPlaying.current) {
      if (offset < runStart) {
        switchTo(ANIM_IDLE);
      } else if (offset < runEnd) {
        switchTo(ANIM_RUN);
      } else if (offset < pointStart) {
        switchTo(ANIM_IDLE);
      } else {
        switchTo(ANIM_POINT);
      }
    }

    let targetX = behavior.endX;
    if (offset <= runStart) {
      targetX = behavior.startX;
    } else if (offset <= runEnd) {
      const t = (offset - runStart) / Math.max(runEnd - runStart, 0.0001);
      targetX = THREE.MathUtils.lerp(behavior.startX, behavior.endX, t);
    }

    const isRunningWindow = offset >= runStart && offset <= runEnd;
    const targetRotY = isRunningWindow ? behavior.runFacingY : behavior.idleFacingY;

    group.position.x = THREE.MathUtils.lerp(group.position.x, targetX, 1 - Math.exp(-6 * delta));
    group.position.y = behavior.y;
    group.position.z = behavior.z;
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, 1 - Math.exp(-8 * delta));
  });

  return (
    <group ref={groupRef}>
      <group scale={[scale, scale, scale]}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(IDLE_MODEL_PATH);
useGLTF.preload(RUNNING_MODEL_PATH);
useGLTF.preload(WAVING_MODEL_PATH);
useGLTF.preload(POINTING_MODEL_PATH);
useGLTF.preload(CLAPPING_MODEL_PATH);
