'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import LaptopScene from './LaptopScene';

type CameraPOVSyncProps = {
  position: [number, number, number];
  fov: number;
};

type RobotTransform = {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
};

type GirlModelIndex = 0 | 1 | 2 | 3 | 4;
type MaleModelIndex = 0 | 1 | 2 | 3 | 4 | 5;

function CameraPOVSync({ position, fov }: CameraPOVSyncProps) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    (camera as THREE.PerspectiveCamera).fov = fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera, position, fov]);

  return null;
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 3]} intensity={1.2} castShadow />
    </>
  );
}

function WireframeFloors() {
  return (
    <>
      <gridHelper args={[30, 60, '#d4d4d4', '#e5e5e5']} position={[0, -1.2, 0]} />
      <gridHelper args={[60, 80, '#d4d4d4', '#e5e5e5']} position={[0, -2.4, -8]} />
      <gridHelper args={[100, 120, '#d4d4d4', '#e5e5e5']} position={[0, -3.8, -20]} />
      <gridHelper args={[160, 160, '#d4d4d4', '#e5e5e5']} position={[0, -5.5, -40]} />
    </>
  );
}

type SceneContentProps = {
  robotPointingBackwords: RobotTransform;
  robotFalling: RobotTransform;
  robotWalking: RobotTransform;
  robotClimbingToLaptop: RobotTransform;
  robotCutelySitting: RobotTransform;
  robotStandingToSitting: RobotTransform;
  backgroundRobotArm: RobotTransform;
  backgroundRobotThinking: RobotTransform;
  backgroundRobotTellingSecret: RobotTransform;
  backgroundRobotPushup: RobotTransform;
  backgroundRobotNervousLookAround: RobotTransform;
  talkingGirl: RobotTransform;
  surprisedGirl: RobotTransform;
  blushingGirl: RobotTransform;
  kissyGirl: RobotTransform;
  goofyRunningGirl: RobotTransform;
  talkingBoy: RobotTransform;
  kneelingDownBoy: RobotTransform;
  kneelingDownProposeBoy: RobotTransform;
  sittingToStandingBoy: RobotTransform;
  kissyBoy: RobotTransform;
  cheeringBoy: RobotTransform;
  manualClimbingSequence?: boolean;
  climbingSequenceStep?: number;
  laptopScale: number;
  laptopPosition: [number, number, number];
  laptopRotation: [number, number, number];
  laptopScreenScaleX: number;
  laptopScreenScaleY: number;
  cameraPosition: [number, number, number];
  cameraFov: number;
};

function SceneContent({
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
  talkingGirl,
  surprisedGirl,
  blushingGirl,
  kissyGirl,
  goofyRunningGirl,
  talkingBoy,
  kneelingDownBoy,
  kneelingDownProposeBoy,
  sittingToStandingBoy,
  kissyBoy,
  cheeringBoy,
  manualClimbingSequence,
  climbingSequenceStep,
  laptopScale,
  laptopPosition,
  laptopRotation,
  laptopScreenScaleX,
  laptopScreenScaleY,
  cameraPosition,
  cameraFov,

}: SceneContentProps) {
  return (
    <>
      <Lighting />
      <WireframeFloors />
      <LaptopScene
        robotPointingBackwords={robotPointingBackwords}
        robotFalling={robotFalling}
        robotWalking={robotWalking}
        robotClimbingToLaptop={robotClimbingToLaptop}
        robotCutelySitting={robotCutelySitting}
        robotStandingToSitting={robotStandingToSitting}
        backgroundRobotArm={backgroundRobotArm}
        backgroundRobotThinking={backgroundRobotThinking}
        backgroundRobotTellingSecret={backgroundRobotTellingSecret}
        backgroundRobotPushup={backgroundRobotPushup}
        backgroundRobotNervousLookAround={backgroundRobotNervousLookAround}
        talkingGirlTransform={talkingGirl}
        surprisedTransform={surprisedGirl}
        blushingTransform={blushingGirl}
        kissyTransform={kissyGirl}
        goofyRunningTransform={goofyRunningGirl}
        talkingBoyTransform={talkingBoy}
        kneelingDownTransform={kneelingDownBoy}
        kneelingDownProposeTransform={kneelingDownProposeBoy}
        sittingToStandingTransform={sittingToStandingBoy}
        kissyMaleTransform={kissyBoy}
        cheeringTransform={cheeringBoy}
        manualClimbingSequence={manualClimbingSequence}
        climbingSequenceStep={climbingSequenceStep}
        laptopScale={laptopScale}
        laptopPosition={laptopPosition}
        laptopRotation={laptopRotation}
        laptopScreenScaleX={laptopScreenScaleX}
        laptopScreenScaleY={laptopScreenScaleY}

      />
      <CameraPOVSync position={cameraPosition} fov={cameraFov} />
    </>
  );
}

