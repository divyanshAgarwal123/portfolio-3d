'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
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

function CameraPOVSync({ position, fov }: CameraPOVSyncProps) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.fov = fov;
    camera.updateProjectionMatrix();
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
  celebrationRobotCheering: RobotTransform;
  celebrationRobotCheering2: RobotTransform;
  celebrationRobotClapping: RobotTransform;
  celebrationRobotCrazyDancing: RobotTransform;
  celebrationRobotExcited: RobotTransform;
  celebrationRobotRallying: RobotTransform;
  manualClimbingSequence?: boolean;
  climbingSequenceStep?: number;
  laptopScale: number;
  laptopPosition: [number, number, number];
  laptopRotation: [number, number, number];
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
  celebrationRobotCheering,
  celebrationRobotCheering2,
  celebrationRobotClapping,
  celebrationRobotCrazyDancing,
  celebrationRobotExcited,
  celebrationRobotRallying,
  manualClimbingSequence,
  climbingSequenceStep,
  laptopScale,
  laptopPosition,
  laptopRotation,
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
        celebrationRobotCheering={celebrationRobotCheering}
        celebrationRobotCheering2={celebrationRobotCheering2}
        celebrationRobotClapping={celebrationRobotClapping}
        celebrationRobotCrazyDancing={celebrationRobotCrazyDancing}
        celebrationRobotExcited={celebrationRobotExcited}
        celebrationRobotRallying={celebrationRobotRallying}
        manualClimbingSequence={manualClimbingSequence}
        climbingSequenceStep={climbingSequenceStep}
        laptopScale={laptopScale}
        laptopPosition={laptopPosition}
        laptopRotation={laptopRotation}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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
        step={0.001}
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

export default function Scene() {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const controlPanelRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [panelPosition, setPanelPosition] = useState({ x: 16, y: 16 });
  const [isPanelDragging, setIsPanelDragging] = useState(false);
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
  const [celebrationRobotCheering, setCelebrationRobotCheering] = useState<RobotTransform>({
    position: [0, -0.36, 0.56],
    scale: 0.03,
    rotation: [0, 0, 0],
  });
  const [celebrationRobotCheering2, setCelebrationRobotCheering2] = useState<RobotTransform>({
    position: [0, -0.36, 0.56],
    scale: 0.03,
    rotation: [0, 0, 0],
  });
  const [celebrationRobotClapping, setCelebrationRobotClapping] = useState<RobotTransform>({
    position: [0, -0.36, 0.56],
    scale: 0.03,
    rotation: [0, 0, 0],
  });
  const [celebrationRobotCrazyDancing, setCelebrationRobotCrazyDancing] = useState<RobotTransform>({
    position: [0, -0.36, 0.56],
    scale: 0.03,
    rotation: [0, 0, 0],
  });
  const [celebrationRobotExcited, setCelebrationRobotExcited] = useState<RobotTransform>({
    position: [0, -0.36, 0.56],
    scale: 0.03,
    rotation: [0, 0, 0],
  });
  const [celebrationRobotRallying, setCelebrationRobotRallying] = useState<RobotTransform>({
    position: [0, -0.36, 0.56],
    scale: 0.03,
    rotation: [0, 0, 0],
  });
  const [laptopScale, setLaptopScale] = useState(0.04);
  const [laptopPosition, setLaptopPosition] = useState<[number, number, number]>([0.01, -0.43, -0.42]);
  const [laptopRotation, setLaptopRotation] = useState<[number, number, number]>([0, -0.01, 0]);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, -0.25, 1.4]);
  const [cameraFov, setCameraFov] = useState(40);

  const startPanelDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    dragOffsetRef.current = {
      x: event.clientX - panelPosition.x,
      y: event.clientY - panelPosition.y,
    };
    setIsPanelDragging(true);
  };

  useEffect(() => {
    if (!canvasWrapRef.current) return;
    canvasWrapRef.current.style.opacity = '0';

    canvasWrapRef.current.style.opacity = '1';
  }, []);

  useEffect(() => {
    if (!isPanelDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const panelWidth = controlPanelRef.current?.offsetWidth ?? 320;
      const panelHeight = controlPanelRef.current?.offsetHeight ?? 320;
      const nextX = event.clientX - dragOffsetRef.current.x;
      const nextY = event.clientY - dragOffsetRef.current.y;
      const clampedX = Math.min(Math.max(nextX, 0), Math.max(window.innerWidth - panelWidth, 0));
      const clampedY = Math.min(Math.max(nextY, 0), Math.max(window.innerHeight - panelHeight, 0));

      setPanelPosition({ x: clampedX, y: clampedY });
    };

    const handlePointerUp = () => {
      setIsPanelDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.userSelect = '';
    };
  }, [isPanelDragging]);

  return (
    <div ref={canvasWrapRef} className="fixed left-0 top-0 h-screen w-screen" style={{ opacity: 0 }}>
      <div
        ref={controlPanelRef}
        className="pointer-events-auto fixed z-50 max-h-[92vh] overflow-y-auto rounded-lg border border-neutral-300 bg-white/95 p-3 text-xs text-neutral-800 shadow-sm"
        style={{ left: `${panelPosition.x}px`, top: `${panelPosition.y}px` }}
      >
        <div
          className={`-mx-3 -mt-3 mb-2 cursor-move select-none rounded-t-lg border-b border-neutral-300 px-3 py-2 font-semibold ${isPanelDragging ? 'bg-neutral-200' : 'bg-neutral-100'}`}
          onPointerDown={startPanelDrag}
        >
          Robots (drag me)
        </div>
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
        <RobotControlPanel
          label="RobotCheering"
          value={celebrationRobotCheering}
          onChange={setCelebrationRobotCheering}
        />
        <RobotControlPanel
          label="RobotCheering2"
          value={celebrationRobotCheering2}
          onChange={setCelebrationRobotCheering2}
        />
        <RobotControlPanel
          label="RobotClappingCelebration"
          value={celebrationRobotClapping}
          onChange={setCelebrationRobotClapping}
        />
        <RobotControlPanel
          label="RobotCrazyDancing"
          value={celebrationRobotCrazyDancing}
          onChange={setCelebrationRobotCrazyDancing}
        />
        <RobotControlPanel
          label="RobotExcited"
          value={celebrationRobotExcited}
          onChange={setCelebrationRobotExcited}
        />
        <RobotControlPanel
          label="RobotRallying"
          value={celebrationRobotRallying}
          onChange={setCelebrationRobotRallying}
        />
        <BackgroundRobotArmControlPanel value={backgroundRobotArm} onChange={setBackgroundRobotArm} />
      </div>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          className="h-screen w-screen"
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
            celebrationRobotCheering={celebrationRobotCheering}
            celebrationRobotCheering2={celebrationRobotCheering2}
            celebrationRobotClapping={celebrationRobotClapping}
            celebrationRobotCrazyDancing={celebrationRobotCrazyDancing}
            celebrationRobotExcited={celebrationRobotExcited}
            celebrationRobotRallying={celebrationRobotRallying}
            laptopScale={laptopScale}
            laptopPosition={laptopPosition}
            laptopRotation={laptopRotation}
            cameraPosition={cameraPosition}
            cameraFov={cameraFov}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
