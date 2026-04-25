'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const DRACO_DECODER_PATH = '/draco-gltf/';

const TALKING_GIRL_MODEL_PATH = '/models/robot_animation/talking_girl.glb';
const SURPRISED_MODEL_PATH = '/models/robot_animation/surprised.glb';
const BLUSHING_MODEL_PATH = '/models/robot_animation/blushing.glb';
const KISSY_MODEL_PATH = '/models/robot_animation/kissy.glb';
const GOOFY_RUNNING_MODEL_PATH = '/models/robot_animation/goofy_running.glb';

const SHARED_POSITION: [number, number, number] = [-0.67, -0.36, 0.14];
const SHARED_SCALE = 0.053;
const SHARED_ROTATION_X = 0;
const SHARED_ROTATION_Z = 0;
const SHARED_ROTATION_Y = 1.69;
const TALKING_ROTATION_Y = 1.11;
const GOOFY_ROTATION_Y = -1.69;
const GOOFY_START_X = -0.67;
const GOOFY_EXIT_X = -1.12;
const GOOFY_LOOPS_TO_EXIT = 4;

type Phase = 'idle' | 'talking' | 'surprised' | 'blushing' | 'kissy' | 'goofy' | 'done';
type ModelTransform = {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
};

export type GirlModelIndex = 0 | 1 | 2 | 3 | 4;
export type FemaleSyncCue = 'surprised' | 'blushing' | 'kissy' | null;

type BackgroundProposalSceneProps = {
  talkingGirlTransform?: ModelTransform;
  surprisedTransform?: ModelTransform;
  blushingTransform?: ModelTransform;
  kissyTransform?: ModelTransform;
  goofyRunningTransform?: ModelTransform;
  calibrationMode?: boolean;
  activeModelIndex?: GirlModelIndex;
  syncCue?: FemaleSyncCue;
};

function createInPlaceRunningClip(clip: THREE.AnimationClip) {
  const cloned = clip.clone();
  const rootPositionTrackPattern = /(mixamorigHips|Hips|Root|Armature)\.position$/i;
  cloned.tracks = cloned.tracks.filter((track) => !rootPositionTrackPattern.test(track.name));
  return cloned;
}

function setFrustumCulledFalse(root: THREE.Object3D) {
  root.traverse((obj) => {
    if ((obj as { isMesh?: boolean }).isMesh) {
      obj.frustumCulled = false;
    }
  });
}

function pickFirstAction(
  actions: Record<string, THREE.AnimationAction | null | undefined>,
  animations: THREE.AnimationClip[],
) {
  const clipName = animations[0]?.name ?? Object.keys(actions)[0];
  if (!clipName) return null;
  const action = actions[clipName];
  if (!action) return null;
  return { action, clipName };
}

