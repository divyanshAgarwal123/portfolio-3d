'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { useSceneStore } from '../../store/useSceneStore';

const DRACO_DECODER_PATH = '/draco-gltf/';
const FALLING_MODEL_PATH = '/models/robot_cute_falling.glb';
const POINTING_MODEL_PATH = '/models/robot_cute_pointing_back.glb';
const RUNNING_MODEL_PATH = '/models/robot_animation/robot_walking_while_texting copy.glb';
const CLIMBING_TO_LAPTOP_MODEL_PATH = '/models/robot_animation/robot_climbing_to_laptop.glb';
const CUTELY_SITTING_MODEL_PATH = '/models/robot_animation/robot_cutely_sitting.glb';
const STANDING_TO_SITTING_MODEL_PATH = '/models/robot_animation/robot_standing_to_sitting.glb';
const FALL_START_Y = 0.30;
const LAND_Y = -0.36;
const ROBOT_X = 0;
const ROBOT_Z = 0.49;
const ROBOT_SCALE = 0.03;
const RUNNING_SCROLL_THRESHOLD = 0.04;
const RUNNING_START_POSITION: [number, number, number] = [0.004, -0.36, 0.56];
const RUNNING_SCALE = 0.03;
const RUNNING_TARGET_Z = 1.1;
const CLIMBING_SCROLL_THRESHOLD = 0.60;

type HeroPhase = 'falling' | 'landed' | 'pointing' | 'runningTransition' | 'running' | 'climbing' | 'exited';

type RobotTransform = {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
};

