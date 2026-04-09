'use client';

import { ScrollControls, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useRef, useState } from 'react';
import * as THREE from 'three';
import Laptop from './Laptop';
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
  laptopScale?: number;
  laptopPosition?: [number, number, number];
  laptopRotation?: [number, number, number];
};

function ScrollDrivenLaptop({
  onScrollChange,
  onScrollDirectionChange,
  testMode = false,
  testTransform,
  robotPointingBackwords = { position: [0, -0.36, 0.49], scale: 0.03 },
  robotFalling = { position: [0, 0.3, 0.49], scale: 0.03 },
  robotWalking = { position: [0.004, -0.36, 0.56], scale: 0.03 },
  robotClimbingToLaptop = { position: [0.004, -0.36, 0.56], scale: 0.03 },
  robotCutelySitting = { position: [0.004, -0.36, 0.56], scale: 0.03 },
  robotStandingToSitting = { position: [0.004, -0.36, 0.56], scale: 0.03 },
  laptopScale = 0.04,
  laptopPosition = [0.01, -0.43, -0.42],
  laptopRotation = [0, -0.01, 0],
}: ScrollDrivenLaptopProps) {
  const scroll = useScroll();
  const [lidAngle, setLidAngle] = useState(-1.59);
  const lastReportedOffset = useRef(-1);
  const previousOffset = useRef(0);
  const previousLidAngle = useRef(-1.59);

  useFrame(() => {
    const motionOffset = THREE.MathUtils.clamp(scroll.offset * SCROLL_MOTION_MAX, 0, SCROLL_MOTION_MAX);
    const normalized = THREE.MathUtils.clamp(motionOffset / SCROLL_MOTION_MAX, 0, 1);
    const nextAngle = THREE.MathUtils.lerp(-1.59, -0.23, normalized);
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
      />
      <Suspense fallback={null}>
        <RobotHero
          fallingTransform={robotFalling}
          pointingTransform={robotPointingBackwords}
          runningTransform={robotWalking}
          climbingToLaptopTransform={robotClimbingToLaptop}
          cutelySittingTransform={robotCutelySitting}
          standingToSittingTransform={robotStandingToSitting}
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
  laptopScale?: number;
  laptopPosition?: [number, number, number];
  laptopRotation?: [number, number, number];
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
  laptopScale,
  laptopPosition,
  laptopRotation,
}: LaptopSceneProps) {
  return (
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
        laptopScale={laptopScale}
        laptopPosition={laptopPosition}
        laptopRotation={laptopRotation}
      />
    </ScrollControls>
  );
}