function LoadingFallback() {
  return <div className="h-screen w-screen bg-white" />;
}

type RobotControlPanelProps = {
  label: string;
  value: RobotTransform;
  onChange: (next: RobotTransform) => void;
};

function RobotControlPanel({ label, value, onChange }: RobotControlPanelProps) {
  return (
    <>
      <p className="mt-3 font-semibold">{label}</p>
      <p className="mt-1">Scale: {value.scale.toFixed(3)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={0.003}
        max={0.2}
        step={0.001}
        value={value.scale}
        onChange={(event) =>
          onChange({
            ...value,
            scale: Number(event.target.value),
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={0.003}
        max={0.2}
        step={0.001}
        value={value.scale}
        onChange={(event) =>
          onChange({
            ...value,
            scale: Number(event.target.value),
          })
        }
      />

      <p className="mt-2">X: {value.position[0].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-8}
        max={8}
        step={0.01}
        value={value.position[0]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [Number(event.target.value), value.position[1], value.position[2]],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-8}
        max={8}
        step={0.01}
        value={value.position[0]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [Number(event.target.value), value.position[1], value.position[2]],
          })
        }
      />

      <p className="mt-2">Y: {value.position[1].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-5}
        max={6}
        step={0.01}
        value={value.position[1]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [value.position[0], Number(event.target.value), value.position[2]],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-5}
        max={6}
        step={0.01}
        value={value.position[1]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [value.position[0], Number(event.target.value), value.position[2]],
          })
        }
      />

      <p className="mt-2">Z: {value.position[2].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-8}
        max={4}
        step={0.01}
        value={value.position[2]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [value.position[0], value.position[1], Number(event.target.value)],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-8}
        max={4}
        step={0.01}
        value={value.position[2]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [value.position[0], value.position[1], Number(event.target.value)],
          })
        }
      />

      <p className="mt-2">Rot X: {value.rotation[0].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[0]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [Number(event.target.value), value.rotation[1], value.rotation[2]],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[0]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [Number(event.target.value), value.rotation[1], value.rotation[2]],
          })
        }
      />

      <p className="mt-2">Rot Y: {value.rotation[1].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[1]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [value.rotation[0], Number(event.target.value), value.rotation[2]],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[1]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [value.rotation[0], Number(event.target.value), value.rotation[2]],
          })
        }
      />

      <p className="mt-2">Rot Z: {value.rotation[2].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[2]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [value.rotation[0], value.rotation[1], Number(event.target.value)],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[2]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [value.rotation[0], value.rotation[1], Number(event.target.value)],
          })
        }
      />
    </>
  );
}

type BackgroundRobotArmControlPanelProps = {
  value: RobotTransform;
  onChange: (next: RobotTransform) => void;
};

