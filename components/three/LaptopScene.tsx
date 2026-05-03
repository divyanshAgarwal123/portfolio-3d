'use client';

import { Sparkles } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useSceneStore } from '@/store/useSceneStore';
import BackgroundMaleScene, { type MaleModelIndex } from './BackgroundMaleScene';
import BackgroundProposalScene, { type FemaleSyncCue } from './BackgroundProposalScene';
import BackgroundRobotArm from './BackgroundRobotArm';
import BackgroundRobots from './BackgroundRobots';
import Effects from './Effects';
import Laptop from './Laptop';
import LaptopScreen from './LaptopScreen';
import RobotHero from './RobotHero';

type LaptopTestTransform = {
  position: [number, number, number];
  rotationY: number;
  scale: number;
  lidAngle: number;
};

type RobotTransform = {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
};

type ScrollDrivenLaptopProps = {
  onScrollChange?: (offset: number) => void;
  onScrollDirectionChange?: (direction: 'up' | 'down' | 'idle', delta: number) => void;
  testMode?: boolean;
  testTransform?: LaptopTestTransform;
  robotPointingBackwords?: RobotTransform;
  robotFalling?: RobotTransform;
  robotWalking?: RobotTransform;
  robotClimbingToLaptop?: RobotTransform;
  robotCutelySitting?: RobotTransform;
  robotStandingToSitting?: RobotTransform;
  backgroundRobotArm?: RobotTransform;
  backgroundRobotThinking?: RobotTransform;
  backgroundRobotTellingSecret?: RobotTransform;
  backgroundRobotPushup?: RobotTransform;
  backgroundRobotNervousLookAround?: RobotTransform;
  manualClimbingSequence?: boolean;
  climbingSequenceStep?: number;
  laptopScale?: number;
  laptopPosition?: [number, number, number];
  laptopRotation?: [number, number, number];
  laptopScreenScaleX?: number;
  laptopScreenScaleY?: number;
};

