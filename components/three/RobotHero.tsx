'use client';

import { useAnimations, useGLTF, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const DRACO_DECODER_PATH = '/draco-gltf/';
const FALLING_MODEL_PATH = '/models/robot_cute_falling.glb';
const POINTING_MODEL_PATH = '/models/robot_cute_pointing_back.glb';
const CLAPPING_MODEL_PATH = '/models/robot_cute_clapping.glb';
const FALL_START_Y = 0.30;
const LAND_Y = -0.36;
const ROBOT_X = 0;
const ROBOT_Z = 0.49;
const ROBOT_SCALE = 0.03;
const CLAP_SCROLL_THRESHOLD = 0.04;
const TURN_DURATION = 0.35;
const POINTING_TO_CLAP_FADE = 0.2;

type RobotTransform = {
  position: [number, number, number];
  scale: number;
};

type RobotHeroProps = {
  fallingTransform?: RobotTransform;
  pointingTransform?: RobotTransform;
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
  fallingTransform = { position: [ROBOT_X, FALL_START_Y, ROBOT_Z], scale: ROBOT_SCALE },
  pointingTransform = { position: [ROBOT_X, LAND_Y, ROBOT_Z], scale: ROBOT_SCALE },
}: RobotHeroProps) {
  const scroll = useScroll();
  const fallingGltf = useGLTF(FALLING_MODEL_PATH, DRACO_DECODER_PATH);
  const pointingGltf = useGLTF(POINTING_MODEL_PATH, DRACO_DECODER_PATH);
  const clappingGltf = useGLTF(CLAPPING_MODEL_PATH, DRACO_DECODER_PATH);

  const fallingScene = useMemo(() => clone(fallingGltf.scene), [fallingGltf.scene]);
  const pointingScene = useMemo(() => clone(pointingGltf.scene), [pointingGltf.scene]);
  const clappingScene = useMemo(() => clone(clappingGltf.scene), [clappingGltf.scene]);

  const { actions: fallingActions, mixer: fallingMixer } = useAnimations(
    fallingGltf.animations,
    fallingScene,
  );
  const { actions: pointingActions } = useAnimations(pointingGltf.animations, pointingScene);
  const { actions: clappingActions } = useAnimations(clappingGltf.animations, clappingScene);

  const fallingActionRef = useRef<THREE.AnimationAction | null>(null);
  const pointingActionRef = useRef<THREE.AnimationAction | null>(null);
  const clappingActionRef = useRef<THREE.AnimationAction | null>(null);
  const phase = useRef<'falling' | 'landed' | 'pointing' | 'turning' | 'clapping'>('falling');
  const fallingDoneRef = useRef(false);
  const switchedRef = useRef(false);
  const clapTriggeredRef = useRef(false);
  const fallClipDurationRef = useRef(0);
  const fallOpacityRef = useRef(1);
  const pointOpacityRef = useRef(0);
  const clapOpacityRef = useRef(0);
  const turnProgressRef = useRef(0);
  const turnStartYawRef = useRef(0);
  const turnTargetYawRef = useRef(0);

  const fallingRef = useRef<THREE.Group>(null);
  const pointingRef = useRef<THREE.Group>(null);
  const clappingRef = useRef<THREE.Group>(null);

  const startPointingTransition = () => {
    if (switchedRef.current) return;

    fallingDoneRef.current = true;
    fallingActionRef.current?.fadeOut(0.15);

    if (pointingRef.current) {
      pointingRef.current.visible = true;
      pointingActionRef.current?.reset().fadeIn(0.15).play();
    }

    switchedRef.current = true;
    phase.current = 'pointing';
    console.log('[RobotHero] phase -> pointing');
  };

  const startClappingTransition = () => {
    if (clapTriggeredRef.current) return;
    if (!pointingRef.current) return;

    clapTriggeredRef.current = true;
    phase.current = 'turning';
    turnProgressRef.current = 0;
    turnStartYawRef.current = pointingRef.current.rotation.y;
    turnTargetYawRef.current = turnStartYawRef.current + Math.PI;
    clapOpacityRef.current = 0;

    if (clappingRef.current) {
      clappingRef.current.visible = true;
      clappingRef.current.rotation.y = turnStartYawRef.current;
    }

    clappingActionRef.current?.reset().fadeIn(POINTING_TO_CLAP_FADE).play();
    pointingActionRef.current?.fadeOut(POINTING_TO_CLAP_FADE);

    console.log('[RobotHero] phase -> turning');
  };

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

    clappingScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [fallingScene, pointingScene, clappingScene]);

  useEffect(() => {
    const names = Object.keys(fallingActions);
    console.log('Falling clips:', names);

    const action = fallingActions[names[0]];
    if (!action) return;

    fallingActionRef.current = action;
    fallClipDurationRef.current = action.getClip().duration;
    action.enabled = true;
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.reset().fadeIn(0.3).play();

    if (fallingRef.current) {
      gsap.to(fallingRef.current.position, {
        y: pointingTransform.position[1],
        duration: 5,
        ease: 'power4.in',
        onComplete: () => {
          phase.current = 'landed';
        },
      });
    }

    const onFinished = (event: THREE.Event & { action?: THREE.AnimationAction }) => {
      if (event.action !== action) return;
      startPointingTransition();
    };

    fallingMixer.addEventListener('finished', onFinished);

    return () => {
      fallingMixer.removeEventListener('finished', onFinished);
      if (fallingRef.current) {
        gsap.killTweensOf(fallingRef.current.position);
      }
      action.fadeOut(0.3);
    };
  }, [fallingActions, fallingMixer, pointingTransform.position]);

  useEffect(() => {
    const names = Object.keys(pointingActions);
    console.log('[RobotHero] PointingBack clips:', names);

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
    const names = Object.keys(clappingActions);
    console.log('[RobotHero] Clapping clips:', names);

    const action = clappingActions[names[0]];
    if (!action) return;

    clappingActionRef.current = action;
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;

    return () => {
      action.fadeOut(0.3);
    };
  }, [clappingActions]);

  useEffect(() => {
    phase.current = 'falling';
    fallingDoneRef.current = false;
    switchedRef.current = false;
    clapTriggeredRef.current = false;
    fallOpacityRef.current = 1;
    pointOpacityRef.current = 0;
    clapOpacityRef.current = 0;
    turnProgressRef.current = 0;
    turnStartYawRef.current = 0;
    turnTargetYawRef.current = 0;

    if (fallingRef.current) {
      fallingRef.current.position.set(
        fallingTransform.position[0],
        fallingTransform.position[1],
        fallingTransform.position[2],
      );
      fallingRef.current.scale.setScalar(fallingTransform.scale);
    }

    if (pointingRef.current) {
      pointingRef.current.visible = false;
      pointingRef.current.rotation.y = 0;
    }

    if (clappingRef.current) {
      clappingRef.current.visible = false;
      clappingRef.current.rotation.y = 0;
    }

    if (fallingRef.current) {
      fallingRef.current.visible = true;
    }

    setMeshOpacity(fallingScene, 1);
    setMeshOpacity(pointingScene, 0);
    setMeshOpacity(clappingScene, 0);

    console.log('[RobotHero] phase -> falling');
  }, [fallingScene, pointingScene, clappingScene, fallingTransform]);

  useFrame((_, delta) => {
    if (fallingRef.current) {
      fallingRef.current.position.x = fallingTransform.position[0];
      fallingRef.current.position.z = fallingTransform.position[2];
      fallingRef.current.scale.setScalar(fallingTransform.scale);
    }

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
        pointingTransform.position[0],
        pointingTransform.position[1],
        pointingTransform.position[2],
      );
      clappingRef.current.scale.setScalar(pointingTransform.scale);
    }

    if (!switchedRef.current && phase.current === 'landed' && fallingActionRef.current) {
      const remaining = fallClipDurationRef.current - fallingActionRef.current.time;
      if (remaining <= 2) {
        startPointingTransition();
      }
    }

    if (
      switchedRef.current &&
      !clapTriggeredRef.current &&
      phase.current === 'pointing' &&
      scroll.offset >= CLAP_SCROLL_THRESHOLD
    ) {
      console.log(`[RobotHero] scroll threshold reached: ${scroll.offset.toFixed(3)} >= ${CLAP_SCROLL_THRESHOLD}`);
      startClappingTransition();
    }

    if (switchedRef.current) {
      fallOpacityRef.current = Math.max(0, fallOpacityRef.current - delta / 0.15);
      if (!clapTriggeredRef.current) {
        pointOpacityRef.current = Math.min(1, pointOpacityRef.current + delta / 0.15);
      }

      setMeshOpacity(fallingScene, fallOpacityRef.current);
      setMeshOpacity(pointingScene, pointOpacityRef.current);

      if (fallOpacityRef.current <= 0.001 && fallingRef.current) {
        fallingRef.current.visible = false;
      }
    }

    if (clapTriggeredRef.current && phase.current === 'turning') {
      turnProgressRef.current = Math.min(1, turnProgressRef.current + delta / TURN_DURATION);
      const easedTurn = THREE.MathUtils.smootherstep(turnProgressRef.current, 0, 1);
      const yaw = THREE.MathUtils.lerp(turnStartYawRef.current, turnTargetYawRef.current, easedTurn);

      if (pointingRef.current) pointingRef.current.rotation.y = yaw;
      if (clappingRef.current) clappingRef.current.rotation.y = yaw;

      pointOpacityRef.current = Math.max(0, pointOpacityRef.current - delta / POINTING_TO_CLAP_FADE);
      clapOpacityRef.current = Math.min(1, clapOpacityRef.current + delta / POINTING_TO_CLAP_FADE);

      setMeshOpacity(pointingScene, pointOpacityRef.current);
      setMeshOpacity(clappingScene, clapOpacityRef.current);

      if (pointOpacityRef.current <= 0.001 && pointingRef.current) {
        pointingRef.current.visible = false;
      }

      if (turnProgressRef.current >= 1) {
        phase.current = 'clapping';
        if (clappingRef.current) clappingRef.current.rotation.y = turnTargetYawRef.current;
        console.log('[RobotHero] phase -> clapping');
      }
    }

    if (phase.current === 'clapping') {
      setMeshOpacity(clappingScene, 1);
      if (clappingRef.current) clappingRef.current.visible = true;
    }
  });

  return (
    <>
      <group ref={fallingRef}>
        <primitive object={fallingScene} />
      </group>

      <group
        ref={pointingRef}
        position={[pointingTransform.position[0], pointingTransform.position[1], pointingTransform.position[2]]}
        scale={[pointingTransform.scale, pointingTransform.scale, pointingTransform.scale]}
      >
        <primitive object={pointingScene} />
      </group>

      <group
        ref={clappingRef}
        position={[pointingTransform.position[0], pointingTransform.position[1], pointingTransform.position[2]]}
        scale={[pointingTransform.scale, pointingTransform.scale, pointingTransform.scale]}
      >
        <primitive object={clappingScene} />
      </group>
    </>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(FALLING_MODEL_PATH);
useGLTF.preload(POINTING_MODEL_PATH);
useGLTF.preload(CLAPPING_MODEL_PATH);