function BackgroundRobotArmControlPanel({ value, onChange }: BackgroundRobotArmControlPanelProps) {
  return (
    <>
      <p className="mt-3 font-semibold">BackgroundRobotArm</p>
      <p className="mt-1">Scale: {value.scale.toFixed(4)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={0}
        max={0.1}
        step={0.0001}
        value={value.scale}
        onChange={(event) =>
          onChange({
            ...value,
            scale: Number(event.target.value),
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={0}
        max={0.1}
        step={0.0001}
        value={value.scale}
        onChange={(event) =>
          onChange({
            ...value,
            scale: Number(event.target.value),
          })
        }
      />

      <p className="mt-2">X: {value.position[0].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-20}
        max={20}
        step={0.01}
        value={value.position[0]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [Number(event.target.value), value.position[1], value.position[2]],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-20}
        max={20}
        step={0.01}
        value={value.position[0]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [Number(event.target.value), value.position[1], value.position[2]],
          })
        }
      />

      <p className="mt-2">Y: {value.position[1].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-20}
        max={20}
        step={0.01}
        value={value.position[1]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [value.position[0], Number(event.target.value), value.position[2]],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-20}
        max={20}
        step={0.01}
        value={value.position[1]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [value.position[0], Number(event.target.value), value.position[2]],
          })
        }
      />

      <p className="mt-2">Z: {value.position[2].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-20}
        max={20}
        step={0.01}
        value={value.position[2]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [value.position[0], value.position[1], Number(event.target.value)],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-20}
        max={20}
        step={0.01}
        value={value.position[2]}
        onChange={(event) =>
          onChange({
            ...value,
            position: [value.position[0], value.position[1], Number(event.target.value)],
          })
        }
      />

      <p className="mt-2">Rot X: {value.rotation[0].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[0]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [Number(event.target.value), value.rotation[1], value.rotation[2]],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[0]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [Number(event.target.value), value.rotation[1], value.rotation[2]],
          })
        }
      />

      <p className="mt-2">Rot Y: {value.rotation[1].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[1]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [value.rotation[0], Number(event.target.value), value.rotation[2]],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[1]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [value.rotation[0], Number(event.target.value), value.rotation[2]],
          })
        }
      />

      <p className="mt-2">Rot Z: {value.rotation[2].toFixed(2)}</p>
      <input
        className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
        type="number"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[2]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [value.rotation[0], value.rotation[1], Number(event.target.value)],
          })
        }
      />
      <input
        className="mt-1 w-44"
        type="range"
        min={-6.28}
        max={6.28}
        step={0.01}
        value={value.rotation[2]}
        onChange={(event) =>
          onChange({
            ...value,
            rotation: [value.rotation[0], value.rotation[1], Number(event.target.value)],
          })
        }
      />
    </>
  );
}

type SceneProps = Record<string, never>;