export default function BackgroundProposalScene({
  talkingGirlTransform = {
    position: SHARED_POSITION,
    scale: SHARED_SCALE,
    rotation: [SHARED_ROTATION_X, TALKING_ROTATION_Y, SHARED_ROTATION_Z],
  },
  surprisedTransform = {
    position: SHARED_POSITION,
    scale: SHARED_SCALE,
    rotation: [SHARED_ROTATION_X, SHARED_ROTATION_Y, SHARED_ROTATION_Z],
  },
  blushingTransform = {
    position: SHARED_POSITION,
    scale: SHARED_SCALE,
    rotation: [SHARED_ROTATION_X, SHARED_ROTATION_Y, SHARED_ROTATION_Z],
  },
  kissyTransform = {
    position: SHARED_POSITION,
    scale: SHARED_SCALE,
    rotation: [SHARED_ROTATION_X, SHARED_ROTATION_Y, SHARED_ROTATION_Z],
  },
  goofyRunningTransform = {
    position: SHARED_POSITION,
    scale: SHARED_SCALE,
    rotation: [SHARED_ROTATION_X, GOOFY_ROTATION_Y, SHARED_ROTATION_Z],
  },
  calibrationMode = false,
  activeModelIndex = 0,
  syncCue = null,
}: BackgroundProposalSceneProps) {
  const talkingGltf = useGLTF(TALKING_GIRL_MODEL_PATH, DRACO_DECODER_PATH);
  const surprisedGltf = useGLTF(SURPRISED_MODEL_PATH, DRACO_DECODER_PATH);
  const blushingGltf = useGLTF(BLUSHING_MODEL_PATH, DRACO_DECODER_PATH);
  const kissyGltf = useGLTF(KISSY_MODEL_PATH, DRACO_DECODER_PATH);
  const goofyGltf = useGLTF(GOOFY_RUNNING_MODEL_PATH, DRACO_DECODER_PATH);

  const talkingScene = useMemo(() => clone(talkingGltf.scene), [talkingGltf.scene]);
  const surprisedScene = useMemo(() => clone(surprisedGltf.scene), [surprisedGltf.scene]);
  const blushingScene = useMemo(() => clone(blushingGltf.scene), [blushingGltf.scene]);
  const kissyScene = useMemo(() => clone(kissyGltf.scene), [kissyGltf.scene]);
  const goofyScene = useMemo(() => clone(goofyGltf.scene), [goofyGltf.scene]);

  const { actions: talkingActions, mixer: talkingMixer } = useAnimations(
    talkingGltf.animations,
    talkingScene,
  );
  const { actions: surprisedActions, mixer: surprisedMixer } = useAnimations(
    surprisedGltf.animations,
    surprisedScene,
  );
  const { actions: blushingActions, mixer: blushingMixer } = useAnimations(
    blushingGltf.animations,
    blushingScene,
  );
  const { actions: kissyActions, mixer: kissyMixer } = useAnimations(kissyGltf.animations, kissyScene);
  const { actions: goofyActions, mixer: goofyMixer } = useAnimations(goofyGltf.animations, goofyScene);

  const phaseRef = useRef<Phase>('idle');
  const startDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const goofyHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const goofyMoveTweenRef = useRef<gsap.core.Tween | null>(null);

  const talkingRef = useRef<THREE.Group>(null);
  const surprisedRef = useRef<THREE.Group>(null);
  const blushingRef = useRef<THREE.Group>(null);
  const kissyRef = useRef<THREE.Group>(null);
  const goofyRef = useRef<THREE.Group>(null);

  const talkingActionRef = useRef<THREE.AnimationAction | null>(null);
  const surprisedActionRef = useRef<THREE.AnimationAction | null>(null);
  const blushingActionRef = useRef<THREE.AnimationAction | null>(null);
  const kissyActionRef = useRef<THREE.AnimationAction | null>(null);
  const goofyActionRef = useRef<THREE.AnimationAction | null>(null);
  const goofyStartedRef = useRef(false);
  const lastAppliedSyncCueRef = useRef<FemaleSyncCue>(null);

  useEffect(() => {
    setFrustumCulledFalse(talkingScene);
    setFrustumCulledFalse(surprisedScene);
    setFrustumCulledFalse(blushingScene);
    setFrustumCulledFalse(kissyScene);
    setFrustumCulledFalse(goofyScene);
  }, [talkingScene, surprisedScene, blushingScene, kissyScene, goofyScene]);

  useEffect(() => {
    console.log('BackgroundProposalScene talking_girl clips:', talkingGltf.animations.map((clip) => clip.name));
    console.log('BackgroundProposalScene surprised clips:', surprisedGltf.animations.map((clip) => clip.name));
    console.log('BackgroundProposalScene blushing clips:', blushingGltf.animations.map((clip) => clip.name));
    console.log('BackgroundProposalScene kissy clips:', kissyGltf.animations.map((clip) => clip.name));
    console.log('BackgroundProposalScene goofy_running clips:', goofyGltf.animations.map((clip) => clip.name));
  }, [
    talkingGltf.animations,
    surprisedGltf.animations,
    blushingGltf.animations,
    kissyGltf.animations,
    goofyGltf.animations,
  ]);

  useEffect(() => {
    if (!syncCue || calibrationMode) return;
    if (syncCue === lastAppliedSyncCueRef.current) return;

    const surprisedAction = surprisedActionRef.current;
    const blushingAction = blushingActionRef.current;
    const kissyAction = kissyActionRef.current;
    if (!surprisedAction || !blushingAction || !kissyAction) return;

    const allRefs = [talkingRef, surprisedRef, blushingRef, kissyRef, goofyRef] as const;
    const allActions = [
      talkingActionRef.current,
      surprisedAction,
      blushingAction,
      kissyAction,
      goofyActionRef.current,
    ];

    const target =
      syncCue === 'surprised'
        ? { phase: 'surprised' as const, ref: surprisedRef, action: surprisedAction }
        : syncCue === 'blushing'
          ? { phase: 'blushing' as const, ref: blushingRef, action: blushingAction }
          : { phase: 'kissy' as const, ref: kissyRef, action: kissyAction };

    const currentAction =
      phaseRef.current === 'talking'
        ? talkingActionRef.current
        : phaseRef.current === 'surprised'
          ? surprisedActionRef.current
          : phaseRef.current === 'blushing'
            ? blushingActionRef.current
            : phaseRef.current === 'kissy'
              ? kissyActionRef.current
              : phaseRef.current === 'goofy'
                ? goofyActionRef.current
                : null;

    currentAction?.fadeOut(0.15);

    goofyMoveTweenRef.current?.kill();
    goofyMoveTweenRef.current = null;
    if (goofyHideTimeoutRef.current) {
      clearTimeout(goofyHideTimeoutRef.current);
      goofyHideTimeoutRef.current = null;
    }

    const timeout = setTimeout(() => {
      allRefs.forEach((ref) => {
        if (ref.current) {
          ref.current.visible = false;
        }
      });

      allActions.forEach((action) => {
        action?.stop();
      });

      if (target.ref.current) {
        target.ref.current.visible = true;
      }

      phaseRef.current = target.phase;
      target.action.enabled = true;
      target.action.setLoop(THREE.LoopOnce, 1);
      target.action.clampWhenFinished = true;
      target.action.reset().fadeIn(0.15).play();
    }, 150);

    transitionTimeoutsRef.current.push(timeout);
    lastAppliedSyncCueRef.current = syncCue;
  }, [syncCue, calibrationMode]);

  useEffect(() => {
    const talkingPick = pickFirstAction(talkingActions, talkingGltf.animations);
    const surprisedPick = pickFirstAction(surprisedActions, surprisedGltf.animations);
    const blushingPick = pickFirstAction(blushingActions, blushingGltf.animations);
    const kissyPick = pickFirstAction(kissyActions, kissyGltf.animations);
    const goofyPick = pickFirstAction(goofyActions, goofyGltf.animations);

    if (!talkingPick || !surprisedPick || !blushingPick || !kissyPick || !goofyPick) {
      return;
    }

    const talkingAction = talkingPick.action;
    const surprisedAction = surprisedPick.action;
    const blushingAction = blushingPick.action;
    const kissyAction = kissyPick.action;
    const goofyClip = goofyPick.action.getClip();
    const inPlaceGoofyClip = createInPlaceRunningClip(goofyClip);
    console.log(
      'BackgroundProposalScene goofy_running tracks (original -> inPlace):',
      goofyClip.tracks.length,
      '->',
      inPlaceGoofyClip.tracks.length,
    );
    const goofyAction = goofyMixer.clipAction(inPlaceGoofyClip, goofyScene);
    const goofyClipDuration = inPlaceGoofyClip.duration;
    console.log('BackgroundProposalScene goofy_running clipDuration:', goofyClipDuration);

    talkingActionRef.current = talkingAction;
    surprisedActionRef.current = surprisedAction;
    blushingActionRef.current = blushingAction;
    kissyActionRef.current = kissyAction;
    goofyActionRef.current = goofyAction;

    const modelRefs = [talkingRef, surprisedRef, blushingRef, kissyRef, goofyRef] as const;
    const modelActions = [talkingAction, surprisedAction, blushingAction, kissyAction, goofyAction] as const;

    if (calibrationMode) {
      phaseRef.current = 'idle';

      modelRefs.forEach((ref, index) => {
        const active = index === activeModelIndex;
        if (ref.current) {
          ref.current.visible = active;
          if (active && index === 4) {
            ref.current.position.x = GOOFY_START_X;
          }
        }
      });

      modelActions.forEach((action, index) => {
        action.enabled = true;
        action.clampWhenFinished = true;
        if (index === activeModelIndex) {
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.reset().fadeIn(0.15).play();
        } else {
          action.fadeOut(0.15);
          action.stop();
        }
      });

      goofyMoveTweenRef.current?.kill();
      goofyMoveTweenRef.current = null;

      if (activeModelIndex === 4 && goofyRef.current) {
        const movementDuration = goofyClipDuration * GOOFY_LOOPS_TO_EXIT;
        goofyRef.current.position.x = GOOFY_START_X;
        goofyMoveTweenRef.current = gsap.to(goofyRef.current.position, {
          x: GOOFY_EXIT_X,
          duration: movementDuration,
          ease: 'none',
          repeat: -1,
          onRepeat: () => {
            if (goofyRef.current) {
              goofyRef.current.position.x = GOOFY_START_X;
            }
          },
        });
      }

      return () => {
        goofyMoveTweenRef.current?.kill();
        goofyMoveTweenRef.current = null;
        modelActions.forEach((action) => {
          action.fadeOut(0.15);
          action.stop();
        });
      };
    }

    const playLoopOnce = (target: React.RefObject<THREE.Group>, action: THREE.AnimationAction) => {
      if (target.current) {
        target.current.visible = true;
      }
      action.enabled = true;
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.reset().fadeIn(0.15).play();
    };

    const transitionAfterFadeOut = (
      fromRef: React.RefObject<THREE.Group>,
      fromAction: THREE.AnimationAction,
      toRef: React.RefObject<THREE.Group>,
      toAction: THREE.AnimationAction,
      setNextPhase: () => void,
    ) => {
      fromAction.fadeOut(0.15);
      const timeout = setTimeout(() => {
        if (fromRef.current) {
          fromRef.current.visible = false;
        }
        if (toRef.current) {
          toRef.current.visible = true;
        }
        setNextPhase();
        toAction.enabled = true;
        toAction.setLoop(THREE.LoopOnce, 1);
        toAction.clampWhenFinished = true;
        toAction.reset().fadeIn(0.15).play();
      }, 150);
      transitionTimeoutsRef.current.push(timeout);
    };

    const playTalking = () => {
      phaseRef.current = 'talking';
      playLoopOnce(talkingRef, talkingAction);
    };

    const playSurprised = () => {
      phaseRef.current = 'surprised';
    };

    const playBlushing = () => {
      phaseRef.current = 'blushing';
    };

    const playKissy = () => {
      phaseRef.current = 'kissy';
    };

    const playGoofy = () => {
      if (goofyStartedRef.current) return;
      goofyStartedRef.current = true;
      phaseRef.current = 'goofy';
      if (goofyRef.current) {
        goofyRef.current.visible = true;
        goofyRef.current.position.x = GOOFY_START_X;
      }

      goofyAction.enabled = true;
      goofyAction.setLoop(THREE.LoopRepeat, Infinity);
      goofyAction.clampWhenFinished = true;
      goofyAction.reset().fadeIn(0.15).play();

      const clipDuration = goofyClipDuration;
      const movementDuration = clipDuration * GOOFY_LOOPS_TO_EXIT;

      goofyMoveTweenRef.current?.kill();
      goofyMoveTweenRef.current = gsap.to(goofyRef.current?.position ?? { x: GOOFY_START_X }, {
        x: GOOFY_EXIT_X,
        duration: movementDuration,
        ease: 'none',
        onComplete: () => {
          goofyAction.stop();
          goofyAction.fadeOut(0.3);
          goofyHideTimeoutRef.current = setTimeout(() => {
            if (goofyRef.current) {
              goofyRef.current.visible = false;
            }
            phaseRef.current = 'done';
            goofyHideTimeoutRef.current = null;
          }, 300);
        },
      });
    };

    const onTalkingFinished = (event: THREE.Event & { type: 'finished'; action: THREE.AnimationAction }) => {
      if (phaseRef.current !== 'talking' || event.action !== talkingActionRef.current) return;
      transitionAfterFadeOut(talkingRef, talkingAction, surprisedRef, surprisedAction, playSurprised);
    };

    const onSurprisedFinished = (event: THREE.Event & { type: 'finished'; action: THREE.AnimationAction }) => {
      if (phaseRef.current !== 'surprised' || event.action !== surprisedActionRef.current) return;
      transitionAfterFadeOut(surprisedRef, surprisedAction, blushingRef, blushingAction, playBlushing);
    };

    const onBlushingFinished = (event: THREE.Event & { type: 'finished'; action: THREE.AnimationAction }) => {
      if (phaseRef.current !== 'blushing' || event.action !== blushingActionRef.current) return;
      transitionAfterFadeOut(blushingRef, blushingAction, kissyRef, kissyAction, playKissy);
    };

    const onKissyFinished = (event: THREE.Event & { type: 'finished'; action: THREE.AnimationAction }) => {
      if (phaseRef.current !== 'kissy' || event.action !== kissyActionRef.current) return;
      kissyAction.fadeOut(0.15);
      phaseRef.current = 'goofy';
      const timeout = setTimeout(() => {
        if (kissyRef.current) {
          kissyRef.current.visible = false;
        }
        playGoofy();
      }, 150);
      transitionTimeoutsRef.current.push(timeout);
    };

    talkingMixer.addEventListener('finished', onTalkingFinished);
    surprisedMixer.addEventListener('finished', onSurprisedFinished);
    blushingMixer.addEventListener('finished', onBlushingFinished);
    kissyMixer.addEventListener('finished', onKissyFinished);

    startDelayRef.current = setTimeout(() => {
      playTalking();
    }, 1000);

    return () => {
      if (startDelayRef.current) {
        clearTimeout(startDelayRef.current);
        startDelayRef.current = null;
      }

      talkingMixer.removeEventListener('finished', onTalkingFinished);
      surprisedMixer.removeEventListener('finished', onSurprisedFinished);
      blushingMixer.removeEventListener('finished', onBlushingFinished);
      kissyMixer.removeEventListener('finished', onKissyFinished);

      transitionTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      transitionTimeoutsRef.current = [];

      if (goofyHideTimeoutRef.current) {
        clearTimeout(goofyHideTimeoutRef.current);
        goofyHideTimeoutRef.current = null;
      }

      goofyStartedRef.current = false;

      goofyMoveTweenRef.current?.kill();
      goofyMoveTweenRef.current = null;

      talkingAction.fadeOut(0.15);
      surprisedAction.fadeOut(0.15);
      blushingAction.fadeOut(0.15);
      kissyAction.fadeOut(0.15);
      goofyAction.fadeOut(0.3);
    };
  }, [
    calibrationMode,
    activeModelIndex,
    talkingActions,
    talkingGltf.animations,
    talkingMixer,
    surprisedActions,
    surprisedGltf.animations,
    surprisedMixer,
    blushingActions,
    blushingGltf.animations,
    blushingMixer,
    kissyActions,
    kissyGltf.animations,
    kissyMixer,
    goofyActions,
    goofyGltf.animations,
    goofyMixer,
    goofyScene,
  ]);

  return (
    <>
      <group
        ref={talkingRef}
        visible={false}
        position={talkingGirlTransform.position}
        scale={[talkingGirlTransform.scale, talkingGirlTransform.scale, talkingGirlTransform.scale]}
        rotation={talkingGirlTransform.rotation}
      >
        <primitive object={talkingScene} />
      </group>

      <group
        ref={surprisedRef}
        visible={false}
        position={surprisedTransform.position}
        scale={[surprisedTransform.scale, surprisedTransform.scale, surprisedTransform.scale]}
        rotation={surprisedTransform.rotation}
      >
        <primitive object={surprisedScene} />
      </group>

      <group
        ref={blushingRef}
        visible={false}
        position={blushingTransform.position}
        scale={[blushingTransform.scale, blushingTransform.scale, blushingTransform.scale]}
        rotation={blushingTransform.rotation}
      >
        <primitive object={blushingScene} />
      </group>

      <group
        ref={kissyRef}
        visible={false}
        position={kissyTransform.position}
        scale={[kissyTransform.scale, kissyTransform.scale, kissyTransform.scale]}
        rotation={kissyTransform.rotation}
      >
        <primitive object={kissyScene} />
      </group>

      <group
        ref={goofyRef}
        visible={false}
        position={goofyRunningTransform.position}
        scale={[
          goofyRunningTransform.scale,
          goofyRunningTransform.scale,
          goofyRunningTransform.scale,
        ]}
        rotation={goofyRunningTransform.rotation}
      >
        <primitive object={goofyScene} />
      </group>
    </>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(TALKING_GIRL_MODEL_PATH);
useGLTF.preload(SURPRISED_MODEL_PATH);
useGLTF.preload(BLUSHING_MODEL_PATH);
useGLTF.preload(KISSY_MODEL_PATH);
useGLTF.preload(GOOFY_RUNNING_MODEL_PATH);
