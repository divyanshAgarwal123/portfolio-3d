'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const DRACO_DECODER_PATH = '/draco-gltf/';

const TALKING_BOY_MODEL_PATH = '/models/talking_boy.glb';
const KNEELING_DOWN_MODEL_PATH = '/models/kneeling_down.glb';
const KNEELING_DOWN_PROPOSE_MODEL_PATH = '/models/kneeling_down_propose.glb';
const SITTING_TO_STANDING_MODEL_PATH = '/models/sitting_to_standing.glb';
const KISSY_MODEL_PATH = '/models/kissy.glb';
const CHEERING_MODEL_PATH = '/models/cheering2.glb';

const SHARED_POSITION: [number, number, number] = [-0.61, -0.36, 0.14];
const SHARED_SCALE = 0.053;
const SHARED_ROTATION: [number, number, number] = [0, -1.11, 0];

type ModelTransform = {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
};

export type MaleModelIndex = 0 | 1 | 2 | 3 | 4 | 5;

type MalePhase =
  | 'idle'
  | 'talking'
  | 'kneelingDown'
  | 'kneelingDownPropose'
  | 'sittingToStanding'
  | 'kissy'
  | 'cheering';

type BackgroundMaleSceneProps = {
  talkingBoyTransform?: ModelTransform;
  kneelingDownTransform?: ModelTransform;
  kneelingDownProposeTransform?: ModelTransform;
  sittingToStandingTransform?: ModelTransform;
  kissyTransform?: ModelTransform;
  cheeringTransform?: ModelTransform;
  calibrationMode?: boolean;
  activeModelIndex?: MaleModelIndex;
  onSyncCue?: (cue: 'surprised' | 'blushing' | 'kissy') => void;
};

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

