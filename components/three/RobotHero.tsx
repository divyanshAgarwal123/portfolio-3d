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
const RUNNING_MODEL_PATH = '/models/robot_animation/robot_walking_while_texting copy.glb';
const FALL_START_Y = 0.30;
const LAND_Y = -0.36;
const ROBOT_X = 0;
const ROBOT_Z = 0.49;
const ROBOT_SCALE = 0.03;
const RUNNING_TARGET_Z = -1.08;
const RUNNING_SCROLL_THRESHOLD = 0.04;
const RUNNING_Z_DAMPING = 4.5;

type HeroPhase = 'falling' | 'landed' | 'pointing' | 'runningTransition' | 'running';

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
  const runningGltf = useGLTF(RUNNING_MODEL_PATH, DRACO_DECODER_PATH);

  const fallingScene = useMemo(() => clone(fallingGltf.scene), [fallingGltf.scene]);
  const pointingScene = useMemo(() => clone(pointingGltf.scene), [pointingGltf.scene]);
  const runningScene = useMemo(() => clone(runningGltf.scene), [runningGltf.scene]);

  const { actions: fallingActions, mixer: fallingMixer } = useAnimations(
    fallingGltf.animations,
    fallingScene,
  );
  const { actions: pointingActions } = useAnimations(pointingGltf.animations, pointingScene);
  const { actions: runningActions } = useAnimations(runningGltf.animations, runningScene);

  const fallingActionRef = useRef<THREE.AnimationAction | null>(null);
  const pointingActionRef = useRef<THREE.AnimationAction | null>(null);
  const runningActionRef = useRef<THREE.AnimationAction | null>(null);
  const phase = useRef<HeroPhase>('falling');
  const fallingDoneRef = useRef(false);
  const switchedRef = useRef(false);
  const runningSwapStartedRef = useRef(false);
  const passedRunningThresholdRef = useRef(false);
  const fallClipDurationRef = useRef(0);
  const fallOpacityRef = useRef(1);
  const pointOpacityRef = useRef(0);
  const runOpacityRef = useRef(0);

  const fallingRef = useRef<THREE.Group>(null);
  const pointingRef = useRef<THREE.Group>(null);
  const runningRef = useRef<THREE.Group>(null);

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
    console.debug('[RobotHero] phase -> pointing');
  };

  const startRunningTransition = () => {
    if (runningSwapStartedRef.current) return;
    if (phase.current !== 'pointing') return;

    runningSwapStartedRef.current = true;
    phase.current = 'runningTransition';
    console.debug('[RobotHero] phase -> runningTransition (threshold reached)');

    if (runningRef.current) {
      runningRef.current.visible = true;
      runningRef.current.position.set(
        pointingTransform.position[0],
        pointingTransform.position[1],
        pointingTransform.position[2],
      );
      runningRef.current.scale.setScalar(pointingTransform.scale);
    }

    runningActionRef.current?.reset().fadeIn(0.25).play();
    pointingActionRef.current?.fadeOut(0.25);
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

    runningScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [fallingScene, pointingScene, runningScene]);

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
    const names = Object.keys(runningActions);
    console.log('Running clips:', names);

    const action = runningActions[names[0]];
    if (!action) return;

    runningActionRef.current = action;
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;

    return () => {
      action.fadeOut(0.3);
    };
  }, [runningActions]);

  useEffect(() => {
    phase.current = 'falling';
    fallingDoneRef.current = false;
    switchedRef.current = false;
    runningSwapStartedRef.current = false;
    passedRunningThresholdRef.current = false;
    fallOpacityRef.current = 1;
    pointOpacityRef.current = 0;
    runOpacityRef.current = 0;

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
    }

    if (runningRef.current) {
      runningRef.current.visible = false;
      runningRef.current.position.set(
        pointingTransform.position[0],
        pointingTransform.position[1],
        pointingTransform.position[2],
      );
      runningRef.current.scale.setScalar(pointingTransform.scale);
    }

    if (fallingRef.current) {
      fallingRef.current.visible = true;
    }

    setMeshOpacity(fallingScene, 1);
    setMeshOpacity(pointingScene, 0);
    setMeshOpacity(runningScene, 0);
  }, [fallingScene, pointingScene, runningScene, fallingTransform, pointingTransform]);

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

    if (runningRef.current) {
      runningRef.current.position.x = pointingTransform.position[0];
      runningRef.current.position.y = pointingTransform.position[1];
      runningRef.current.scale.setScalar(pointingTransform.scale);
    }

    if (scroll.offset >= RUNNING_SCROLL_THRESHOLD) {
      passedRunningThresholdRef.current = true;
    }

    if (!switchedRef.current && phase.current === 'landed' && fallingActionRef.current) {
      const remaining = fallClipDurationRef.current - fallingActionRef.current.time;
      if (remaining <= 2) {
        startPointingTransition();
      }
    }

    if (switchedRef.current) {
      fallOpacityRef.current = Math.max(0, fallOpacityRef.current - delta / 0.15);
      pointOpacityRef.current = Math.min(1, pointOpacityRef.current + delta / 0.15);

      setMeshOpacity(fallingScene, fallOpacityRef.current);
      setMeshOpacity(pointingScene, pointOpacityRef.current);

      if (fallOpacityRef.current <= 0.001 && fallingRef.current) {
        fallingRef.current.visible = false;
      }
    }

    if (!runningSwapStartedRef.current && phase.current === 'pointing') {
      const isDownwardScroll = scroll.delta > 0;
      if (passedRunningThresholdRef.current && (isDownwardScroll || scroll.offset >= RUNNING_SCROLL_THRESHOLD)) {
        startRunningTransition();
      }
    }

    if (phase.current === 'runningTransition') {
      pointOpacityRef.current = Math.max(0, pointOpacityRef.current - delta / 0.25);
      runOpacityRef.current = Math.min(1, runOpacityRef.current + delta / 0.25);

      setMeshOpacity(pointingScene, pointOpacityRef.current);
      setMeshOpacity(runningScene, runOpacityRef.current);

      if (pointOpacityRef.current <= 0.001 && pointingRef.current) {
        pointingRef.current.visible = false;
      }

      if (runOpacityRef.current >= 0.999) {
        phase.current = 'running';
        console.debug('[RobotHero] phase -> running');
      }
    }

    if (phase.current === 'running' && runningRef.current) {
      runningRef.current.position.z = THREE.MathUtils.damp(
        runningRef.current.position.z,
        RUNNING_TARGET_Z,
        RUNNING_Z_DAMPING,
        delta,
      );
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
        ref={runningRef}
        position={[pointingTransform.position[0], pointingTransform.position[1], pointingTransform.position[2]]}
        scale={[pointingTransform.scale, pointingTransform.scale, pointingTransform.scale]}
      >
        <primitive object={runningScene} />
      </group>
    </>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(FALLING_MODEL_PATH);
useGLTF.preload(POINTING_MODEL_PATH);
useGLTF.preload(RUNNING_MODEL_PATH);
