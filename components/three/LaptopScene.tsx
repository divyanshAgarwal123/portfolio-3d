'use client';

import { ScrollControls, Sparkles, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import BackgroundMaleScene, { type MaleModelIndex } from './BackgroundMaleScene';
import BackgroundProposalScene, { type FemaleSyncCue } from './BackgroundProposalScene';
import BackgroundRobotArm from './BackgroundRobotArm';
import BackgroundRobots from './BackgroundRobots';
import Effects from './Effects';
import Laptop from './Laptop';
import LaptopScreen from './LaptopScreen';
import RobotHero from './RobotHero';

const SCROLL_MOTION_MAX = 0.431;

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
  laptopScreenPosition?: [number, number, number];
  laptopScreenRotation?: [number, number, number];
  laptopScreenScaleZ?: number;
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
  laptopScreenPosition = [0, 0, 0],
  laptopScreenRotation = [0, 0, 0],
  laptopScreenScaleZ = 0.985,
}: ScrollDrivenLaptopProps) {
  const scroll = useScroll();
  const [lidAngle, setLidAngle] = useState(-1.59);
  const [climbingStartReady, setClimbingStartReady] = useState(false);
  const lastReportedOffset = useRef(-1);
  const previousOffset = useRef(0);
  const previousLidAngle = useRef(-1.59);
  const lidOpenDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lidOpenArmedRef = useRef(false);
  const climbingReadyRef = useRef(false);
  const [laptopScene, setLaptopScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    return () => {
      if (lidOpenDelayRef.current) {
        clearTimeout(lidOpenDelayRef.current);
        lidOpenDelayRef.current = null;
      }
    };
  }, []);

  useFrame(() => {
    const motionOffset = THREE.MathUtils.clamp(scroll.offset * SCROLL_MOTION_MAX, 0, SCROLL_MOTION_MAX);
    const normalized = THREE.MathUtils.clamp(motionOffset / SCROLL_MOTION_MAX, 0, 1);
    const nextAngle = THREE.MathUtils.lerp(-1.59, -0.23, normalized);

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

    if (Math.abs(nextAngle - previousLidAngle.current) > 0.0005) {
      previousLidAngle.current = nextAngle;
      setLidAngle(nextAngle);
    }

    if (onScrollDirectionChange) {
      const delta = scroll.offset - previousOffset.current;
      const direction = delta > 0.0005 ? 'down' : delta < -0.0005 ? 'up' : 'idle';
      onScrollDirectionChange(direction, delta);
      previousOffset.current = scroll.offset;
    }

    if (onScrollChange) {
      const roundedOffset = Number(motionOffset.toFixed(3));
      if (roundedOffset !== lastReportedOffset.current) {
        lastReportedOffset.current = roundedOffset;
        onScrollChange(roundedOffset);
      }
    }
  });

  return (
    <>
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
        overlayPosition={laptopScreenPosition}
        overlayRotation={laptopScreenRotation}
        overlayScaleZ={laptopScreenScaleZ}
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
    </>
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
  laptopScreenPosition?: [number, number, number];
  laptopScreenRotation?: [number, number, number];
  laptopScreenScaleZ?: number;
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
  laptopScreenPosition,
  laptopScreenRotation,
  laptopScreenScaleZ,
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
      <ScrollControls pages={4} damping={0.3}>
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
          laptopScreenPosition={laptopScreenPosition}
          laptopScreenRotation={laptopScreenRotation}
          laptopScreenScaleZ={laptopScreenScaleZ}
        />
      </ScrollControls>
    </>
  );
}
