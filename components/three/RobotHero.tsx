'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const DRACO_DECODER_PATH = '/draco-gltf/';
const FALLING_MODEL_PATH = '/models/robot_cute_falling.glb';
const POINTING_MODEL_PATH = '/models/robot_cute_pointing_back.glb';
const FALL_START_Y = 0.25;
const LAND_Y = -0.36;
const ROBOT_X = 0;
const ROBOT_Z = 0.49;
const ROBOT_SCALE = 0.03;
const BOUNCE_OFFSET = 0.1;
const BOUNCE_DURATION = 0.3;

function setMeshOpacity(root: THREE.Object3D, opacity: number) {
  root.traverse((object) => {
    if (!(object as { isMesh?: boolean }).isMesh) return;

    const mesh = object as THREE.Mesh;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((material) => {
      const mat = material as THREE.Material & { opacity?: number; transparent?: boolean };
      mat.transparent = true;
      mat.opacity = opacity;
      mat.needsUpdate = true;
    });
  });
}

export default function RobotHero() {
  const fallingGltf = useGLTF(FALLING_MODEL_PATH, DRACO_DECODER_PATH);
  const pointingGltf = useGLTF(POINTING_MODEL_PATH, DRACO_DECODER_PATH);

  const fallingScene = useMemo(() => clone(fallingGltf.scene), [fallingGltf.scene]);
  const pointingScene = useMemo(() => clone(pointingGltf.scene), [pointingGltf.scene]);

  const { actions: fallingActions, mixer: fallingMixer } = useAnimations(
    fallingGltf.animations,
    fallingScene,
  );
  const { actions: pointingActions } = useAnimations(pointingGltf.animations, pointingScene);

  const fallingActionRef = useRef<THREE.AnimationAction | null>(null);
  const pointingActionRef = useRef<THREE.AnimationAction | null>(null);
  const phase = useRef<'falling' | 'landed' | 'switched'>('falling');
  const fallingDoneRef = useRef(false);
  const switchedRef = useRef(false);
  const fallOpacityRef = useRef(1);
  const pointOpacityRef = useRef(0);

  const fallingRef = useRef<THREE.Group>(null);
  const pointingRef = useRef<THREE.Group>(null);

  useEffect(() => {
    fallingScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });

    pointingScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [fallingScene, pointingScene]);

  useEffect(() => {
    const names = Object.keys(fallingActions);
    console.log('Falling clips:', names);

    const action = fallingActions[names[0]];
    if (!action) return;

    fallingActionRef.current = action;
    action.enabled = true;
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.reset().fadeIn(0.3).play();

    const onFinished = (event: THREE.Event & { action?: THREE.AnimationAction }) => {
      if (event.action === action) {
        fallingDoneRef.current = true;
      }
    };

    fallingMixer.addEventListener('finished', onFinished);

    return () => {
      fallingMixer.removeEventListener('finished', onFinished);
      action.fadeOut(0.3);
    };
  }, [fallingActions, fallingMixer]);

  useEffect(() => {
    const names = Object.keys(pointingActions);
    console.log('PointingBack clips:', names);

    const action = pointingActions[names[0]];
    if (!action) return;

    pointingActionRef.current = action;
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;

    return () => {
      action.fadeOut(0.3);
    };
  }, [pointingActions]);

  useEffect(() => {
    if (fallingRef.current) {
      fallingRef.current.position.set(ROBOT_X, FALL_START_Y, ROBOT_Z);
      fallingRef.current.scale.setScalar(ROBOT_SCALE);
    }

    if (pointingRef.current) {
      pointingRef.current.visible = false;
    }

    if (fallingRef.current) {
      fallingRef.current.visible = true;
    }

    setMeshOpacity(fallingScene, 1);
    setMeshOpacity(pointingScene, 0);
  }, [fallingScene, pointingScene]);

  useFrame((_, delta) => {
    if (phase.current === 'falling' && fallingRef.current) {
      fallingRef.current.position.y -= delta * 1.5;
      if (fallingRef.current.position.y <= LAND_Y) {
        fallingRef.current.position.y = LAND_Y;
        phase.current = 'landed';
      }
    }

    if (!switchedRef.current && phase.current === 'landed' && fallingDoneRef.current) {
      switchedRef.current = true;
      phase.current = 'switched';

      fallingActionRef.current?.fadeOut(0.3);
      if (pointingRef.current) {
        pointingRef.current.visible = true;
      }

      pointingActionRef.current?.reset().fadeIn(0.3).play();
    }

    if (switchedRef.current) {
      fallOpacityRef.current = Math.max(0, fallOpacityRef.current - delta / 0.3);
      pointOpacityRef.current = Math.min(1, pointOpacityRef.current + delta / 0.3);

      setMeshOpacity(fallingScene, fallOpacityRef.current);
      setMeshOpacity(pointingScene, pointOpacityRef.current);

      if (fallOpacityRef.current <= 0.001 && fallingRef.current) {
        fallingRef.current.visible = false;
      }
    }
  });

  return (
    <>
      <group ref={fallingRef}>
        <primitive object={fallingScene} />
      </group>

      <group
        ref={pointingRef}
        position={[ROBOT_X, LAND_Y, ROBOT_Z]}
        scale={[ROBOT_SCALE, ROBOT_SCALE, ROBOT_SCALE]}
      >
        <primitive object={pointingScene} />
      </group>
    </>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(FALLING_MODEL_PATH);
useGLTF.preload(POINTING_MODEL_PATH);