export default function BackgroundMaleScene({
  talkingBoyTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: SHARED_ROTATION },
  kneelingDownTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: SHARED_ROTATION },
  kneelingDownProposeTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: SHARED_ROTATION },
  sittingToStandingTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: SHARED_ROTATION },
  kissyTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: SHARED_ROTATION },
  cheeringTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: SHARED_ROTATION },
  calibrationMode = false,
  activeModelIndex = 0,
  onSyncCue,
}: BackgroundMaleSceneProps) {
  const talkingBoyGltf = useGLTF(TALKING_BOY_MODEL_PATH, DRACO_DECODER_PATH);
  const kneelingDownGltf = useGLTF(KNEELING_DOWN_MODEL_PATH, DRACO_DECODER_PATH);
  const kneelingDownProposeGltf = useGLTF(KNEELING_DOWN_PROPOSE_MODEL_PATH, DRACO_DECODER_PATH);
  const sittingToStandingGltf = useGLTF(SITTING_TO_STANDING_MODEL_PATH, DRACO_DECODER_PATH);
  const kissyGltf = useGLTF(KISSY_MODEL_PATH, DRACO_DECODER_PATH);
  const cheeringGltf = useGLTF(CHEERING_MODEL_PATH, DRACO_DECODER_PATH);

  const talkingBoyScene = useMemo(() => clone(talkingBoyGltf.scene), [talkingBoyGltf.scene]);
  const kneelingDownScene = useMemo(() => clone(kneelingDownGltf.scene), [kneelingDownGltf.scene]);
  const kneelingDownProposeScene = useMemo(
    () => clone(kneelingDownProposeGltf.scene),
    [kneelingDownProposeGltf.scene],
  );
  const sittingToStandingScene = useMemo(
    () => clone(sittingToStandingGltf.scene),
    [sittingToStandingGltf.scene],
  );
  const kissyScene = useMemo(() => clone(kissyGltf.scene), [kissyGltf.scene]);
  const cheeringScene = useMemo(() => clone(cheeringGltf.scene), [cheeringGltf.scene]);

  const { actions: talkingBoyActions, mixer: talkingBoyMixer } = useAnimations(
    talkingBoyGltf.animations,
    talkingBoyScene,
  );
  const { actions: kneelingDownActions, mixer: kneelingDownMixer } = useAnimations(
    kneelingDownGltf.animations,
    kneelingDownScene,
  );
  const { actions: kneelingDownProposeActions, mixer: kneelingDownProposeMixer } = useAnimations(
    kneelingDownProposeGltf.animations,
    kneelingDownProposeScene,
  );
  const { actions: sittingToStandingActions, mixer: sittingToStandingMixer } = useAnimations(
    sittingToStandingGltf.animations,
    sittingToStandingScene,
  );
  const { actions: kissyActions, mixer: kissyMixer } = useAnimations(kissyGltf.animations, kissyScene);
  const { actions: cheeringActions, mixer: cheeringMixer } = useAnimations(cheeringGltf.animations, cheeringScene);

  const phaseRef = useRef<MalePhase>('idle');
  const startDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const talkingBoyRef = useRef<THREE.Group>(null);
  const kneelingDownRef = useRef<THREE.Group>(null);
  const kneelingDownProposeRef = useRef<THREE.Group>(null);
  const sittingToStandingRef = useRef<THREE.Group>(null);
  const kissyRef = useRef<THREE.Group>(null);
  const cheeringRef = useRef<THREE.Group>(null);

  const talkingBoyActionRef = useRef<THREE.AnimationAction | null>(null);
  const kneelingDownActionRef = useRef<THREE.AnimationAction | null>(null);
  const kneelingDownProposeActionRef = useRef<THREE.AnimationAction | null>(null);
  const sittingToStandingActionRef = useRef<THREE.AnimationAction | null>(null);
  const kissyActionRef = useRef<THREE.AnimationAction | null>(null);
  const cheeringActionRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    setFrustumCulledFalse(talkingBoyScene);
    setFrustumCulledFalse(kneelingDownScene);
    setFrustumCulledFalse(kneelingDownProposeScene);
    setFrustumCulledFalse(sittingToStandingScene);
    setFrustumCulledFalse(kissyScene);
    setFrustumCulledFalse(cheeringScene);
  }, [
    talkingBoyScene,
    kneelingDownScene,
    kneelingDownProposeScene,
    sittingToStandingScene,
    kissyScene,
    cheeringScene,
  ]);

  useEffect(() => {
    console.log('BackgroundMaleScene talking_boy clips:', talkingBoyGltf.animations.map((clip) => clip.name));
    console.log(
      'BackgroundMaleScene kneeling_down clips:',
      kneelingDownGltf.animations.map((clip) => clip.name),
    );
    console.log(
      'BackgroundMaleScene kneeling_down_propose clips:',
      kneelingDownProposeGltf.animations.map((clip) => clip.name),
    );
    console.log(
      'BackgroundMaleScene sitting_to_standing clips:',
      sittingToStandingGltf.animations.map((clip) => clip.name),
    );
    console.log('BackgroundMaleScene kissy clips:', kissyGltf.animations.map((clip) => clip.name));
    console.log('BackgroundMaleScene cheering2 clips:', cheeringGltf.animations.map((clip) => clip.name));
  }, [
    talkingBoyGltf.animations,
    kneelingDownGltf.animations,
    kneelingDownProposeGltf.animations,
    sittingToStandingGltf.animations,
    kissyGltf.animations,
    cheeringGltf.animations,
  ]);

  useEffect(() => {
    const talkingPick = pickFirstAction(talkingBoyActions, talkingBoyGltf.animations);
    const kneelingDownPick = pickFirstAction(kneelingDownActions, kneelingDownGltf.animations);
    const kneelingDownProposePick = pickFirstAction(
      kneelingDownProposeActions,
      kneelingDownProposeGltf.animations,
    );
    const sittingToStandingPick = pickFirstAction(
      sittingToStandingActions,
      sittingToStandingGltf.animations,
    );
    const kissyPick = pickFirstAction(kissyActions, kissyGltf.animations);
    const cheeringPick = pickFirstAction(cheeringActions, cheeringGltf.animations);

    if (
      !talkingPick ||
      !kneelingDownPick ||
      !kneelingDownProposePick ||
      !sittingToStandingPick ||
      !kissyPick ||
      !cheeringPick
    ) {
      return;
    }

    const talkingAction = talkingPick.action;
    const kneelingAction = kneelingDownPick.action;
    const kneelingProposeAction = kneelingDownProposePick.action;
    const sittingToStandingAction = sittingToStandingPick.action;
    const kissyAction = kissyPick.action;
    const cheeringAction = cheeringPick.action;

    talkingBoyActionRef.current = talkingAction;
    kneelingDownActionRef.current = kneelingAction;
    kneelingDownProposeActionRef.current = kneelingProposeAction;
    sittingToStandingActionRef.current = sittingToStandingAction;
    kissyActionRef.current = kissyAction;
    cheeringActionRef.current = cheeringAction;

    const modelRefs = [
      talkingBoyRef,
      kneelingDownRef,
      kneelingDownProposeRef,
      sittingToStandingRef,
      kissyRef,
      cheeringRef,
    ] as const;

    const modelActions = [
      talkingAction,
      kneelingAction,
      kneelingProposeAction,
      sittingToStandingAction,
      kissyAction,
      cheeringAction,
    ] as const;

    if (calibrationMode) {
      phaseRef.current = 'idle';
      modelRefs.forEach((ref, index) => {
        const active = index === activeModelIndex;
        if (ref.current) {
          ref.current.visible = active;
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

      return () => {
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

    const handoffToNext = (
      fromRef: React.RefObject<THREE.Group>,
      fromAction: THREE.AnimationAction,
      toRef: React.RefObject<THREE.Group>,
      toAction: THREE.AnimationAction,
      nextPhase: MalePhase,
    ) => {
      fromAction.fadeOut(0.15);
      const timeout = setTimeout(() => {
        if (fromRef.current) {
          fromRef.current.visible = false;
        }
        if (toRef.current) {
          toRef.current.visible = true;
        }
        phaseRef.current = nextPhase;
        toAction.enabled = true;
        toAction.setLoop(THREE.LoopOnce, 1);
        toAction.clampWhenFinished = true;
        toAction.reset().fadeIn(0.15).play();

        if (nextPhase === 'kneelingDown') {
          onSyncCue?.('surprised');
        } else if (nextPhase === 'kneelingDownPropose') {
          onSyncCue?.('blushing');
        } else if (nextPhase === 'kissy') {
          onSyncCue?.('kissy');
        }
      }, 150);
      transitionTimeoutsRef.current.push(timeout);
    };

    const startTalking = () => {
      phaseRef.current = 'talking';
      playLoopOnce(talkingBoyRef, talkingAction);
    };

    const startCheering = () => {
      phaseRef.current = 'cheering';
      if (cheeringRef.current) {
        cheeringRef.current.visible = true;
      }
      cheeringAction.enabled = true;
      cheeringAction.setLoop(THREE.LoopRepeat, Infinity);
      cheeringAction.clampWhenFinished = true;
      cheeringAction.reset().fadeIn(0.15).play();
    };

    const onTalkingFinished = (event: THREE.Event & { type: 'finished'; action: THREE.AnimationAction }) => {
      if (phaseRef.current !== 'talking' || event.action !== talkingBoyActionRef.current) return;
      handoffToNext(
        talkingBoyRef,
        talkingAction,
        kneelingDownRef,
        kneelingAction,
        'kneelingDown',
      );
    };

    const onKneelingFinished = (event: THREE.Event & { type: 'finished'; action: THREE.AnimationAction }) => {
      if (phaseRef.current !== 'kneelingDown' || event.action !== kneelingDownActionRef.current) return;
      handoffToNext(
        kneelingDownRef,
        kneelingAction,
        kneelingDownProposeRef,
        kneelingProposeAction,
        'kneelingDownPropose',
      );
    };

    const onKneelingProposeFinished = (
      event: THREE.Event & { type: 'finished'; action: THREE.AnimationAction },
    ) => {
      if (phaseRef.current !== 'kneelingDownPropose' || event.action !== kneelingDownProposeActionRef.current) {
        return;
      }
      handoffToNext(
        kneelingDownProposeRef,
        kneelingProposeAction,
        sittingToStandingRef,
        sittingToStandingAction,
        'sittingToStanding',
      );
    };

    const onSittingToStandingFinished = (
      event: THREE.Event & { type: 'finished'; action: THREE.AnimationAction },
    ) => {
      if (phaseRef.current !== 'sittingToStanding' || event.action !== sittingToStandingActionRef.current) {
        return;
      }
      handoffToNext(sittingToStandingRef, sittingToStandingAction, kissyRef, kissyAction, 'kissy');
    };

    const onKissyFinished = (event: THREE.Event & { type: 'finished'; action: THREE.AnimationAction }) => {
      if (phaseRef.current !== 'kissy' || event.action !== kissyActionRef.current) return;
      kissyAction.fadeOut(0.15);
      const timeout = setTimeout(() => {
        if (kissyRef.current) {
          kissyRef.current.visible = false;
        }
        startCheering();
      }, 150);
      transitionTimeoutsRef.current.push(timeout);
    };

    talkingBoyMixer.addEventListener('finished', onTalkingFinished);
    kneelingDownMixer.addEventListener('finished', onKneelingFinished);
    kneelingDownProposeMixer.addEventListener('finished', onKneelingProposeFinished);
    sittingToStandingMixer.addEventListener('finished', onSittingToStandingFinished);
    kissyMixer.addEventListener('finished', onKissyFinished);

    startDelayRef.current = setTimeout(() => {
      startTalking();
    }, 1000);

    return () => {
      if (startDelayRef.current) {
        clearTimeout(startDelayRef.current);
        startDelayRef.current = null;
      }

      transitionTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      transitionTimeoutsRef.current = [];

      talkingBoyMixer.removeEventListener('finished', onTalkingFinished);
      kneelingDownMixer.removeEventListener('finished', onKneelingFinished);
      kneelingDownProposeMixer.removeEventListener('finished', onKneelingProposeFinished);
      sittingToStandingMixer.removeEventListener('finished', onSittingToStandingFinished);
      kissyMixer.removeEventListener('finished', onKissyFinished);

      modelActions.forEach((action) => {
        action.fadeOut(0.15);
        action.stop();
      });

      talkingBoyMixer.stopAllAction();
      kneelingDownMixer.stopAllAction();
      kneelingDownProposeMixer.stopAllAction();
      sittingToStandingMixer.stopAllAction();
      kissyMixer.stopAllAction();
      cheeringMixer.stopAllAction();
    };
  }, [
    calibrationMode,
    activeModelIndex,
    talkingBoyActions,
    talkingBoyGltf.animations,
    talkingBoyMixer,
    kneelingDownActions,
    kneelingDownGltf.animations,
    kneelingDownMixer,
    kneelingDownProposeActions,
    kneelingDownProposeGltf.animations,
    kneelingDownProposeMixer,
    sittingToStandingActions,
    sittingToStandingGltf.animations,
    sittingToStandingMixer,
    kissyActions,
    kissyGltf.animations,
    kissyMixer,
    cheeringActions,
    cheeringGltf.animations,
    cheeringMixer,
    onSyncCue,
  ]);

  return (
    <>
      <group
        ref={talkingBoyRef}
        visible={false}
        position={talkingBoyTransform.position}
        scale={[talkingBoyTransform.scale, talkingBoyTransform.scale, talkingBoyTransform.scale]}
        rotation={talkingBoyTransform.rotation}
      >
        <primitive object={talkingBoyScene} />
      </group>

      <group
        ref={kneelingDownRef}
        visible={false}
        position={kneelingDownTransform.position}
        scale={[kneelingDownTransform.scale, kneelingDownTransform.scale, kneelingDownTransform.scale]}
        rotation={kneelingDownTransform.rotation}
      >
        <primitive object={kneelingDownScene} />
      </group>

      <group
        ref={kneelingDownProposeRef}
        visible={false}
        position={kneelingDownProposeTransform.position}
        scale={[
          kneelingDownProposeTransform.scale,
          kneelingDownProposeTransform.scale,
          kneelingDownProposeTransform.scale,
        ]}
        rotation={kneelingDownProposeTransform.rotation}
      >
        <primitive object={kneelingDownProposeScene} />
      </group>

      <group
        ref={sittingToStandingRef}
        visible={false}
        position={sittingToStandingTransform.position}
        scale={[
          sittingToStandingTransform.scale,
          sittingToStandingTransform.scale,
          sittingToStandingTransform.scale,
        ]}
        rotation={sittingToStandingTransform.rotation}
      >
        <primitive object={sittingToStandingScene} />
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
        ref={cheeringRef}
        visible={false}
        position={cheeringTransform.position}
        scale={[cheeringTransform.scale, cheeringTransform.scale, cheeringTransform.scale]}
        rotation={cheeringTransform.rotation}
      >
        <primitive object={cheeringScene} />
      </group>
    </>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(TALKING_BOY_MODEL_PATH);
useGLTF.preload(KNEELING_DOWN_MODEL_PATH);
useGLTF.preload(KNEELING_DOWN_PROPOSE_MODEL_PATH);
useGLTF.preload(SITTING_TO_STANDING_MODEL_PATH);
useGLTF.preload(KISSY_MODEL_PATH);
useGLTF.preload(CHEERING_MODEL_PATH);
