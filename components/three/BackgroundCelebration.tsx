'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

type CelebrationRobotProps = {
  position: [number, number, number];
  scale: number;
  rotation?: [number, number, number];
};

type BaseCelebrationRobotProps = CelebrationRobotProps & {
  modelPath: string;
  label: string;
  delayMs: number;
};

const DRACO_DECODER_PATH = '/draco-gltf/';

const ROBOT_CHEERING_PATH = '/models/cheering.glb';
const ROBOT_CHEERING2_PATH = '/models/cheering2.glb';
const ROBOT_CLAPPING_PATH = '/models/clapping.glb';
const ROBOT_CRAZY_DANCING_PATH = '/models/crazy_dancing.glb';
const ROBOT_EXCITED_PATH = '/models/excited.glb';
const ROBOT_RALLYING_PATH = '/models/silly_dancing.glb';

function BaseCelebrationRobot({
  modelPath,
  label,
  delayMs,
  position,
  scale,
  rotation = [0, 0, 0],
}: BaseCelebrationRobotProps) {
  const [visible, setVisible] = useState(delayMs === 0);
  const gltf = useGLTF(modelPath, DRACO_DECODER_PATH);
  const scene = useMemo(() => clone(gltf.scene), [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, scene);

  useEffect(() => {
    if (delayMs === 0) return;
    const timeoutId = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timeoutId);
  }, [delayMs]);

  useEffect(() => {
    scene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!visible) return;

    const firstClipName = gltf.animations[0]?.name;
    const fallbackName = Object.keys(actions)[0];
    const clipName = firstClipName ?? fallbackName;
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
  }, [actions, gltf.animations, label, visible]);

  if (!visible) return null;

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={scene} />
    </group>
  );
}

export function RobotCheering(props: CelebrationRobotProps) {
  return <BaseCelebrationRobot {...props} modelPath={ROBOT_CHEERING_PATH} label="RobotCheering" delayMs={0} />;
}

export function RobotCheering2(props: CelebrationRobotProps) {
  return <BaseCelebrationRobot {...props} modelPath={ROBOT_CHEERING2_PATH} label="RobotCheering2" delayMs={600} />;
}

export function RobotClapping(props: CelebrationRobotProps) {
  return <BaseCelebrationRobot {...props} modelPath={ROBOT_CLAPPING_PATH} label="RobotClapping" delayMs={1200} />;
}

export function RobotCrazyDancing(props: CelebrationRobotProps) {
  return (
    <BaseCelebrationRobot
      {...props}
      modelPath={ROBOT_CRAZY_DANCING_PATH}
      label="RobotCrazyDancing"
      delayMs={1800}
    />
  );
}

export function RobotExcited(props: CelebrationRobotProps) {
  return <BaseCelebrationRobot {...props} modelPath={ROBOT_EXCITED_PATH} label="RobotExcited" delayMs={2400} />;
}

export function RobotRallying(props: CelebrationRobotProps) {
  return <BaseCelebrationRobot {...props} modelPath={ROBOT_RALLYING_PATH} label="RobotRallying" delayMs={3000} />;
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(ROBOT_CHEERING_PATH);
useGLTF.preload(ROBOT_CHEERING2_PATH);
useGLTF.preload(ROBOT_CLAPPING_PATH);
useGLTF.preload(ROBOT_CRAZY_DANCING_PATH);
useGLTF.preload(ROBOT_EXCITED_PATH);
useGLTF.preload(ROBOT_RALLYING_PATH);
