'use client';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

const DRACO_DECODER_PATH = '/draco-gltf/';

const TALKING_GIRL_PATH = '/models/robot_animation/talking_girl.glb';
const SURPRISED_PATH = '/models/robot_animation/surprised.glb';
const BLUSHING_PATH = '/models/robot_animation/blushing.glb';
const KISSY_PATH = '/models/robot_animation/kissy.glb';
const GOOFY_RUNNING_PATH = '/models/robot_animation/goofy_running.glb';

const SHARED_POSITION: [number, number, number] = [0.0, -0.36, 0.56];
const SHARED_SCALE = 0.03;
const LOOP_ONCE_FADE = 0.25;
const APPEAR_FADE = 0.2;

type SequencePhase = 0 | 1 | 2 | 3 | 4 | 5;
type ModelIndex = 0 | 1 | 2 | 3 | 4;

type ModelTransform = {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
};

type BackgroundGirlSceneProps = {
  talkingGirlTransform?: ModelTransform;
  surprisedTransform?: ModelTransform;
  blushingTransform?: ModelTransform;
  kissyTransform?: ModelTransform;
  goofyRunningTransform?: ModelTransform;
  calibrationMode?: boolean;
  activeModelIndex?: ModelIndex;
};

function getFirstAction(
  actions: Record<string, THREE.AnimationAction | null>,
  animations: THREE.AnimationClip[],
): THREE.AnimationAction | null {
  const firstClipName = animations[0]?.name;
  const fallbackName = Object.keys(actions)[0];
  const key = firstClipName ?? fallbackName;
  if (!key) return null;
  const action = actions[key];
  return action ?? null;
}

function disableFrustumCulling(scene: THREE.Object3D) {
  scene.traverse((object) => {
    if ((object as { isMesh?: boolean }).isMesh) {
      object.frustumCulled = false;
    }
  });
}

