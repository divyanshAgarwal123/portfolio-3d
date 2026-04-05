'use client';

import { ScrollControls, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import Laptop from './Laptop';
import { RobotClapping, RobotIdle, RobotPointing, RobotRunning, RobotWaving } from './Robot';

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
  robotIdle?: RobotTransform;
  robotRunning?: RobotTransform;
  robotWaving?: RobotTransform;
  robotPointing?: RobotTransform;
  robotClapping?: RobotTransform;
  laptopScale?: number;
  laptopPosition?: [number, number, number];
  laptopRotation?: [number, number, number];
};

function ScrollDrivenLaptop({
  onScrollChange,
  onScrollDirectionChange,
  testMode = false,
  testTransform,
  robotIdle = { position: [-1.6, 0.4, -1.2], scale: 0.01 },
  robotRunning = { position: [-0.8, 0.4, -1.2], scale: 0.01 },
  robotWaving = { position: [0, 0.4, -1.2], scale: 0.01 },
  robotPointing = { position: [0.8, 0.4, -1.2], scale: 0.01 },
  robotClapping = { position: [1.6, 0.4, -1.2], scale: 0.01 },
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
      <RobotIdle position={robotIdle.position} scale={robotIdle.scale} />
      <RobotRunning position={robotRunning.position} scale={robotRunning.scale} />
      <RobotWaving position={robotWaving.position} scale={robotWaving.scale} />
      <RobotPointing position={robotPointing.position} scale={robotPointing.scale} />
      <RobotClapping position={robotClapping.position} scale={robotClapping.scale} />
    </>
  );
}

type LaptopSceneProps = {
  onScrollChange?: (offset: number) => void;
  onScrollDirectionChange?: (direction: 'up' | 'down' | 'idle', delta: number) => void;
  testMode?: boolean;
  testTransform?: LaptopTestTransform;
  robotIdle?: RobotTransform;
  robotRunning?: RobotTransform;
  robotWaving?: RobotTransform;
  robotPointing?: RobotTransform;
  robotClapping?: RobotTransform;
  laptopScale?: number;
  laptopPosition?: [number, number, number];
  laptopRotation?: [number, number, number];
};

export default function LaptopScene({
  onScrollChange,
  onScrollDirectionChange,
  testMode,
  testTransform,
  robotIdle,
  robotRunning,
  robotWaving,
  robotPointing,
  robotClapping,
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
        robotIdle={robotIdle}
        robotRunning={robotRunning}
        robotWaving={robotWaving}
        robotPointing={robotPointing}
        robotClapping={robotClapping}
        laptopScale={laptopScale}
        laptopPosition={laptopPosition}
        laptopRotation={laptopRotation}
      />
    </ScrollControls>
  );
}
