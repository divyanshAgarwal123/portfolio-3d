'use client';

import { ScrollControls, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import Laptop from './Laptop';
import Robot from './Robot';

const SCROLL_MOTION_MAX = 0.431;

type LaptopTestTransform = {
  position: [number, number, number];
  rotationY: number;
  scale: number;
  lidAngle: number;
};

type ScrollDrivenLaptopProps = {
  onScrollChange?: (offset: number) => void;
  onScrollDirectionChange?: (direction: 'up' | 'down' | 'idle', delta: number) => void;
  testMode?: boolean;
  testTransform?: LaptopTestTransform;
  robots?: Array<{
    id: string;
    scale: number;
    position: [number, number, number];
    rotationY: number;
    behavior: {
      runStart: number;
      runEnd: number;
      pointStart: number;
      startX: number;
      endX: number;
      y: number;
      z: number;
      runFacingY: number;
      idleFacingY: number;
    };
  }>;
  laptopScale?: number;
  laptopPosition?: [number, number, number];
  laptopRotation?: [number, number, number];
  lidClosedAngle?: number;
  lidOpenAngle?: number;
  lidScrollEnd?: number;
};

function ScrollDrivenLaptop({
  onScrollChange,
  onScrollDirectionChange,
  testMode = false,
  testTransform,
  robots = [],
  laptopScale = 0.04,
  laptopPosition = [0.01, -0.43, -0.42],
  laptopRotation = [0, -0.01, 0],
  lidClosedAngle = -1.59,
  lidOpenAngle = -0.23,
  lidScrollEnd = 0.431,
}: ScrollDrivenLaptopProps) {
  const scroll = useScroll();
  const [lidAngle, setLidAngle] = useState(0);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const lastReportedOffset = useRef(-1);
  const previousOffset = useRef(0);

  useFrame(() => {
    const scrollEnd = Math.max(0.001, lidScrollEnd);
    const motionOffset = THREE.MathUtils.clamp(scroll.offset, 0, scrollEnd);
    const normalized = THREE.MathUtils.clamp(motionOffset / scrollEnd, 0, 1);
    const nextAngle = THREE.MathUtils.lerp(lidClosedAngle, lidOpenAngle, normalized);
    setLidAngle(nextAngle);
    setVerticalOffset(0);

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
        verticalOffset={verticalOffset}
        position={laptopPosition}
        rotation={laptopRotation}
        modelScale={laptopScale}
      />
      {robots.map((robot) => (
        <Robot
          key={robot.id}
          scale={robot.scale}
          position={robot.position}
          rotationY={robot.rotationY}
          behavior={robot.behavior}
        />
      ))}
    </>
  );
}

type LaptopSceneProps = {
  onScrollChange?: (offset: number) => void;
  onScrollDirectionChange?: (direction: 'up' | 'down' | 'idle', delta: number) => void;
  testMode?: boolean;
  testTransform?: LaptopTestTransform;
  robots?: Array<{
    id: string;
    scale: number;
    position: [number, number, number];
    rotationY: number;
    behavior: {
      runStart: number;
      runEnd: number;
      pointStart: number;
      startX: number;
      endX: number;
      y: number;
      z: number;
      runFacingY: number;
      idleFacingY: number;
    };
  }>;
  laptopScale?: number;
  laptopPosition?: [number, number, number];
  laptopRotation?: [number, number, number];
  lidClosedAngle?: number;
  lidOpenAngle?: number;
  lidScrollEnd?: number;
};

export default function LaptopScene({
  onScrollChange,
  onScrollDirectionChange,
  testMode,
  testTransform,
  robots,
  laptopScale,
  laptopPosition,
  laptopRotation,
  lidClosedAngle,
  lidOpenAngle,
  lidScrollEnd,
}: LaptopSceneProps) {
  return (
    <ScrollControls pages={4} damping={0.3}>
      <ScrollDrivenLaptop
        onScrollChange={onScrollChange}
        onScrollDirectionChange={onScrollDirectionChange}
        testMode={testMode}
        testTransform={testTransform}
        robots={robots}
        laptopScale={laptopScale}
        laptopPosition={laptopPosition}
        laptopRotation={laptopRotation}
        lidClosedAngle={lidClosedAngle}
        lidOpenAngle={lidOpenAngle}
        lidScrollEnd={lidScrollEnd}
      />
    </ScrollControls>
  );
}
