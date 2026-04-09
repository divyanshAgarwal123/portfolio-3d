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
const CLIMBING_MODEL_PATH = '/models/robot_animation/robot_climbing_to_laptop.glb';
const STANDING_TO_SITTING_MODEL_PATH = '/models/robot_animation/robot_standing_to_sitting.glb';
const CUTELY_SITTING_MODEL_PATH = '/models/robot_animation/robot_cutely_sitting.glb';
const FALL_START_Y = 0.30;
const LAND_Y = -0.36;
const ROBOT_X = 0;
const ROBOT_Z = 0.49;
const ROBOT_SCALE = 0.03;
const RUNNING_SCROLL_THRESHOLD = 0.04;
const RUNNING_START_POSITION: [number, number, number] = [0.004, -0.36, 0.56];
const RUNNING_SCALE = 0.03;
const RUNNING_TARGET_Z = 1.08;

type HeroPhase = 'falling' | 'landed' | 'pointing' | 'runningTransition' | 'running';

type RobotTransform = {
  position: [number, number, number];
  scale: number;
};

type RobotHeroProps = {
  fallingTransform?: RobotTransform;
  pointingTransform?: RobotTransform;
  runningTransform?: RobotTransform;
  climbingTransform?: RobotTransform;
  standingToSittingTransform?: RobotTransform;
  cutelySittingTransform?: RobotTransform;
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
  runningTransform = { position: RUNNING_START_POSITION, scale: RUNNING_SCALE },
  climbingTransform = { position: [0.004, -0.36, 0.56], scale: 0.03 },
  standingToSittingTransform = { position: [0.004, -0.36, 0.56], scale: 0.03 },
  cutelySittingTransform = { position: [0.004, -0.36, 0.56], scale: 0.03 },
}: RobotHeroProps) {
  const scroll = useScroll();

  const fallingGltf = useGLTF(FALLING_MODEL_PATH, DRACO_DECODER_PATH);
  const pointingGltf = useGLTF(POINTING_MODEL_PATH, DRACO_DECODER_PATH);
  const runningGltf = useGLTF(RUNNING_MODEL_PATH, DRACO_DECODER_PATH);
  const climbingGltf = useGLTF(CLIMBING_MODEL_PATH, DRACO_DECODER_PATH);
  const standingToSittingGltf = useGLTF(STANDING_TO_SITTING_MODEL_PATH, DRACO_DECODER_PATH);
  const cutelySittingGltf = useGLTF(CUTELY_SITTING_MODEL_PATH, DRACO_DECODER_PATH);

  const fallingScene = useMemo(() => clone(fallingGltf.scene), [fallingGltf.scene]);
  const pointingScene = useMemo(() => clone(pointingGltf.scene), [pointingGltf.scene]);
  const runningScene = useMemo(() => clone(runningGltf.scene), [runningGltf.scene]);
  const climbingScene = useMemo(() => clone(climbingGltf.scene), [climbingGltf.scene]);
  const standingToSittingScene = useMemo(() => clone(standingToSittingGltf.scene), [standingToSittingGltf.scene]);
  const cutelySittingScene = useMemo(() => clone(cutelySittingGltf.scene), [cutelySittingGltf.scene]);

  const { actions: fallingActions, mixer: fallingMixer } = useAnimations(
    fallingGltf.animations,
    fallingScene,
  );
  const { actions: pointingActions } = useAnimations(pointingGltf.animations, pointingScene);
  const { actions: runningActions } = useAnimations(runningGltf.animations, runningScene);
  const { actions: climbingActions } = useAnimations(climbingGltf.animations, climbingScene);
  const { actions: standingToSittingActions } = useAnimations(standingToSittingGltf.animations, standingToSittingScene);
  const { actions: cutelySittingActions } = useAnimations(cutelySittingGltf.animations, cutelySittingScene);

  const fallingActionRef = useRef<THREE.AnimationAction | null>(null);
  const pointingActionRef = useRef<THREE.AnimationAction | null>(null);
  const runningActionRef = useRef<THREE.AnimationAction | null>(null);
  const phase = useRef<HeroPhase>('falling');
  const fallingDoneRef = useRef(false);
  const switchedRef = useRef(false);
  const runningSwapStartedRef = useRef(false);
  const runningTweenRef = useRef<gsap.core.Tween | null>(null);
  const fallClipDurationRef = useRef(0);
  const fallOpacityRef = useRef(1);
  const pointOpacityRef = useRef(0);
  const runOpacityRef = useRef(0);

  const fallingRef = useRef<THREE.Group>(null);
  const pointingRef = useRef<THREE.Group>(null);
  const runningRef = useRef<THREE.Group>(null);
  const climbingRef = useRef<THREE.Group>(null);
  const standingToSittingRef = useRef<THREE.Group>(null);
  const cutelySittingRef = useRef<THREE.Group>(null);

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

    phase.current = 'running';
    runningSwapStartedRef.current = true;
    console.debug('[RobotHero] phase -> running (threshold reached)');

    fallingActionRef.current?.fadeOut(0.15);
    pointingActionRef.current?.fadeOut(0.2);
    if (fallingRef.current) {
      gsap.killTweensOf(fallingRef.current.position);
      fallingRef.current.visible = false;
    }
    setMeshOpacity(fallingScene, 0);
    pointOpacityRef.current = 1;
    runOpacityRef.current = 0;
    setMeshOpacity(pointingScene, 1);

    if (pointingRef.current) {
      gsap.to({}, {
        duration: 0.2,
        onComplete: () => {
          if (pointingRef.current) {
            pointingRef.current.visible = false;
          }
        },
      });
    }

    if (runningRef.current) {
      runningRef.current.visible = true;
      runningRef.current.position.set(
        runningTransform.position[0],
        runningTransform.position[1],
        runningTransform.position[2],
      );
      runningRef.current.scale.setScalar(runningTransform.scale);

      runningTweenRef.current?.kill();
      runningTweenRef.current = gsap.to(runningRef.current.position, {
        z: RUNNING_TARGET_Z,
        duration: 3,
        ease: 'none',
      });
    }

    setMeshOpacity(runningScene, 0);
    runningActionRef.current?.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.2).play();
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

    climbingScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });

    standingToSittingScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });

    cutelySittingScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [
    fallingScene,
    pointingScene,
    runningScene,
    climbingScene,
    standingToSittingScene,
    cutelySittingScene,
  ]);

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
    const names = Object.keys(climbingActions);
    console.log('Climbing clips:', names);
    const action = climbingActions[names[0]];
    if (!action) return;
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;
    action.reset().fadeIn(0.2).play();

    return () => {
      action.fadeOut(0.2);
    };
  }, [climbingActions]);

  useEffect(() => {
    const names = Object.keys(standingToSittingActions);
    console.log('StandingToSitting clips:', names);
    const action = standingToSittingActions[names[0]];
    if (!action) return;
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;
    action.reset().fadeIn(0.2).play();

    return () => {
      action.fadeOut(0.2);
    };
  }, [standingToSittingActions]);

  useEffect(() => {
    const names = Object.keys(cutelySittingActions);
    console.log('CutelySitting clips:', names);
    const action = cutelySittingActions[names[0]];
    if (!action) return;
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;
    action.reset().fadeIn(0.2).play();

    return () => {
      action.fadeOut(0.2);
    };
  }, [cutelySittingActions]);

  useEffect(() => {
    phase.current = 'falling';
    fallingDoneRef.current = false;
    switchedRef.current = false;
    runningSwapStartedRef.current = false;
    runningTweenRef.current?.kill();
    runningTweenRef.current = null;
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
        RUNNING_START_POSITION[0],
        RUNNING_START_POSITION[1],
        RUNNING_START_POSITION[2],
      );
      runningRef.current.scale.setScalar(RUNNING_SCALE);
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
      runningTweenRef.current?.kill();
      runningTweenRef.current = null;
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
      if (phase.current !== 'running') {
        runningRef.current.position.x = RUNNING_START_POSITION[0];
        runningRef.current.position.y = RUNNING_START_POSITION[1];
        runningRef.current.position.z = RUNNING_START_POSITION[2];
        runningRef.current.scale.setScalar(RUNNING_SCALE);
      }
    }

    if (climbingRef.current) {
      climbingRef.current.position.set(
        climbingTransform.position[0],
        climbingTransform.position[1],
        climbingTransform.position[2],
      );
      climbingRef.current.scale.setScalar(climbingTransform.scale);
    }

    if (standingToSittingRef.current) {
      standingToSittingRef.current.position.set(
        standingToSittingTransform.position[0],
        standingToSittingTransform.position[1],
        standingToSittingTransform.position[2],
      );
      standingToSittingRef.current.scale.setScalar(standingToSittingTransform.scale);
    }

    if (cutelySittingRef.current) {
      cutelySittingRef.current.position.set(
        cutelySittingTransform.position[0],
        cutelySittingTransform.position[1],
        cutelySittingTransform.position[2],
      );
      cutelySittingRef.current.scale.setScalar(cutelySittingTransform.scale);
    }

    if (!switchedRef.current && phase.current === 'landed' && fallingActionRef.current) {
      const remaining = fallClipDurationRef.current - fallingActionRef.current.time;
      if (remaining <= 2) {
        startPointingTransition();
      }
    }

    if (switchedRef.current && phase.current !== 'running') {
      fallOpacityRef.current = Math.max(0, fallOpacityRef.current - delta / 0.15);
      pointOpacityRef.current = Math.min(1, pointOpacityRef.current + delta / 0.15);

      setMeshOpacity(fallingScene, fallOpacityRef.current);
      setMeshOpacity(pointingScene, pointOpacityRef.current);

      if (fallOpacityRef.current <= 0.001 && fallingRef.current) {
        fallingRef.current.visible = false;
      }
    }

    if (phase.current === 'running') {
      pointOpacityRef.current = Math.max(0, pointOpacityRef.current - delta / 0.2);
      runOpacityRef.current = Math.min(1, runOpacityRef.current + delta / 0.2);

      setMeshOpacity(pointingScene, pointOpacityRef.current);
      setMeshOpacity(runningScene, runOpacityRef.current);

      if (pointOpacityRef.current <= 0.001 && pointingRef.current) {
        pointingRef.current.visible = false;
      }
    }

    if (!runningSwapStartedRef.current && scroll.offset >= RUNNING_SCROLL_THRESHOLD && phase.current === 'pointing') {
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
        position={[runningTransform.position[0], runningTransform.position[1], runningTransform.position[2]]}
        scale={[runningTransform.scale, runningTransform.scale, runningTransform.scale]}
      >
        <primitive object={runningScene} />
      </group>

      <group
        ref={climbingRef}
        position={[climbingTransform.position[0], climbingTransform.position[1], climbingTransform.position[2]]}
        scale={[climbingTransform.scale, climbingTransform.scale, climbingTransform.scale]}
      >
        <primitive object={climbingScene} />
      </group>

      <group
        ref={standingToSittingRef}
        position={[
          standingToSittingTransform.position[0],
          standingToSittingTransform.position[1],
          standingToSittingTransform.position[2],
        ]}
        scale={[
          standingToSittingTransform.scale,
          standingToSittingTransform.scale,
          standingToSittingTransform.scale,
        ]}
      >
        <primitive object={standingToSittingScene} />
      </group>

      <group
        ref={cutelySittingRef}
        position={[
          cutelySittingTransform.position[0],
          cutelySittingTransform.position[1],
          cutelySittingTransform.position[2],
        ]}
        scale={[cutelySittingTransform.scale, cutelySittingTransform.scale, cutelySittingTransform.scale]}
      >
        <primitive object={cutelySittingScene} />
      </group>
    </>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(FALLING_MODEL_PATH);
useGLTF.preload(POINTING_MODEL_PATH);
useGLTF.preload(RUNNING_MODEL_PATH);
useGLTF.preload(CLIMBING_MODEL_PATH);
useGLTF.preload(STANDING_TO_SITTING_MODEL_PATH);
useGLTF.preload(CUTELY_SITTING_MODEL_PATH);
