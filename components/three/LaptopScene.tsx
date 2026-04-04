'use client';

import { ScrollControls, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import Laptop from './Laptop';

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
};

function ScrollDrivenLaptop({
  onScrollChange,
  onScrollDirectionChange,
  testMode = false,
  testTransform,
}: ScrollDrivenLaptopProps) {
  const scroll = useScroll();
  const [lidAngle, setLidAngle] = useState(0);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const lastReportedOffset = useRef(-1);
  const previousOffset = useRef(0);

  useFrame(() => {
    const motionOffset = THREE.MathUtils.clamp(scroll.offset * SCROLL_MOTION_MAX, 0, SCROLL_MOTION_MAX);
    const normalized = THREE.MathUtils.clamp(motionOffset / SCROLL_MOTION_MAX, 0, 1);
    const nextAngle = THREE.MathUtils.lerp(-1.59, -0.23, normalized);
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
    <Laptop
      lidAngle={lidAngle}
      verticalOffset={verticalOffset}
      position={testTransform?.position}
      rotationY={testTransform?.rotationY}
      modelScale={testTransform?.scale}
    />
  );
}

type LaptopSceneProps = {
  onScrollChange?: (offset: number) => void;
  onScrollDirectionChange?: (direction: 'up' | 'down' | 'idle', delta: number) => void;
  testMode?: boolean;
  testTransform?: LaptopTestTransform;
};

export default function LaptopScene({
  onScrollChange,
  onScrollDirectionChange,
  testMode,
  testTransform,
}: LaptopSceneProps) {
  return (
    <ScrollControls pages={4} damping={0.3}>
      <ScrollDrivenLaptop
        onScrollChange={onScrollChange}
        onScrollDirectionChange={onScrollDirectionChange}
        testMode={testMode}
        testTransform={testTransform}
      />
    </ScrollControls>
  );
}