type RobotHeroProps = {
  fallingTransform?: RobotTransform;
  pointingTransform?: RobotTransform;
  runningTransform?: RobotTransform;
  climbingToLaptopTransform?: RobotTransform;
  cutelySittingTransform?: RobotTransform;
  standingToSittingTransform?: RobotTransform;
  manualClimbingSequence?: boolean;
  climbingSequenceStep?: number;
  climbingStartReady?: boolean;
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
  fallingTransform = { position: [ROBOT_X, FALL_START_Y, ROBOT_Z], scale: ROBOT_SCALE, rotation: [0, 0, 0] },
  pointingTransform = { position: [ROBOT_X, LAND_Y, ROBOT_Z], scale: ROBOT_SCALE, rotation: [0, 0, 0] },
  runningTransform = { position: RUNNING_START_POSITION, scale: RUNNING_SCALE, rotation: [0, 0, 0] },
  climbingToLaptopTransform = { position: [0.46, 0.26, -0.73], scale: 0.087, rotation: [0, 0, 0] },
  cutelySittingTransform = { position: [0.46, 0.33, -0.69], scale: 0.087, rotation: [0, 0, 0] },
  standingToSittingTransform = { position: [0.46, 0.35, -0.68], scale: 0.087, rotation: [0, 0, 0] },
  manualClimbingSequence = false,
  climbingSequenceStep = 0,
  climbingStartReady = true,
}: RobotHeroProps) {
  const scrollOffsetRef = useRef(0);
  const setScenePhase = useSceneStore((state) => state.setPhase);

  const fallingGltf = useGLTF(FALLING_MODEL_PATH, DRACO_DECODER_PATH);
  const pointingGltf = useGLTF(POINTING_MODEL_PATH, DRACO_DECODER_PATH);
  const runningGltf = useGLTF(RUNNING_MODEL_PATH, DRACO_DECODER_PATH);
  const climbingToLaptopGltf = useGLTF(CLIMBING_TO_LAPTOP_MODEL_PATH, DRACO_DECODER_PATH);
  const cutelySittingGltf = useGLTF(CUTELY_SITTING_MODEL_PATH, DRACO_DECODER_PATH);
  const standingToSittingGltf = useGLTF(STANDING_TO_SITTING_MODEL_PATH, DRACO_DECODER_PATH);

  const fallingScene = useMemo(() => clone(fallingGltf.scene), [fallingGltf.scene]);
  const pointingScene = useMemo(() => clone(pointingGltf.scene), [pointingGltf.scene]);
  const runningScene = useMemo(() => clone(runningGltf.scene), [runningGltf.scene]);
  const climbingToLaptopScene = useMemo(() => clone(climbingToLaptopGltf.scene), [climbingToLaptopGltf.scene]);
  const cutelySittingScene = useMemo(() => clone(cutelySittingGltf.scene), [cutelySittingGltf.scene]);
  const standingToSittingScene = useMemo(() => clone(standingToSittingGltf.scene), [standingToSittingGltf.scene]);

  const { actions: fallingActions, mixer: fallingMixer } = useAnimations(
    fallingGltf.animations,
    fallingScene,
  );
  const { actions: pointingActions } = useAnimations(pointingGltf.animations, pointingScene);
  const { actions: runningActions } = useAnimations(runningGltf.animations, runningScene);
  const { actions: climbingToLaptopActions, mixer: climbingToLaptopMixer } = useAnimations(
    climbingToLaptopGltf.animations,
    climbingToLaptopScene,
  );
  const { actions: cutelySittingActions, mixer: cutelySittingMixer } = useAnimations(
    cutelySittingGltf.animations,
    cutelySittingScene,
  );
  const { actions: standingToSittingActions, mixer: standingToSittingMixer } = useAnimations(
    standingToSittingGltf.animations,
    standingToSittingScene,
  );

  const fallingActionRef = useRef<THREE.AnimationAction | null>(null);
  const pointingActionRef = useRef<THREE.AnimationAction | null>(null);
  const runningActionRef = useRef<THREE.AnimationAction | null>(null);
  const climbingToLaptopActionRef = useRef<THREE.AnimationAction | null>(null);
  const cutelySittingActionRef = useRef<THREE.AnimationAction | null>(null);
  const standingToSittingActionRef = useRef<THREE.AnimationAction | null>(null);
  const phase = useRef<HeroPhase>('falling');
  const fallingDoneRef = useRef(false);
  const switchedRef = useRef(false);
  const runningSwapStartedRef = useRef(false);
  const climbingPhaseStartedRef = useRef(false);
  const manualClimbingStageRef = useRef<-1 | 0 | 1 | 2>(-1);
  const runningTweenRef = useRef<gsap.core.Tween | null>(null);
  const runningExitTweenRef = useRef<gsap.core.Tween | null>(null);
  const pointingToRunningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sceneBlendTweenRef = useRef<gsap.core.Tween | null>(null);
  const climbingSequenceCleanupRef = useRef<(() => void) | null>(null);
  const fallClipDurationRef = useRef(0);
  const fallOpacityRef = useRef(1);
  const pointOpacityRef = useRef(0);
  const runOpacityRef = useRef(0);
  const hasExitedRef = useRef(false);

  const fallingRef = useRef<THREE.Group>(null);
  const pointingRef = useRef<THREE.Group>(null);
  const runningRef = useRef<THREE.Group>(null);
  const climbingToLaptopRef = useRef<THREE.Group>(null);
  const cutelySittingRef = useRef<THREE.Group>(null);
  const standingToSittingRef = useRef<THREE.Group>(null);

  const stopSceneBlendTween = () => {
    sceneBlendTweenRef.current?.kill();
    sceneBlendTweenRef.current = null;
  };

  const crossfadeScenes = (
    fromRef: RefObject<THREE.Group>,
    fromScene: THREE.Object3D,
    toRef: RefObject<THREE.Group>,
    toScene: THREE.Object3D,
    duration = 0.35,
  ) => {
    stopSceneBlendTween();

    if (toRef.current) {
      toRef.current.visible = true;
    }
    setMeshOpacity(toScene, 0);
    setMeshOpacity(fromScene, 1);

    const blendState = { from: 1, to: 0 };
    sceneBlendTweenRef.current = gsap.to(blendState, {
      from: 0,
      to: 1,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        setMeshOpacity(fromScene, blendState.from);
        setMeshOpacity(toScene, blendState.to);
      },
      onComplete: () => {
        if (fromRef.current) {
          fromRef.current.visible = false;
        }
        setMeshOpacity(fromScene, 0);
        setMeshOpacity(toScene, 1);
        sceneBlendTweenRef.current = null;
      },
    });
  };

  const playManualClimbingStage = (stage: 0 | 1 | 2) => {
    const climbAction = climbingToLaptopActionRef.current;
    const standAction = standingToSittingActionRef.current;
    const sitAction = cutelySittingActionRef.current;
    if (!climbAction || !standAction || !sitAction) return;

    climbAction.fadeOut(0.15);
    standAction.fadeOut(0.15);
    sitAction.fadeOut(0.15);

    if (stage === 0) {
      if (climbingToLaptopRef.current) climbingToLaptopRef.current.visible = true;
      if (standingToSittingRef.current) standingToSittingRef.current.visible = false;
      if (cutelySittingRef.current) cutelySittingRef.current.visible = false;

      setMeshOpacity(climbingToLaptopScene, 1);
      setMeshOpacity(standingToSittingScene, 0);
      setMeshOpacity(cutelySittingScene, 0);

      climbAction.enabled = true;
      climbAction.setLoop(THREE.LoopRepeat, Infinity);
      climbAction.clampWhenFinished = true;
      climbAction.reset().fadeIn(0.15).play();
      return;
    }

    if (stage === 1) {
      if (climbingToLaptopRef.current) climbingToLaptopRef.current.visible = false;
      if (standingToSittingRef.current) standingToSittingRef.current.visible = true;
      if (cutelySittingRef.current) cutelySittingRef.current.visible = false;

      setMeshOpacity(climbingToLaptopScene, 0);
      setMeshOpacity(standingToSittingScene, 1);
      setMeshOpacity(cutelySittingScene, 0);

      standAction.enabled = true;
      standAction.setLoop(THREE.LoopRepeat, Infinity);
      standAction.clampWhenFinished = true;
      standAction.reset().fadeIn(0.15).play();
      return;
    }

    if (climbingToLaptopRef.current) climbingToLaptopRef.current.visible = false;
    if (standingToSittingRef.current) standingToSittingRef.current.visible = false;
    if (cutelySittingRef.current) cutelySittingRef.current.visible = true;

    setMeshOpacity(climbingToLaptopScene, 0);
    setMeshOpacity(standingToSittingScene, 0);
    setMeshOpacity(cutelySittingScene, 1);

    sitAction.enabled = true;
    sitAction.setLoop(THREE.LoopRepeat, Infinity);
    sitAction.clampWhenFinished = true;
    sitAction.reset().fadeIn(0.15).play();
  };

  const transitionToStandingPhase = () => {
    const climbAction = climbingToLaptopActionRef.current;
    const standAction = standingToSittingActionRef.current;
    if (!climbAction || !standAction) return;

    standAction.enabled = true;
    standAction.setLoop(manualClimbingSequence ? THREE.LoopRepeat : THREE.LoopOnce, manualClimbingSequence ? Infinity : 1);
    standAction.clampWhenFinished = true;
    standAction.reset().fadeIn(0.35).play();
    climbAction.fadeOut(0.35);

    crossfadeScenes(
      climbingToLaptopRef,
      climbingToLaptopScene,
      standingToSittingRef,
      standingToSittingScene,
      0.35,
    );
  };

  const transitionToSittingPhase = () => {
    const standAction = standingToSittingActionRef.current;
    const sitAction = cutelySittingActionRef.current;
    if (!standAction || !sitAction) return;

    sitAction.enabled = true;
    sitAction.setLoop(THREE.LoopRepeat, Infinity);
    sitAction.clampWhenFinished = true;
    sitAction.reset().fadeIn(0.35).play();
    standAction.fadeOut(0.35);

    crossfadeScenes(
      standingToSittingRef,
      standingToSittingScene,
      cutelySittingRef,
      cutelySittingScene,
      0.35,
    );
  };

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

    const pointingDuration = pointingActionRef.current?.getClip().duration ?? 2.2;
    if (pointingToRunningTimeoutRef.current) {
      clearTimeout(pointingToRunningTimeoutRef.current);
    }
    pointingToRunningTimeoutRef.current = setTimeout(() => {
      startRunningTransition();
    }, pointingDuration * 1000);
  };

  const startRunningTransition = () => {
    if (runningSwapStartedRef.current) return;
    if (phase.current !== 'pointing') return;

    phase.current = 'running';
    setScenePhase('walking');
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

  const startClimbingSequence = () => {
    if (climbingPhaseStartedRef.current) return;
    if (phase.current !== 'running') return;

    const climbAction = climbingToLaptopActionRef.current;
    const standAction = standingToSittingActionRef.current;
    const sitAction = cutelySittingActionRef.current;
    if (!climbAction || !standAction || !sitAction) return;

    phase.current = 'climbing';
    climbingPhaseStartedRef.current = true;
    console.debug('[RobotHero] phase -> climbing (threshold reached)');

    runningTweenRef.current?.kill();
    runningTweenRef.current = null;
    runningActionRef.current?.fadeOut(0.2);

    if (runningRef.current) {
      runningRef.current.visible = false;
    }
    setMeshOpacity(runningScene, 0);
    runOpacityRef.current = 0;

    if (climbingToLaptopRef.current) {
      climbingToLaptopRef.current.visible = true;
    }
    if (standingToSittingRef.current) {
      standingToSittingRef.current.visible = false;
    }
    if (cutelySittingRef.current) {
      cutelySittingRef.current.visible = false;
    }

    setMeshOpacity(climbingToLaptopScene, 1);
    setMeshOpacity(standingToSittingScene, 0);
    setMeshOpacity(cutelySittingScene, 0);

    climbAction.enabled = true;
    climbAction.setLoop(manualClimbingSequence ? THREE.LoopRepeat : THREE.LoopOnce, manualClimbingSequence ? Infinity : 1);
    climbAction.clampWhenFinished = true;
    climbAction.reset().fadeIn(0.2).play();

    if (manualClimbingSequence) {
      manualClimbingStageRef.current = 0;
      playManualClimbingStage(0);
      return;
    }

    manualClimbingStageRef.current = -1;

    const onClimbFinished = (event: THREE.Event & { action?: THREE.AnimationAction }) => {
      if (event.action !== climbAction) return;

      transitionToStandingPhase();
    };

    const onStandFinished = (event: THREE.Event & { action?: THREE.AnimationAction }) => {
      if (event.action !== standAction) return;

      transitionToSittingPhase();
    };

    climbingToLaptopMixer.addEventListener('finished', onClimbFinished);
    standingToSittingMixer.addEventListener('finished', onStandFinished);

    climbingSequenceCleanupRef.current = () => {
      climbingToLaptopMixer.removeEventListener('finished', onClimbFinished);
      standingToSittingMixer.removeEventListener('finished', onStandFinished);
    };
  };

  useEffect(() => {
    if (!manualClimbingSequence) return;
    if (phase.current !== 'climbing') return;

    const targetStage = Math.max(0, Math.min(climbingSequenceStep, 2)) as 0 | 1 | 2;
    if (manualClimbingStageRef.current === targetStage) return;

    playManualClimbingStage(targetStage);
    manualClimbingStageRef.current = targetStage;
  }, [manualClimbingSequence, climbingSequenceStep]);

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

    climbingToLaptopScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });

    cutelySittingScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });

    standingToSittingScene.traverse((object) => {
      if ((object as { isMesh?: boolean }).isMesh) {
        object.frustumCulled = false;
      }
    });
  }, [
    fallingScene,
    pointingScene,
    runningScene,
    climbingToLaptopScene,
    cutelySittingScene,
    standingToSittingScene,
  ]);

  useEffect(() => {
    const names = Object.keys(fallingActions);
    console.log('Falling clips:', names);

    const action = fallingActions[names[0]];
    if (!action) return;

    setScenePhase('falling');

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
    const names = Object.keys(climbingToLaptopActions);
    console.log('ClimbingToLaptop clips:', names);

    const action = climbingToLaptopActions[names[0]];
    if (!action) return;

    climbingToLaptopActionRef.current = action;
    action.enabled = true;
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;

    return () => {
      action.fadeOut(0.2);
    };
  }, [climbingToLaptopActions]);

  useEffect(() => {
    const names = Object.keys(cutelySittingActions);
    console.log('CutelySitting clips:', names);

    const action = cutelySittingActions[names[0]];
    if (!action) return;

    cutelySittingActionRef.current = action;
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = true;

    return () => {
      action.fadeOut(0.2);
    };
  }, [cutelySittingActions]);

  useEffect(() => {
    const names = Object.keys(standingToSittingActions);
    console.log('StandingToSitting clips:', names);

    const action = standingToSittingActions[names[0]];
    if (!action) return;

    standingToSittingActionRef.current = action;
    action.enabled = true;
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;

    return () => {
      action.fadeOut(0.2);
    };
  }, [standingToSittingActions]);

  useEffect(() => {
    phase.current = 'falling';
    fallingDoneRef.current = false;
    switchedRef.current = false;
    runningSwapStartedRef.current = false;
    climbingPhaseStartedRef.current = false;
    manualClimbingStageRef.current = -1;
    runningTweenRef.current?.kill();
    runningExitTweenRef.current?.kill();
    runningExitTweenRef.current = null;
    hasExitedRef.current = false;
    if (pointingToRunningTimeoutRef.current) {
      clearTimeout(pointingToRunningTimeoutRef.current);
      pointingToRunningTimeoutRef.current = null;
    }
    climbingSequenceCleanupRef.current?.();
    stopSceneBlendTween();
    climbingSequenceCleanupRef.current = null;
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
      fallingRef.current.rotation.set(
        fallingTransform.rotation[0],
        fallingTransform.rotation[1],
        fallingTransform.rotation[2],
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
      runningRef.current.rotation.set(
        runningTransform.rotation[0],
        runningTransform.rotation[1],
        runningTransform.rotation[2],
      );
      runningRef.current.scale.setScalar(RUNNING_SCALE);
    }

    if (climbingToLaptopRef.current) {
      climbingToLaptopRef.current.visible = false;
      climbingToLaptopRef.current.position.set(
        climbingToLaptopTransform.position[0],
        climbingToLaptopTransform.position[1],
        climbingToLaptopTransform.position[2],
      );
      climbingToLaptopRef.current.rotation.set(
        climbingToLaptopTransform.rotation[0],
        climbingToLaptopTransform.rotation[1],
        climbingToLaptopTransform.rotation[2],
      );
      climbingToLaptopRef.current.scale.setScalar(climbingToLaptopTransform.scale);
    }

    if (cutelySittingRef.current) {
      cutelySittingRef.current.visible = false;
      cutelySittingRef.current.position.set(
        cutelySittingTransform.position[0],
        cutelySittingTransform.position[1],
        cutelySittingTransform.position[2],
      );
      cutelySittingRef.current.rotation.set(
        cutelySittingTransform.rotation[0],
        cutelySittingTransform.rotation[1],
        cutelySittingTransform.rotation[2],
      );
      cutelySittingRef.current.scale.setScalar(cutelySittingTransform.scale);
    }

    if (standingToSittingRef.current) {
      standingToSittingRef.current.visible = false;
      standingToSittingRef.current.position.set(
        standingToSittingTransform.position[0],
        standingToSittingTransform.position[1],
        standingToSittingTransform.position[2],
      );
      standingToSittingRef.current.rotation.set(
        standingToSittingTransform.rotation[0],
        standingToSittingTransform.rotation[1],
        standingToSittingTransform.rotation[2],
      );
      standingToSittingRef.current.scale.setScalar(standingToSittingTransform.scale);
    }

    if (fallingRef.current) {
      fallingRef.current.visible = true;
    }

    setMeshOpacity(fallingScene, 1);
    setMeshOpacity(pointingScene, 0);
    setMeshOpacity(runningScene, 0);
    setMeshOpacity(climbingToLaptopScene, 0);
    setMeshOpacity(cutelySittingScene, 0);
    setMeshOpacity(standingToSittingScene, 0);
  }, [
    fallingScene,
    pointingScene,
    runningScene,
    climbingToLaptopScene,
    cutelySittingScene,
    standingToSittingScene,
  ]);

  useEffect(() => {
    return () => {
      runningTweenRef.current?.kill();
      runningExitTweenRef.current?.kill();
      runningExitTweenRef.current = null;
      if (pointingToRunningTimeoutRef.current) {
        clearTimeout(pointingToRunningTimeoutRef.current);
        pointingToRunningTimeoutRef.current = null;
      }
      climbingSequenceCleanupRef.current?.();
      stopSceneBlendTween();
      climbingSequenceCleanupRef.current = null;
      runningTweenRef.current = null;
    };
  }, []);

  useFrame((_, delta) => {
    if (fallingRef.current) {
      fallingRef.current.position.x = fallingTransform.position[0];
      fallingRef.current.position.z = fallingTransform.position[2];
      fallingRef.current.rotation.set(
        fallingTransform.rotation[0],
        fallingTransform.rotation[1],
        fallingTransform.rotation[2],
      );
      fallingRef.current.scale.setScalar(fallingTransform.scale);
    }

    if (pointingRef.current) {
      pointingRef.current.position.set(
        pointingTransform.position[0],
        pointingTransform.position[1],
        pointingTransform.position[2],
      );
      pointingRef.current.rotation.set(
        pointingTransform.rotation[0],
        pointingTransform.rotation[1],
        pointingTransform.rotation[2],
      );
      pointingRef.current.scale.setScalar(pointingTransform.scale);
    }

    if (runningRef.current) {
      runningRef.current.rotation.set(
        runningTransform.rotation[0],
        runningTransform.rotation[1],
        runningTransform.rotation[2],
      );
      if (phase.current !== 'running') {
        runningRef.current.position.x = RUNNING_START_POSITION[0];
        runningRef.current.position.y = RUNNING_START_POSITION[1];
        runningRef.current.position.z = RUNNING_START_POSITION[2];
        runningRef.current.scale.setScalar(RUNNING_SCALE);
      }
    }

    if (climbingToLaptopRef.current) {
      climbingToLaptopRef.current.position.set(
        climbingToLaptopTransform.position[0],
        climbingToLaptopTransform.position[1],
        climbingToLaptopTransform.position[2],
      );
      climbingToLaptopRef.current.rotation.set(
        climbingToLaptopTransform.rotation[0],
        climbingToLaptopTransform.rotation[1],
        climbingToLaptopTransform.rotation[2],
      );
      climbingToLaptopRef.current.scale.setScalar(climbingToLaptopTransform.scale);
    }

    if (cutelySittingRef.current) {
      cutelySittingRef.current.position.set(
        cutelySittingTransform.position[0],
        cutelySittingTransform.position[1],
        cutelySittingTransform.position[2],
      );
      cutelySittingRef.current.rotation.set(
        cutelySittingTransform.rotation[0],
        cutelySittingTransform.rotation[1],
        cutelySittingTransform.rotation[2],
      );
      cutelySittingRef.current.scale.setScalar(cutelySittingTransform.scale);
    }

    if (standingToSittingRef.current) {
      standingToSittingRef.current.position.set(
        standingToSittingTransform.position[0],
        standingToSittingTransform.position[1],
        standingToSittingTransform.position[2],
      );
      standingToSittingRef.current.rotation.set(
        standingToSittingTransform.rotation[0],
        standingToSittingTransform.rotation[1],
        standingToSittingTransform.rotation[2],
      );
      standingToSittingRef.current.scale.setScalar(standingToSittingTransform.scale);
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

    if (
      !hasExitedRef.current
      && phase.current === 'running'
      && runningRef.current
      && runningRef.current.position.z >= 1.1
    ) {
      hasExitedRef.current = true;
      phase.current = 'exited';
      setScenePhase('flashlight');

      runningActionRef.current?.fadeOut(0.2);
      runningTweenRef.current?.kill();

      runningExitTweenRef.current?.kill();
      runningExitTweenRef.current = gsap.delayedCall(0.2, () => {
        if (runningRef.current) {
          runningRef.current.visible = false;
        }
      });
    }

    // Compute native scroll offset (0-1 range over total scrollable distance)
    if (typeof window !== 'undefined') {
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      scrollOffsetRef.current = totalScrollable > 0 ? THREE.MathUtils.clamp(window.scrollY / totalScrollable, 0, 1) : 0;
    }

    if (
      !climbingPhaseStartedRef.current
      && scrollOffsetRef.current >= CLIMBING_SCROLL_THRESHOLD
      && phase.current === 'running'
      && climbingStartReady
    ) {
      startClimbingSequence();
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
        rotation={[pointingTransform.rotation[0], pointingTransform.rotation[1], pointingTransform.rotation[2]]}
        scale={[pointingTransform.scale, pointingTransform.scale, pointingTransform.scale]}
      >
        <primitive object={pointingScene} />
      </group>

      <group
        ref={runningRef}
        position={[runningTransform.position[0], runningTransform.position[1], runningTransform.position[2]]}
        rotation={[runningTransform.rotation[0], runningTransform.rotation[1], runningTransform.rotation[2]]}
        scale={[runningTransform.scale, runningTransform.scale, runningTransform.scale]}
      >
        <primitive object={runningScene} />
      </group>

      <group
        ref={climbingToLaptopRef}
        position={[
          climbingToLaptopTransform.position[0],
          climbingToLaptopTransform.position[1],
          climbingToLaptopTransform.position[2],
        ]}
        rotation={[
          climbingToLaptopTransform.rotation[0],
          climbingToLaptopTransform.rotation[1],
          climbingToLaptopTransform.rotation[2],
        ]}
        scale={[
          climbingToLaptopTransform.scale,
          climbingToLaptopTransform.scale,
          climbingToLaptopTransform.scale,
        ]}
      >
        <primitive object={climbingToLaptopScene} />
      </group>

      <group
        ref={cutelySittingRef}
        position={[cutelySittingTransform.position[0], cutelySittingTransform.position[1], cutelySittingTransform.position[2]]}
        rotation={[cutelySittingTransform.rotation[0], cutelySittingTransform.rotation[1], cutelySittingTransform.rotation[2]]}
        scale={[cutelySittingTransform.scale, cutelySittingTransform.scale, cutelySittingTransform.scale]}
      >
        <primitive object={cutelySittingScene} />
      </group>

      <group
        ref={standingToSittingRef}
        position={[
          standingToSittingTransform.position[0],
          standingToSittingTransform.position[1],
          standingToSittingTransform.position[2],
        ]}
        rotation={[
          standingToSittingTransform.rotation[0],
          standingToSittingTransform.rotation[1],
          standingToSittingTransform.rotation[2],
        ]}
        scale={[
          standingToSittingTransform.scale,
          standingToSittingTransform.scale,
          standingToSittingTransform.scale,
        ]}
      >
        <primitive object={standingToSittingScene} />
      </group>
    </>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(FALLING_MODEL_PATH);
useGLTF.preload(POINTING_MODEL_PATH);
useGLTF.preload(RUNNING_MODEL_PATH);
useGLTF.preload(CLIMBING_TO_LAPTOP_MODEL_PATH);
useGLTF.preload(CUTELY_SITTING_MODEL_PATH);
useGLTF.preload(STANDING_TO_SITTING_MODEL_PATH);
