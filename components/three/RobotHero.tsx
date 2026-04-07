'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const DRACO_DECODER_PATH = '/draco-gltf/';
const POINTING_MODEL_PATH = '/models/robot_animation/robot_cute_pointing_backwords.glb';
const CLAPPING_MODEL_PATH = '/models/robot_animation/robot_cute_clapping.glb';
const TURN_TRIGGER_OFFSET = 0.04;
const RESET_OFFSET = 0.01;
const TRANSITION_SECONDS = 0.45;
const TURN_DAMPING = 6;
const LAND_Y = -0.36;
const ROBOT_X = 0.004;
const ROBOT_Z = 0.56;
const ROBOT_SCALE = 0.03;

type Phase = 'pointing' | 'turning' | 'clapping';

type RobotTransform = {
  position: [number, number, number];
  scale: number;
};

type RobotHeroProps = {
  fallingTransform?: RobotTransform;
  pointingTransform?: RobotTransform;
  clappingTransform?: RobotTransform;
  scrollOffset?: number;
};

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

export default function RobotHero({
  pointingTransform = { position: [ROBOT_X, LAND_Y, ROBOT_Z], scale: ROBOT_SCALE },
  clappingTransform = { position: [ROBOT_X, LAND_Y, ROBOT_Z], scale: ROBOT_SCALE },
  scrollOffset = 0,
}: RobotHeroProps) {
  const pointingGltf = useGLTF(POINTING_MODEL_PATH, DRACO_DECODER_PATH);
  const clappingGltf = useGLTF(CLAPPING_MODEL_PATH, DRACO_DECODER_PATH);

  const pointingScene = useMemo(() => clone(pointingGltf.scene), [pointingGltf.scene]);
  const clappingScene = useMemo(() => clone(clappingGltf.scene), [clappingGltf.scene]);

  const { actions: pointingActions } = useAnimations(pointingGltf.animations, pointingScene);
  const { actions: clappingActions } = useAnimations(clappingGltf.animations, clappingScene);

  const pointingActionRef = useRef<THREE.AnimationAction | null>(null);
  const clappingActionRef = useRef<THREE.AnimationAction | null>(null);
  const phaseRef = useRef<Phase>('pointing');
  const transitionStartedRef = useRef(false);
  const transitionProgressRef = useRef(0);
  const startYawRef = useRef(0);
  const targetYawRef = useRef(Math.PI);
  const pointOpacityRef = useRef(1);
  const clapOpacityRef = useRef(0);

  const pointingRef = useRef<THREE.Group>(null);
  const clappingRef = useRef<THREE.Group>(null);

  const beginTransition = () => {
    if (transitionStartedRef.current) return;
    transitionStartedRef.current = true;
    phaseRef.current = 'turning';
    transitionProgressRef.current = 0;

    if (pointingRef.current) {
      startYawRef.current = pointingRef.current.rotation.y;
      targetYawRef.current = startYawRef.current + Math.PI;
    }

    clappingRef.current!.visible = true;
    pointingActionRef.current?.fadeOut(TRANSITION_SECONDS);
    clappingActionRef.current?.reset().fadeIn(TRANSITION_SECONDS).play();
    console.log('[RobotHero] phase: pointing -> turning');
  };

  const resetToPointing = () => {
    phaseRef.current = 'pointing';
    transitionStartedRef.current = false;
    transitionProgressRef.current = 0;
    pointOpacityRef.current = 1;
    clapOpacityRef.current = 0;

    if (pointingRef.current) {
      pointingRef.current.visible = true;
      pointingRef.current.rotation.y = 0;
    }
    if (clappingRef.current) {
      clappingRef.current.visible = false;
    }

    clappingActionRef.current?.stop();
    pointingActionRef.current?.reset().fadeIn(0.2).play();
    setMeshOpacity(pointingScene, 1);
    setMeshOpacity(clappingScene, 0);
    console.log('[RobotHero] phase reset -> pointing');
  };

  useEffect(() => {
    pointingScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });

    clappingScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [pointingScene, clappingScene]);

  useEffect(() => {
    const names = Object.keys(pointingActions);
    console.log('[RobotHero] pointing clips:', names);

    const action = pointingActions[names[0]];
    if (!action) return;

    pointingActionRef.current = action;
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;
    action.reset().fadeIn(0.2).play();

    return () => {
      action.fadeOut(0.2);
    };
  }, [pointingActions]);

  useEffect(() => {
    const names = Object.keys(clappingActions);
    console.log('[RobotHero] clapping clips:', names);

    const action = clappingActions[names[0]];
    if (!action) return;

    clappingActionRef.current = action;
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;

    return () => {
      action.fadeOut(0.2);
    };
  }, [clappingActions]);

  useEffect(() => {
    phaseRef.current = 'pointing';
    transitionStartedRef.current = false;
    transitionProgressRef.current = 0;
    pointOpacityRef.current = 1;
    clapOpacityRef.current = 0;

    if (pointingRef.current) {
      pointingRef.current.visible = true;
      pointingRef.current.rotation.y = 0;
    }
    if (clappingRef.current) {
      clappingRef.current.visible = false;
    }

    setMeshOpacity(pointingScene, 0);
    setMeshOpacity(clappingScene, 0);
    console.log('[RobotHero] phase: pointing');
  }, [pointingScene, clappingScene]);

  useFrame((_, delta) => {
    if (pointingRef.current) {
      pointingRef.current.position.set(
        pointingTransform.position[0],
        pointingTransform.position[1],
        pointingTransform.position[2],
      );
      pointingRef.current.scale.setScalar(pointingTransform.scale);
    }

    if (clappingRef.current) {
      clappingRef.current.position.set(
        clappingTransform.position[0],
        clappingTransform.position[1],
        clappingTransform.position[2],
      );
      clappingRef.current.scale.setScalar(clappingTransform.scale);
    }

    if (scrollOffset >= TURN_TRIGGER_OFFSET) {
      beginTransition();
    } else if (scrollOffset <= RESET_OFFSET && transitionStartedRef.current) {
      resetToPointing();
    }

    if (phaseRef.current === 'turning' && pointingRef.current) {
      transitionProgressRef.current = Math.min(1, transitionProgressRef.current + delta / TRANSITION_SECONDS);
      pointOpacityRef.current = 1 - transitionProgressRef.current;
      clapOpacityRef.current = transitionProgressRef.current;

      pointingRef.current.rotation.y = THREE.MathUtils.damp(
        pointingRef.current.rotation.y,
        targetYawRef.current,
        TURN_DAMPING,
        delta,
      );

      setMeshOpacity(pointingScene, pointOpacityRef.current);
      setMeshOpacity(clappingScene, clapOpacityRef.current);

      const yawDone = Math.abs(pointingRef.current.rotation.y - targetYawRef.current) < 0.02;
      const fadeDone = transitionProgressRef.current >= 0.999;
      if (yawDone && fadeDone) {
        phaseRef.current = 'clapping';
        if (pointingRef.current) {
          pointingRef.current.visible = false;
        }
        console.log('[RobotHero] phase: turning -> clapping');
      }
    }
  });

  return (
    <>
      <group
        ref={pointingRef}
        position={[pointingTransform.position[0], pointingTransform.position[1], pointingTransform.position[2]]}
        scale={[pointingTransform.scale, pointingTransform.scale, pointingTransform.scale]}
      >
        <primitive object={pointingScene} />
      </group>

      <group
        ref={clappingRef}
        position={[clappingTransform.position[0], clappingTransform.position[1], clappingTransform.position[2]]}
        scale={[clappingTransform.scale, clappingTransform.scale, clappingTransform.scale]}
      >
        <primitive object={clappingScene} />
      </group>
    </>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(POINTING_MODEL_PATH);
useGLTF.preload(CLAPPING_MODEL_PATH);
