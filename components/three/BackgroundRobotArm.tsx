'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const DRACO_DECODER_PATH = '/draco-gltf/';
const ROBOT_ARM_MODEL_PATH = '/models/basic_robot_arm.glb';

type RobotArmTransform = {
  position: [number, number, number];
  scale: number;
};

type BackgroundRobotArmProps = {
  transform?: RobotArmTransform;
};

export default function BackgroundRobotArm({
  transform = { position: [0.9, -0.36, -0.44], scale: 0.0003 },
}: BackgroundRobotArmProps) {
  const gltf = useGLTF(ROBOT_ARM_MODEL_PATH, DRACO_DECODER_PATH);
  const armScene = useMemo(() => clone(gltf.scene), [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, armScene);
  const actionRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    armScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [armScene]);

  useEffect(() => {
    const names = Object.keys(actions);
    const first = names[0];
    if (!first) return;

    const action = actions[first];
    if (!action) return;

    console.log('BackgroundRobotArm clip:', first);

    actionRef.current = action;
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;
    action.reset().fadeIn(0.3).play();

    return () => {
      action.fadeOut(0.2);
    };
  }, [actions]);

  return (
    <group
      position={[transform.position[0], transform.position[1], transform.position[2]]}
      scale={[transform.scale, transform.scale, transform.scale]}
      rotation={[0, 0, 0]}
    >
      <primitive object={armScene} />
    </group>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(ROBOT_ARM_MODEL_PATH);
