'use client';

import { useAnimations, useGLTF, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const DRACO_DECODER_PATH = '/draco-gltf/';
const FALLING_MODEL_PATH = '/models/robot_cute_falling.glb';
const POINTING_MODEL_PATH = '/models/robot_cute_pointing_back.glb';
const RUNNING_MODEL_PATH = '/models/robot_animation/robot_walking_while_texting copy.glb';
const RUNNING_START_X = 0.004;
const RUNNING_START_Y = -0.36;
const RUNNING_START_Z = 0.56;
const RUNNING_END_Z = 2.19;
const RUNNING_MODEL_Z_OFFSET = 1.63;
const RUNNING_Z_DURATION = 3.5;
const POINT_FADE_DURATION = 0.2;
const RUN_FADE_DURATION = 0.2;
const RUN_EASE = 'power1.inOut';
const POINT_CLIP = '';
const RUN_CLIP = '';
const FALL_START_Y = 0.30;
const LAND_Y = -0.36;
const ROBOT_X = 0;
const ROBOT_Z = 0.49;
const ROBOT_SCALE = 0.03;
const RUNNING_SCROLL_THRESHOLD = 0.04;

type HeroPhase = 'falling' | 'landed' | 'pointing' | 'running';

type RobotTransform = {
  position: [number, number, number];
  scale: number;
};

type RobotHeroProps = {
  fallingTransform?: RobotTransform;
  pointingTransform?: RobotTransform;
  runningTransform?: RobotTransform;
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
  runningTransform = { position: [0.004, -0.36, 0.56], scale: 0.03 },
}: RobotHeroProps) {
  const scroll = useScroll();

  const fallingGltf = useGLTF(FALLING_MODEL_PATH, DRACO_DECODER_PATH);
  const pointingGltf = useGLTF(POINTING_MODEL_PATH, DRACO_DECODER_PATH);
  const runningGltf = useGLTF(RUNNING_MODEL_PATH, DRACO_DECODER_PATH);

  const fallingScene = useMemo(() => SkeletonUtils.clone(fallingGltf.scene), [fallingGltf.scene]);
  const pointingScene = useMemo(() => SkeletonUtils.clone(pointingGltf.scene), [pointingGltf.scene]);
  const runningScene = useMemo(() => SkeletonUtils.clone(runningGltf.scene), [runningGltf.scene]);

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
  const runningTriggered = useRef(false);
  const fallClipDurationRef = useRef(0);
  const fallOpacityRef = useRef(1);
  const pointOpacityRef = useRef(0);

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
    if (phase.current !== 'pointing') return;

    phase.current = 'running';
    console.debug('[RobotHero] phase -> running (threshold reached)');

    if (POINT_CLIP && pointingActions[POINT_CLIP]) {
      pointingActions[POINT_CLIP]?.fadeOut(POINT_FADE_DURATION);
    } else {
      pointingActionRef.current?.fadeOut(POINT_FADE_DURATION);
    }

    gsap.delayedCall(POINT_FADE_DURATION, () => {
      if (pointingRef.current) {
        pointingRef.current.visible = false;
      }
    });

    if (runningRef.current) {
      runningRef.current.visible = true;
      runningRef.current.position.set(
        runningTransform.position[0],
        runningTransform.position[1],
        RUNNING_START_Z + RUNNING_MODEL_Z_OFFSET,
      );
      runningRef.current.scale.setScalar(runningTransform.scale);
    }
    setMeshOpacity(runningScene, 1);

    if (RUN_CLIP && runningActions[RUN_CLIP]) {
      runningActions[RUN_CLIP]?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(RUN_FADE_DURATION).play();
    } else {
      runningActionRef.current?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(RUN_FADE_DURATION).play();
    }

    if (runningRef.current) {
      gsap.to(runningRef.current.position, {
        z: RUNNING_END_Z + RUNNING_MODEL_Z_OFFSET,
        duration: RUNNING_Z_DURATION,
        ease: RUN_EASE,
      });
    }
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
    runningTriggered.current = false;
    fallOpacityRef.current = 1;
    pointOpacityRef.current = 0;

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
        runningTransform.position[0],
        runningTransform.position[1],
        runningTransform.position[2] + RUNNING_MODEL_Z_OFFSET,
      );
      runningRef.current.scale.setScalar(runningTransform.scale);
    }

    if (fallingRef.current) {
      fallingRef.current.visible = true;
    }

    setMeshOpacity(fallingScene, 1);
    setMeshOpacity(pointingScene, 0);
    setMeshOpacity(runningScene, 0);
  }, [fallingScene, pointingScene, runningScene]);

  useEffect(() => {
    return () => {
      if (runningRef.current) {
        gsap.killTweensOf(runningRef.current.position);
      }
    };
  }, []);

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
      runningRef.current.position.x = runningTransform.position[0];
      runningRef.current.position.y = runningTransform.position[1];
      runningRef.current.scale.setScalar(runningTransform.scale);

      if (phase.current !== 'running') {
        runningRef.current.position.z = runningTransform.position[2] + RUNNING_MODEL_Z_OFFSET;
      }
    }

    void delta;

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

    if (scroll.offset >= RUNNING_SCROLL_THRESHOLD && !runningTriggered.current && phase.current === 'pointing') {
      runningTriggered.current = true;
      startRunningTransition();
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
        position={[
          runningTransform.position[0],
          runningTransform.position[1],
          runningTransform.position[2] + RUNNING_MODEL_Z_OFFSET,
        ]}
        scale={[runningTransform.scale, runningTransform.scale, runningTransform.scale]}
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
useGLTF.preload('models/robot_animation/robot_walking_while_texting copy.glb');