export default function BackgroundGirlScene({
  talkingGirlTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: [0, 0, 0] },
  surprisedTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: [0, 0, 0] },
  blushingTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: [0, 0, 0] },
  kissyTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: [0, 0, 0] },
  goofyRunningTransform = { position: SHARED_POSITION, scale: SHARED_SCALE, rotation: [0, 0, 0] },
  calibrationMode = false,
  activeModelIndex = 0,
}: BackgroundGirlSceneProps) {
  const phase = useRef<SequencePhase>(0);

  const talkingGirlGltf = useGLTF(TALKING_GIRL_PATH, DRACO_DECODER_PATH);
  const surprisedGltf = useGLTF(SURPRISED_PATH, DRACO_DECODER_PATH);
  const blushingGltf = useGLTF(BLUSHING_PATH, DRACO_DECODER_PATH);
  const kissyGltf = useGLTF(KISSY_PATH, DRACO_DECODER_PATH);
  const goofyRunningGltf = useGLTF(GOOFY_RUNNING_PATH, DRACO_DECODER_PATH);

  const talkingGirlScene = useMemo(() => clone(talkingGirlGltf.scene), [talkingGirlGltf.scene]);
  const surprisedScene = useMemo(() => clone(surprisedGltf.scene), [surprisedGltf.scene]);
  const blushingScene = useMemo(() => clone(blushingGltf.scene), [blushingGltf.scene]);
  const kissyScene = useMemo(() => clone(kissyGltf.scene), [kissyGltf.scene]);
  const goofyRunningScene = useMemo(() => clone(goofyRunningGltf.scene), [goofyRunningGltf.scene]);

  useEffect(() => {
    disableFrustumCulling(talkingGirlScene);
    disableFrustumCulling(surprisedScene);
    disableFrustumCulling(blushingScene);
    disableFrustumCulling(kissyScene);
    disableFrustumCulling(goofyRunningScene);
  }, [talkingGirlScene, surprisedScene, blushingScene, kissyScene, goofyRunningScene]);

  const { actions: talkingGirlActions, mixer: talkingGirlMixer } = useAnimations(
    talkingGirlGltf.animations,
    talkingGirlScene,
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
  const { actions: goofyRunningActions, mixer: goofyRunningMixer } = useAnimations(
    goofyRunningGltf.animations,
    goofyRunningScene,
  );

  const talkingGirlRef = useRef<THREE.Group>(null);
  const surprisedRef = useRef<THREE.Group>(null);
  const blushingRef = useRef<THREE.Group>(null);
  const kissyRef = useRef<THREE.Group>(null);
  const goofyRunningRef = useRef<THREE.Group>(null);

  const talkingGirlActionRef = useRef<THREE.AnimationAction | null>(null);
  const surprisedActionRef = useRef<THREE.AnimationAction | null>(null);
  const blushingActionRef = useRef<THREE.AnimationAction | null>(null);
  const kissyActionRef = useRef<THREE.AnimationAction | null>(null);
  const goofyRunningActionRef = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    talkingGirlActionRef.current = getFirstAction(talkingGirlActions, talkingGirlGltf.animations);
    surprisedActionRef.current = getFirstAction(surprisedActions, surprisedGltf.animations);
    blushingActionRef.current = getFirstAction(blushingActions, blushingGltf.animations);
    kissyActionRef.current = getFirstAction(kissyActions, kissyGltf.animations);
    goofyRunningActionRef.current = getFirstAction(goofyRunningActions, goofyRunningGltf.animations);

    if (talkingGirlActionRef.current) {
      console.log('talking_girl clip:', talkingGirlActionRef.current.getClip().name);
    }
    if (surprisedActionRef.current) {
      console.log('surprised clip:', surprisedActionRef.current.getClip().name);
    }
    if (blushingActionRef.current) {
      console.log('blushing clip:', blushingActionRef.current.getClip().name);
    }
    if (kissyActionRef.current) {
      console.log('kissy clip:', kissyActionRef.current.getClip().name);
    }
    if (goofyRunningActionRef.current) {
      console.log('goofy_running clip:', goofyRunningActionRef.current.getClip().name);
    }
  }, [
    talkingGirlActions,
    talkingGirlGltf.animations,
    surprisedActions,
    surprisedGltf.animations,
    blushingActions,
    blushingGltf.animations,
    kissyActions,
    kissyGltf.animations,
    goofyRunningActions,
    goofyRunningGltf.animations,
  ]);

  useEffect(() => {
    const talkingGirlAction = talkingGirlActionRef.current;
    const surprisedAction = surprisedActionRef.current;
    const blushingAction = blushingActionRef.current;
    const kissyAction = kissyActionRef.current;
    const goofyRunningAction = goofyRunningActionRef.current;

    if (!talkingGirlRef.current || !surprisedRef.current || !blushingRef.current || !kissyRef.current || !goofyRunningRef.current) {
      return;
    }

    if (!talkingGirlAction || !surprisedAction || !blushingAction || !kissyAction || !goofyRunningAction) {
      return;
    }

    talkingGirlRef.current.visible = false;
    surprisedRef.current.visible = false;
    blushingRef.current.visible = false;
    kissyRef.current.visible = false;
    goofyRunningRef.current.visible = false;

    talkingGirlAction.stop();
    surprisedAction.stop();
    blushingAction.stop();
    kissyAction.stop();
    goofyRunningAction.stop();

    if (calibrationMode) {
      const refs = [talkingGirlRef, surprisedRef, blushingRef, kissyRef, goofyRunningRef] as const;
      const actions = [talkingGirlAction, surprisedAction, blushingAction, kissyAction, goofyRunningAction] as const;
      const selectedRef = refs[activeModelIndex].current;
      const selectedAction = actions[activeModelIndex];
      if (!selectedRef || !selectedAction) return;

      selectedRef.visible = true;
      selectedAction.enabled = true;
      selectedAction.setLoop(THREE.LoopRepeat, Infinity);
      selectedAction.clampWhenFinished = false;
      selectedAction.reset().fadeIn(APPEAR_FADE).play();

      return () => {
        selectedAction.fadeOut(0.1);
      };
    }

    phase.current = 1;

    talkingGirlRef.current.visible = true;
    talkingGirlAction.enabled = true;
    talkingGirlAction.setLoop(THREE.LoopOnce, 1);
    talkingGirlAction.clampWhenFinished = true;
    talkingGirlAction.reset().fadeIn(APPEAR_FADE).play();

    const onTalkingFinished = () => {
      if (phase.current !== 1) return;
      phase.current = 2;

      talkingGirlAction.fadeOut(LOOP_ONCE_FADE);
      surprisedRef.current!.visible = true;
      surprisedAction.enabled = true;
      surprisedAction.setLoop(THREE.LoopOnce, 1);
      surprisedAction.clampWhenFinished = true;
      surprisedAction.reset().fadeIn(LOOP_ONCE_FADE).play();
    };

    const onSurprisedFinished = () => {
      if (phase.current !== 2) return;
      phase.current = 3;

      surprisedAction.fadeOut(LOOP_ONCE_FADE);
      blushingRef.current!.visible = true;
      blushingAction.enabled = true;
      blushingAction.setLoop(THREE.LoopOnce, 1);
      blushingAction.clampWhenFinished = true;
      blushingAction.reset().fadeIn(LOOP_ONCE_FADE).play();
    };

    const onBlushingFinished = () => {
      if (phase.current !== 3) return;
      phase.current = 4;

      blushingAction.fadeOut(LOOP_ONCE_FADE);
      kissyRef.current!.visible = true;
      kissyAction.enabled = true;
      kissyAction.setLoop(THREE.LoopOnce, 1);
      kissyAction.clampWhenFinished = true;
      kissyAction.reset().fadeIn(LOOP_ONCE_FADE).play();
    };

    const onKissyFinished = () => {
      if (phase.current !== 4) return;
      phase.current = 5;

      kissyAction.fadeOut(LOOP_ONCE_FADE);
      goofyRunningRef.current!.visible = true;
      goofyRunningAction.enabled = true;
      goofyRunningAction.setLoop(THREE.LoopRepeat, Infinity);
      goofyRunningAction.clampWhenFinished = false;
      goofyRunningAction.reset().fadeIn(LOOP_ONCE_FADE).play();
    };

    talkingGirlMixer.addEventListener('finished', onTalkingFinished);
    surprisedMixer.addEventListener('finished', onSurprisedFinished);
    blushingMixer.addEventListener('finished', onBlushingFinished);
    kissyMixer.addEventListener('finished', onKissyFinished);

    return () => {
      talkingGirlMixer.removeEventListener('finished', onTalkingFinished);
      surprisedMixer.removeEventListener('finished', onSurprisedFinished);
      blushingMixer.removeEventListener('finished', onBlushingFinished);
      kissyMixer.removeEventListener('finished', onKissyFinished);

      talkingGirlAction.fadeOut(0.1);
      surprisedAction.fadeOut(0.1);
      blushingAction.fadeOut(0.1);
      kissyAction.fadeOut(0.1);
      goofyRunningAction.fadeOut(0.1);
    };
  }, [talkingGirlMixer, surprisedMixer, blushingMixer, kissyMixer, calibrationMode, activeModelIndex]);

  return (
    <>
      <group
        ref={talkingGirlRef}
        visible={false}
        position={talkingGirlTransform.position}
        rotation={talkingGirlTransform.rotation}
        scale={[talkingGirlTransform.scale, talkingGirlTransform.scale, talkingGirlTransform.scale]}
      >
        <primitive object={talkingGirlScene} />
      </group>

      <group
        ref={surprisedRef}
        visible={false}
        position={surprisedTransform.position}
        rotation={surprisedTransform.rotation}
        scale={[surprisedTransform.scale, surprisedTransform.scale, surprisedTransform.scale]}
      >
        <primitive object={surprisedScene} />
      </group>

      <group
        ref={blushingRef}
        visible={false}
        position={blushingTransform.position}
        rotation={blushingTransform.rotation}
        scale={[blushingTransform.scale, blushingTransform.scale, blushingTransform.scale]}
      >
        <primitive object={blushingScene} />
      </group>

      <group
        ref={kissyRef}
        visible={false}
        position={kissyTransform.position}
        rotation={kissyTransform.rotation}
        scale={[kissyTransform.scale, kissyTransform.scale, kissyTransform.scale]}
      >
        <primitive object={kissyScene} />
      </group>

      <group
        ref={goofyRunningRef}
        visible={false}
        position={goofyRunningTransform.position}
        rotation={goofyRunningTransform.rotation}
        scale={[goofyRunningTransform.scale, goofyRunningTransform.scale, goofyRunningTransform.scale]}
      >
        <primitive object={goofyRunningScene} />
      </group>
    </>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(TALKING_GIRL_PATH);
useGLTF.preload(SURPRISED_PATH);
useGLTF.preload(BLUSHING_PATH);
useGLTF.preload(KISSY_PATH);
useGLTF.preload(GOOFY_RUNNING_PATH);
