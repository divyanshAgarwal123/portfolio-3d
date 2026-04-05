'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

type RobotProps = {
  position: [number, number, number];
  scale: number;
  rotation?: [number, number, number];
};

const DRACO_DECODER_PATH = '/draco-gltf/';
const ROBOT_IDLE_PATH = '/models/robot_animation/robot_cute_idle.glb';
const ROBOT_RUNNING_PATH = '/models/robot_animation/robot_cute_running.glb';
const ROBOT_WAVING_PATH = '/models/robot_animation/robot_cute_waving.glb';
const ROBOT_POINTING_PATH = '/models/robot_animation/robot_cute_pointing.glb';
const ROBOT_CLAPPING_PATH = '/models/robot_animation/robot_cute_clapping.glb';

type RobotModelProps = RobotProps & {
  path: string;
  label: string;
};

function RobotModel({ path, label, position, scale, rotation = [0, 0, 0] }: RobotModelProps) {
  const gltf = useGLTF(path, DRACO_DECODER_PATH);
  const clonedScene = useMemo(() => clone(gltf.scene), [gltf.scene]);

  useEffect(() => {
    clonedScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [clonedScene]);

  const { actions } = useAnimations(gltf.animations, clonedScene);

  useEffect(() => {
    const actionNames = Object.keys(actions);
    console.log(`${label} clips:`, actionNames);

    const action = actions[actionNames[0]];
    if (!action) return;

    action.enabled = true;
    action.reset().fadeIn(0.15).play();

    return () => {
      action.fadeOut(0.1);
    };
  }, [actions, label]);

  return (
    <group position={position} rotation={rotation}>
      <group scale={[scale, scale, scale]}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

export function RobotIdle(props: RobotProps) {
  return <RobotModel {...props} path={ROBOT_IDLE_PATH} label="RobotIdle" />;
}

export function RobotRunning(props: RobotProps) {
  return <RobotModel {...props} path={ROBOT_RUNNING_PATH} label="RobotRunning" />;
}

export function RobotWaving(props: RobotProps) {
  return <RobotModel {...props} path={ROBOT_WAVING_PATH} label="RobotWaving" />;
}

export function RobotPointing(props: RobotProps) {
  return <RobotModel {...props} path={ROBOT_POINTING_PATH} label="RobotPointing" />;
}

export function RobotClapping(props: RobotProps) {
  return <RobotModel {...props} path={ROBOT_CLAPPING_PATH} label="RobotClapping" />;
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(ROBOT_IDLE_PATH);
useGLTF.preload(ROBOT_RUNNING_PATH);
useGLTF.preload(ROBOT_WAVING_PATH);
useGLTF.preload(ROBOT_POINTING_PATH);
useGLTF.preload(ROBOT_CLAPPING_PATH);