function ScrollDrivenLaptop({
  onScrollChange,
  onScrollDirectionChange,
  testMode = false,
  testTransform,
  robotPointingBackwords = { position: [0, -0.36, 0.49], scale: 0.03, rotation: [0, 0, 0] },
  robotFalling = { position: [0, 0.3, 0.49], scale: 0.03, rotation: [0, 0, 0] },
  robotWalking = { position: [0.004, -0.36, 0.56], scale: 0.03, rotation: [0, 0, 0] },
  robotClimbingToLaptop = { position: [0.46, 0.26, -0.73], scale: 0.087, rotation: [0, 0, 0] },
  robotCutelySitting = { position: [0.46, 0.33, -0.69], scale: 0.087, rotation: [0, 0, 0] },
  robotStandingToSitting = { position: [0.46, 0.35, -0.68], scale: 0.087, rotation: [0, 0, 0] },
  backgroundRobotArm = { position: [0.9, -0.36, -0.44], scale: 0.0003, rotation: [0, 0, 0] },
  manualClimbingSequence = false,
  climbingSequenceStep = 0,
  laptopScale = 0.04,
  laptopPosition = [0.01, -0.43, -0.42],
  laptopRotation = [0, -0.01, 0],
  laptopScreenScaleX = 0.985,
  laptopScreenScaleY = 0.985,
}: ScrollDrivenLaptopProps) {
  const [lidAngle, setLidAngle] = useState(-1.59);
  const [climbingStartReady, setClimbingStartReady] = useState(false);
  const lastReportedOffset = useRef(-1);
  const previousLidAngle = useRef(-1.59);
  const lidOpenDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lidOpenArmedRef = useRef(false);
  const climbingReadyRef = useRef(false);
  const lidFullyOpenRef = useRef(false);
  const [laptopScene, setLaptopScene] = useState<THREE.Group | null>(null);

  // Virtual scroll progress for the lid phase (0 = closed, 1 = fully open)
  const virtualProgressRef = useRef(0);
  const lidPhaseCompleteRef = useRef(false);
  // Sensitivity: how many pixels of wheel delta equal a full lid open
  const WHEEL_RANGE = typeof window !== 'undefined' ? window.innerHeight : 900;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleWheel = (e: WheelEvent) => {
      // Block all scroll interaction during cinematic sequence
      const scenePhase = useSceneStore.getState().phase;
      if (scenePhase !== 'revealed') {
        e.preventDefault();
        return;
      }

      const atTop = window.scrollY <= 1;
      const delta = e.deltaY / WHEEL_RANGE;
      const isOpening = !lidPhaseCompleteRef.current;
      const isClosing = lidPhaseCompleteRef.current && atTop && delta < 0;

      // When fully open, only intercept if we are closing from the top
      if (!isOpening && !isClosing) return;

      // Prevent the page from scrolling while lid is opening or closing at the top
      e.preventDefault();

      // Accumulate wheel delta into virtual progress
      if (isClosing) {
        lidPhaseCompleteRef.current = false;
      }

      virtualProgressRef.current = THREE.MathUtils.clamp(
        virtualProgressRef.current + delta,
        0,
        1,
      );

      // When progress hits 1, mark lid phase complete and stop intercepting
      if (virtualProgressRef.current >= 0.999) {
        lidPhaseCompleteRef.current = true;
      }
    };

    // passive: false is required to call preventDefault on wheel events
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (lidOpenDelayRef.current) {
        clearTimeout(lidOpenDelayRef.current);
        lidOpenDelayRef.current = null;
      }
    };
  }, []);

  useFrame(() => {
    if (typeof window === 'undefined') return;

    const normalized = virtualProgressRef.current;
    const nextAngle = THREE.MathUtils.lerp(-1.59, -0.23, normalized);
    const isFullyOpen = normalized >= 0.999;

    // Dispatch lid open/close events
    if (isFullyOpen !== lidFullyOpenRef.current) {
      lidFullyOpenRef.current = isFullyOpen;
      window.dispatchEvent(
        new CustomEvent(isFullyOpen ? 'laptop-lid-open' : 'laptop-lid-close', {
          detail: { normalized },
        }),
      );
    }

    // Climbing delay after lid fully opens
    if (normalized >= 0.999) {
      if (!lidOpenArmedRef.current) {
        lidOpenArmedRef.current = true;
        lidOpenDelayRef.current = setTimeout(() => {
          climbingReadyRef.current = true;
          setClimbingStartReady(true);
        }, 1000);
      }
    } else {
      lidOpenArmedRef.current = false;
      if (lidOpenDelayRef.current) {
        clearTimeout(lidOpenDelayRef.current);
        lidOpenDelayRef.current = null;
      }
      if (climbingReadyRef.current) {
        climbingReadyRef.current = false;
        setClimbingStartReady(false);
      }
    }

    // Update lid angle state (with threshold to avoid excessive re-renders)
    if (Math.abs(nextAngle - previousLidAngle.current) > 0.0005) {
      previousLidAngle.current = nextAngle;
      setLidAngle(nextAngle);
    }

    // Scroll offset callback
    if (onScrollChange) {
      const roundedOffset = Number(normalized.toFixed(3));
      if (roundedOffset !== lastReportedOffset.current) {
        lastReportedOffset.current = roundedOffset;
        onScrollChange(roundedOffset);
      }
    }

    // Scroll direction callback (during page scroll phase)
    if (onScrollDirectionChange && lidPhaseCompleteRef.current) {
      const scrollY = window.scrollY;
      const delta = scrollY - (previousLidAngle.current ?? 0);
      const direction = delta > 0.5 ? 'down' : delta < -0.5 ? 'up' : 'idle';
      onScrollDirectionChange(direction, delta);
    }
  });

  return (
    <group>
      <Laptop
        lidAngle={lidAngle}
        verticalOffset={0}
        position={laptopPosition}
        rotation={laptopRotation}
        modelScale={laptopScale}
        onSceneReady={setLaptopScene}
      />
      <LaptopScreen
        laptopScene={laptopScene}
        lidAngle={lidAngle}
        screenScaleX={laptopScreenScaleX}
        screenScaleY={laptopScreenScaleY}
      />
      <Suspense fallback={null}>
        <RobotHero
          fallingTransform={robotFalling}
          pointingTransform={robotPointingBackwords}
          runningTransform={robotWalking}
          climbingToLaptopTransform={robotClimbingToLaptop}
          cutelySittingTransform={robotCutelySitting}
          standingToSittingTransform={robotStandingToSitting}
          manualClimbingSequence={manualClimbingSequence}
          climbingSequenceStep={climbingSequenceStep}
          climbingStartReady={climbingStartReady}
        />
      </Suspense>
    </group>
  );
}


type LaptopSceneProps = {
  onScrollChange?: (offset: number) => void;
  onScrollDirectionChange?: (direction: 'up' | 'down' | 'idle', delta: number) => void;
  testMode?: boolean;
  testTransform?: LaptopTestTransform;
  robotPointingBackwords?: RobotTransform;
  robotFalling?: RobotTransform;
  robotWalking?: RobotTransform;
  robotClimbingToLaptop?: RobotTransform;
  robotCutelySitting?: RobotTransform;
  robotStandingToSitting?: RobotTransform;
  backgroundRobotArm?: RobotTransform;
  backgroundRobotThinking?: RobotTransform;
  backgroundRobotTellingSecret?: RobotTransform;
  backgroundRobotPushup?: RobotTransform;
  backgroundRobotNervousLookAround?: RobotTransform;
  manualClimbingSequence?: boolean;
  climbingSequenceStep?: number;
  laptopScale?: number;
  laptopPosition?: [number, number, number];
  laptopRotation?: [number, number, number];
  laptopScreenScaleX?: number;
  laptopScreenScaleY?: number;
  talkingBoyTransform?: RobotTransform;
  kneelingDownTransform?: RobotTransform;
  kneelingDownProposeTransform?: RobotTransform;
  sittingToStandingTransform?: RobotTransform;
  kissyMaleTransform?: RobotTransform;
  cheeringTransform?: RobotTransform;
  maleCalibrationMode?: boolean;
  activeMaleModelIndex?: MaleModelIndex;
  talkingGirlTransform?: RobotTransform;
  surprisedTransform?: RobotTransform;
  blushingTransform?: RobotTransform;
  kissyTransform?: RobotTransform;
  goofyRunningTransform?: RobotTransform;
  girlCalibrationMode?: boolean;
  activeGirlModelIndex?: 0 | 1 | 2 | 3 | 4;
};