export default function Scene({}: SceneProps) {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const [robotPointingBackwords, setRobotPointingBackwords] = useState<RobotTransform>({
    position: [0, -0.36, 0.56],
    scale: 0.036,
    rotation: [0, 0, 0],
  });
  const [robotFalling, setRobotFalling] = useState<RobotTransform>({
    position: [0, 0.3, 0.49],
    scale: 0.03,
    rotation: [0, 0, 0],
  });
  const [robotWalking, setRobotWalking] = useState<RobotTransform>({
    position: [0, -0.36, 0.56],
    scale: 0.035,
    rotation: [0, 0, 0],
  });
  const [robotClimbingToLaptop, setRobotClimbingToLaptop] = useState<RobotTransform>({
    position: [0.46, 0.26, -0.73],
    scale: 0.087,
    rotation: [0, 0, 0],
  });
  const [robotCutelySitting, setRobotCutelySitting] = useState<RobotTransform>({
    position: [0.46, 0.33, -0.69],
    scale: 0.087,
    rotation: [0, 0, 0],
  });
  const [robotStandingToSitting, setRobotStandingToSitting] = useState<RobotTransform>({
    position: [0.46, 0.35, -0.68],
    scale: 0.087,
    rotation: [0, 0, 0],
  });
  const [backgroundRobotArm, setBackgroundRobotArm] = useState<RobotTransform>({
    position: [0.9, -0.36, -0.44],
    scale: 0.0003,
    rotation: [0, 0, 0],
  });
  const [backgroundRobotThinking, setBackgroundRobotThinking] = useState<RobotTransform>({
    position: [0.66, -0.36, 0.08],
    scale: 0.053,
    rotation: [0, -3.14, 0],
  });
  const [backgroundRobotTellingSecret, setBackgroundRobotTellingSecret] = useState<RobotTransform>({
    position: [0.63, -0.36, 0],
    scale: 0.053,
    rotation: [0, -4.14, 0],
  });
  const [backgroundRobotPushup, setBackgroundRobotPushup] = useState<RobotTransform>({
    position: [-0.29, -0.36, 0.56],
    scale: 0.035,
    rotation: [0, 1.88, 0],
  });
  const [backgroundRobotNervousLookAround, setBackgroundRobotNervousLookAround] = useState<RobotTransform>({
    position: [-0.25, -0.36, 0.52],
    scale: 0.035,
    rotation: [0, 0, 0],
  });
  const [talkingGirl, setTalkingGirl] = useState<RobotTransform>({
    position: [-0.67, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, 1.11, 0],
  });
  const [surprisedGirl, setSurprisedGirl] = useState<RobotTransform>({
    position: [-0.67, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, 1.69, 0],
  });
  const [blushingGirl, setBlushingGirl] = useState<RobotTransform>({
    position: [-0.67, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, 1.69, 0],
  });
  const [kissyGirl, setKissyGirl] = useState<RobotTransform>({
    position: [-0.67, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, 1.69, 0],
  });
  const [goofyRunningGirl, setGoofyRunningGirl] = useState<RobotTransform>({
    position: [-0.67, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, -1.69, 0],
  });
  const [activeGirlModelIndex, setActiveGirlModelIndex] = useState<GirlModelIndex>(0);
  const [talkingBoy, setTalkingBoy] = useState<RobotTransform>({
    position: [-0.61, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, -1.11, 0],
  });
  const [kneelingDownBoy, setKneelingDownBoy] = useState<RobotTransform>({
    position: [-0.61, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, -1.11, 0],
  });
  const [kneelingDownProposeBoy, setKneelingDownProposeBoy] = useState<RobotTransform>({
    position: [-0.61, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, -1.11, 0],
  });
  const [sittingToStandingBoy, setSittingToStandingBoy] = useState<RobotTransform>({
    position: [-0.61, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, -1.11, 0],
  });
  const [kissyBoy, setKissyBoy] = useState<RobotTransform>({
    position: [-0.61, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, -1.11, 0],
  });
  const [cheeringBoy, setCheeringBoy] = useState<RobotTransform>({
    position: [-0.61, -0.36, 0.14],
    scale: 0.053,
    rotation: [0, -1.11, 0],
  });
  const [activeMaleModelIndex, setActiveMaleModelIndex] = useState<MaleModelIndex>(0);
  const [controlPanelPos, setControlPanelPos] = useState({ x: 16, y: 16 });
  const [laptopScale, setLaptopScale] = useState(0.04);
  const [laptopPosition, setLaptopPosition] = useState<[number, number, number]>([0.01, -0.43, -0.42]);
  const [laptopRotation, setLaptopRotation] = useState<[number, number, number]>([0, -0.01, 0]);
  const [laptopScreenScaleX, setLaptopScreenScaleX] = useState(0.985);
  const [laptopScreenScaleY, setLaptopScreenScaleY] = useState(0.985);
  const [screenOverlayWidth, setScreenOverlayWidth] = useState(407);
  const [screenOverlayHeight, setScreenOverlayHeight] = useState(260);
  const [screenOverlayOffsetX, setScreenOverlayOffsetX] = useState(-2);
  const [screenOverlayOffsetY, setScreenOverlayOffsetY] = useState(-280);
  const [screenOverlayOffsetZ, setScreenOverlayOffsetZ] = useState(0);
  const [screenOverlayScale, setScreenOverlayScale] = useState(2);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, -0.25, 1.4]);
  const [cameraFov, setCameraFov] = useState(40);



  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      setControlPanelPos({
        x: Math.max(8, event.clientX - dragOffsetRef.current.x),
        y: Math.max(8, event.clientY - dragOffsetRef.current.y),
      });
    };

    const handlePointerUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--laptop-screen-width', `${screenOverlayWidth}px`);
    root.style.setProperty('--laptop-screen-height', `${screenOverlayHeight}px`);
    root.style.setProperty('--laptop-screen-offset-x', `${screenOverlayOffsetX}px`);
    root.style.setProperty('--laptop-screen-offset-y', `${screenOverlayOffsetY}px`);
    root.style.setProperty('--laptop-screen-offset-z', `${screenOverlayOffsetZ}px`);
    root.style.setProperty('--laptop-screen-scale', `${screenOverlayScale}`);
  }, [
    screenOverlayWidth,
    screenOverlayHeight,
    screenOverlayOffsetX,
    screenOverlayOffsetY,
    screenOverlayOffsetZ,
    screenOverlayScale,
  ]);

  const activeGirlModel =
    activeGirlModelIndex === 0
      ? { label: 'talking_girl.glb', value: talkingGirl, setValue: setTalkingGirl }
      : activeGirlModelIndex === 1
        ? { label: 'surprised.glb', value: surprisedGirl, setValue: setSurprisedGirl }
        : activeGirlModelIndex === 2
          ? { label: 'blushing.glb', value: blushingGirl, setValue: setBlushingGirl }
          : activeGirlModelIndex === 3
            ? { label: 'kissy.glb', value: kissyGirl, setValue: setKissyGirl }
            : { label: 'goofy_running.glb', value: goofyRunningGirl, setValue: setGoofyRunningGirl };


  const activeMaleModel =
    activeMaleModelIndex === 0
      ? { label: 'talking_boy.glb', value: talkingBoy, setValue: setTalkingBoy }
      : activeMaleModelIndex === 1
        ? { label: 'kneeling_down.glb', value: kneelingDownBoy, setValue: setKneelingDownBoy }
        : activeMaleModelIndex === 2
          ? {
              label: 'kneeling_down_propose.glb',
              value: kneelingDownProposeBoy,
              setValue: setKneelingDownProposeBoy,
            }
          : activeMaleModelIndex === 3
            ? {
                label: 'sitting_to_standing.glb',
                value: sittingToStandingBoy,
                setValue: setSittingToStandingBoy,
              }
            : activeMaleModelIndex === 4
              ? { label: 'kissy.glb', value: kissyBoy, setValue: setKissyBoy }
              : { label: 'cheering2.glb', value: cheeringBoy, setValue: setCheeringBoy };

  return (
    <div ref={canvasWrapRef} className="pointer-events-none fixed left-0 top-0 z-0 h-screen w-screen">
      <div
        className="pointer-events-auto fixed z-50 max-h-[92vh] overflow-y-auto rounded-lg border border-neutral-300 bg-white/95 p-3 text-xs text-neutral-800 shadow-sm"
        style={{ left: controlPanelPos.x, top: controlPanelPos.y }}
      >
        <div
          className="-mx-3 -mt-3 mb-2 cursor-move rounded-t-lg border-b border-neutral-200 bg-neutral-50 px-3 py-2 font-semibold"
          onPointerDown={(event) => {
            draggingRef.current = true;
            dragOffsetRef.current = {
              x: event.clientX - controlPanelPos.x,
              y: event.clientY - controlPanelPos.y,
            };
          }}
        >
          Movable Slider Tab
        </div>
        <p className="font-semibold">Robots</p>
        <RobotControlPanel label="RobotFalling" value={robotFalling} onChange={setRobotFalling} />
        <RobotControlPanel
          label="RobotPointingBackwords"
          value={robotPointingBackwords}
          onChange={setRobotPointingBackwords}
        />
        <RobotControlPanel label="RobotWalkingTexting" value={robotWalking} onChange={setRobotWalking} />
        <RobotControlPanel
          label="RobotClimbingToLaptop"
          value={robotClimbingToLaptop}
          onChange={setRobotClimbingToLaptop}
        />
        <RobotControlPanel label="RobotCutelySitting" value={robotCutelySitting} onChange={setRobotCutelySitting} />
        <RobotControlPanel
          label="RobotStandingToSitting"
          value={robotStandingToSitting}
          onChange={setRobotStandingToSitting}
        />
        <RobotControlPanel
          label="RobotThinking"
          value={backgroundRobotThinking}
          onChange={setBackgroundRobotThinking}
        />
        <RobotControlPanel
          label="RobotTellingSecret"
          value={backgroundRobotTellingSecret}
          onChange={setBackgroundRobotTellingSecret}
        />
        <RobotControlPanel label="RobotPushup" value={backgroundRobotPushup} onChange={setBackgroundRobotPushup} />
        <RobotControlPanel
          label="RobotNervousLookAround"
          value={backgroundRobotNervousLookAround}
          onChange={setBackgroundRobotNervousLookAround}
        />
        <BackgroundRobotArmControlPanel value={backgroundRobotArm} onChange={setBackgroundRobotArm} />

        <div className="mt-4 border-t border-neutral-200 pt-3">
          <p className="font-semibold">Girl Sequence Precision</p>
          <p className="mt-1">Current: {activeGirlModel.label} (auto sequence)</p>
          <RobotControlPanel
            label={activeGirlModel.label}
            value={activeGirlModel.value}
            onChange={activeGirlModel.setValue}
          />
        </div>

        <div className="mt-4 border-t border-neutral-200 pt-3">
          <p className="font-semibold">Male Sequence Precision</p>
          <p className="mt-1">Current: {activeMaleModel.label} (auto sequence)</p>
          <RobotControlPanel
            label={activeMaleModel.label}
            value={activeMaleModel.value}
            onChange={activeMaleModel.setValue}
          />
        </div>

        <div className="mt-4 border-t border-neutral-200 pt-3">
          <p className="font-semibold">Laptop Screen Precision</p>

          <p className="mt-2">Length (X): {laptopScreenScaleX.toFixed(3)}</p>
          <input
            className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
            type="number"
            min={0.7}
            max={1.1}
            step={0.001}
            value={laptopScreenScaleX}
            onChange={(event) => setLaptopScreenScaleX(Number(event.target.value))}
          />
          <input
            className="mt-1 w-44"
            type="range"
            min={0.7}
            max={1.1}
            step={0.001}
            value={laptopScreenScaleX}
            onChange={(event) => setLaptopScreenScaleX(Number(event.target.value))}
          />

          <p className="mt-2">Breadth (Y): {laptopScreenScaleY.toFixed(3)}</p>
          <input
            className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
            type="number"
            min={0.7}
            max={1.1}
            step={0.001}
            value={laptopScreenScaleY}
            onChange={(event) => setLaptopScreenScaleY(Number(event.target.value))}
          />
          <input
            className="mt-1 w-44"
            type="range"
            min={0.7}
            max={1.1}
            step={0.001}
            value={laptopScreenScaleY}
            onChange={(event) => setLaptopScreenScaleY(Number(event.target.value))}
          />

          <div className="mt-3 border-t border-neutral-200 pt-3">
            <p className="font-semibold">Laptop Screen Overlay Precision</p>

            <p className="mt-2">Length (px): {screenOverlayWidth.toFixed(0)}</p>
            <input
              className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
              type="number"
              min={120}
              max={420}
              step={1}
              value={screenOverlayWidth}
              onChange={(event) => setScreenOverlayWidth(Number(event.target.value))}
            />
            <input
              className="mt-1 w-44"
              type="range"
              min={120}
              max={420}
              step={1}
              value={screenOverlayWidth}
              onChange={(event) => setScreenOverlayWidth(Number(event.target.value))}
            />

            <p className="mt-2">Breadth (px): {screenOverlayHeight.toFixed(0)}</p>
            <input
              className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
              type="number"
              min={80}
              max={300}
              step={1}
              value={screenOverlayHeight}
              onChange={(event) => setScreenOverlayHeight(Number(event.target.value))}
            />
            <input
              className="mt-1 w-44"
              type="range"
              min={80}
              max={300}
              step={1}
              value={screenOverlayHeight}
              onChange={(event) => setScreenOverlayHeight(Number(event.target.value))}
            />

            <p className="mt-2">X (px): {screenOverlayOffsetX.toFixed(0)}</p>
            <input
              className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
              type="number"
              min={-200}
              max={200}
              step={1}
              value={screenOverlayOffsetX}
              onChange={(event) => setScreenOverlayOffsetX(Number(event.target.value))}
            />
            <input
              className="mt-1 w-44"
              type="range"
              min={-200}
              max={200}
              step={1}
              value={screenOverlayOffsetX}
              onChange={(event) => setScreenOverlayOffsetX(Number(event.target.value))}
            />

            <p className="mt-2">Y (px): {screenOverlayOffsetY.toFixed(0)}</p>
            <input
              className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
              type="number"
              min={-200}
              max={200}
              step={1}
              value={screenOverlayOffsetY}
              onChange={(event) => setScreenOverlayOffsetY(Number(event.target.value))}
            />
            <input
              className="mt-1 w-44"
              type="range"
              min={-200}
              max={200}
              step={1}
              value={screenOverlayOffsetY}
              onChange={(event) => setScreenOverlayOffsetY(Number(event.target.value))}
            />

            <p className="mt-2">Z (px): {screenOverlayOffsetZ.toFixed(0)}</p>
            <input
              className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
              type="number"
              min={-200}
              max={200}
              step={1}
              value={screenOverlayOffsetZ}
              onChange={(event) => setScreenOverlayOffsetZ(Number(event.target.value))}
            />
            <input
              className="mt-1 w-44"
              type="range"
              min={-200}
              max={200}
              step={1}
              value={screenOverlayOffsetZ}
              onChange={(event) => setScreenOverlayOffsetZ(Number(event.target.value))}
            />

            <p className="mt-2">Scale: {screenOverlayScale.toFixed(2)}</p>
            <input
              className="mt-1 w-20 rounded border border-neutral-300 px-1 py-0.5"
              type="number"
              min={0.5}
              max={2}
              step={0.01}
              value={screenOverlayScale}
              onChange={(event) => setScreenOverlayScale(Number(event.target.value))}
            />
            <input
              className="mt-1 w-44"
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={screenOverlayScale}
              onChange={(event) => setScreenOverlayScale(Number(event.target.value))}
            />
          </div>
        </div>
      </div>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          className="h-screen w-screen"
          style={{ pointerEvents: 'none' }}
          shadows
          camera={{ fov: cameraFov, position: cameraPosition, near: 0.1, far: 100 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#ffffff', 1);
          }}
        >
          <SceneContent
            robotPointingBackwords={robotPointingBackwords}
            robotFalling={robotFalling}
            robotWalking={robotWalking}
            robotClimbingToLaptop={robotClimbingToLaptop}
            robotCutelySitting={robotCutelySitting}
            robotStandingToSitting={robotStandingToSitting}
            backgroundRobotArm={backgroundRobotArm}
            backgroundRobotThinking={backgroundRobotThinking}
            backgroundRobotTellingSecret={backgroundRobotTellingSecret}
            backgroundRobotPushup={backgroundRobotPushup}
            backgroundRobotNervousLookAround={backgroundRobotNervousLookAround}
            talkingGirl={talkingGirl}
            surprisedGirl={surprisedGirl}
            blushingGirl={blushingGirl}
            kissyGirl={kissyGirl}
            goofyRunningGirl={goofyRunningGirl}
            talkingBoy={talkingBoy}
            kneelingDownBoy={kneelingDownBoy}
            kneelingDownProposeBoy={kneelingDownProposeBoy}
            sittingToStandingBoy={sittingToStandingBoy}
            kissyBoy={kissyBoy}
            cheeringBoy={cheeringBoy}
            laptopScale={laptopScale}
            laptopPosition={laptopPosition}
            laptopRotation={laptopRotation}
            laptopScreenScaleX={laptopScreenScaleX}
            laptopScreenScaleY={laptopScreenScaleY}
            cameraPosition={cameraPosition}
            cameraFov={cameraFov}

          />
        </Canvas>
      </Suspense>
    </div>
  );
}
