'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

type BackgroundRobotProps = {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
};

type BackgroundRobotsProps = {
  thinkingTransform?: BackgroundRobotProps;
  tellingSecretTransform?: BackgroundRobotProps;
  pushupTransform?: BackgroundRobotProps;
  nervousLookAroundTransform?: BackgroundRobotProps;
};

type BaseBackgroundRobotProps = BackgroundRobotProps & {
  modelPath: string;
  label: string;
};

const DRACO_DECODER_PATH = '/draco-gltf/';

const ROBOT_THINKING_PATH = '/models/robot_thinking.glb';
const ROBOT_TELLING_SECRET_PATH = '/models/robot_telling_secret.glb';
const ROBOT_PUSHUP_PATH = '/models/robot_pushup.glb';
const ROBOT_NERVOUS_LOOK_AROUND_PATH = '/models/robot_nervous_look_around_2.glb';

function BaseBackgroundRobot({ modelPath, label, position, scale, rotation }: BaseBackgroundRobotProps) {
  const gltf = useGLTF(modelPath, DRACO_DECODER_PATH);
  const scene = useMemo(() => clone(gltf.scene), [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, scene);

  useEffect(() => {
    scene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [scene]);

  useEffect(() => {
    const firstClip = gltf.animations[0]?.name;
    const fallback = Object.keys(actions)[0];
    const clipName = firstClip ?? fallback;
    if (!clipName) return;

    console.log(`${label} clip:`, clipName);

    const action = actions[clipName];
    if (!action) return;

    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;
    action.reset().fadeIn(0.5).play();

    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, gltf.animations, label]);

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
}

export function RobotThinking(props: BackgroundRobotProps) {
  return <BaseBackgroundRobot {...props} label="RobotThinking" modelPath={ROBOT_THINKING_PATH} />;
}

export function RobotTellingSecret(props: BackgroundRobotProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!visible) return null;
  return <BaseBackgroundRobot {...props} label="RobotTellingSecret" modelPath={ROBOT_TELLING_SECRET_PATH} />;
}

export function RobotPushup(props: BackgroundRobotProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setVisible(true), 1600);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!visible) return null;
  return <BaseBackgroundRobot {...props} label="RobotPushup" modelPath={ROBOT_PUSHUP_PATH} />;
}

export function RobotNervousLookAround(props: BackgroundRobotProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setVisible(true), 2400);
    return () => clearTimeout(timeoutId);
  }, []);

  if (!visible) return null;
  return (
    <BaseBackgroundRobot
      {...props}
      label="RobotNervousLookAround"
      modelPath={ROBOT_NERVOUS_LOOK_AROUND_PATH}
    />
  );
}

export default function BackgroundRobots({
  thinkingTransform = { position: [0, -0.36, 0.56], scale: 0.03, rotation: [0, 0, 0] },
  tellingSecretTransform = { position: [0, -0.36, 0.56], scale: 0.03, rotation: [0, 0, 0] },
  pushupTransform = { position: [0, -0.36, 0.56], scale: 0.03, rotation: [0, 0, 0] },
  nervousLookAroundTransform = { position: [0, -0.36, 0.56], scale: 0.03, rotation: [0, 0, 0] },
}: BackgroundRobotsProps) {
  return (
    <>
      <RobotThinking {...thinkingTransform} />
      <RobotTellingSecret {...tellingSecretTransform} />
      <RobotPushup {...pushupTransform} />
      <RobotNervousLookAround {...nervousLookAroundTransform} />
    </>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(ROBOT_THINKING_PATH);
useGLTF.preload(ROBOT_TELLING_SECRET_PATH);
useGLTF.preload(ROBOT_PUSHUP_PATH);
useGLTF.preload(ROBOT_NERVOUS_LOOK_AROUND_PATH);