export default function LaptopScene({
  onScrollChange,
  onScrollDirectionChange,
  testMode,
  testTransform,
  robotPointingBackwords,
  robotFalling,
  robotWalking,
  robotClimbingToLaptop,
  robotCutelySitting,
  robotStandingToSitting,
  backgroundRobotArm,
  backgroundRobotThinking,
  backgroundRobotTellingSecret,
  backgroundRobotPushup,
  backgroundRobotNervousLookAround,
  manualClimbingSequence,
  climbingSequenceStep,
  laptopScale,
  laptopPosition,
  laptopRotation,
  laptopScreenScaleX,
  laptopScreenScaleY,
  talkingBoyTransform,
  kneelingDownTransform,
  kneelingDownProposeTransform,
  sittingToStandingTransform,
  kissyMaleTransform,
  cheeringTransform,
  maleCalibrationMode,
  activeMaleModelIndex,
  talkingGirlTransform,
  surprisedTransform,
  blushingTransform,
  kissyTransform,
  goofyRunningTransform,
  girlCalibrationMode,
  activeGirlModelIndex,
}: LaptopSceneProps) {
  const [femaleSyncCue, setFemaleSyncCue] = useState<FemaleSyncCue>(null);

  return (
    <>
      <Suspense fallback={null}>
        <BackgroundRobotArm transform={backgroundRobotArm} />
      </Suspense>
      <Suspense fallback={null}>
        <BackgroundMaleScene
          talkingBoyTransform={talkingBoyTransform}
          kneelingDownTransform={kneelingDownTransform}
          kneelingDownProposeTransform={kneelingDownProposeTransform}
          sittingToStandingTransform={sittingToStandingTransform}
          kissyTransform={kissyMaleTransform}
          cheeringTransform={cheeringTransform}
          calibrationMode={maleCalibrationMode}
          activeModelIndex={activeMaleModelIndex}
          onSyncCue={setFemaleSyncCue}
        />
      </Suspense>
      <Suspense fallback={null}>
        <BackgroundProposalScene
          talkingGirlTransform={talkingGirlTransform}
          surprisedTransform={surprisedTransform}
          blushingTransform={blushingTransform}
          kissyTransform={kissyTransform}
          goofyRunningTransform={goofyRunningTransform}
          calibrationMode={girlCalibrationMode}
          activeModelIndex={activeGirlModelIndex}
          syncCue={femaleSyncCue}
        />
      </Suspense>
      <Suspense fallback={null}>
        <BackgroundRobots
          thinkingTransform={backgroundRobotThinking}
          tellingSecretTransform={backgroundRobotTellingSecret}
          pushupTransform={backgroundRobotPushup}
          nervousLookAroundTransform={backgroundRobotNervousLookAround}
        />
      </Suspense>
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} />
      </mesh>
      <Sparkles
        count={40}
        scale={4}
        size={1}
        speed={0.3}
        opacity={0.12}
        color="#e8f4ff"
        position={[0, 1, 0]}
      />
      <Effects />
      <ScrollDrivenLaptop
        onScrollChange={onScrollChange}
        onScrollDirectionChange={onScrollDirectionChange}
        testMode={testMode}
        testTransform={testTransform}
        robotPointingBackwords={robotPointingBackwords}
        robotFalling={robotFalling}
        robotWalking={robotWalking}
        robotClimbingToLaptop={robotClimbingToLaptop}
        robotCutelySitting={robotCutelySitting}
        robotStandingToSitting={robotStandingToSitting}
        backgroundRobotArm={backgroundRobotArm}
        manualClimbingSequence={manualClimbingSequence}
        climbingSequenceStep={climbingSequenceStep}
        laptopScale={laptopScale}
        laptopPosition={laptopPosition}
        laptopRotation={laptopRotation}
        laptopScreenScaleX={laptopScreenScaleX}
        laptopScreenScaleY={laptopScreenScaleY}
      />
    </>
  );
}
