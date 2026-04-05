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
  robotIdle: RobotTransform;
  robotRunning: RobotTransform;
  robotWaving: RobotTransform;
  robotPointing: RobotTransform;
  robotClapping: RobotTransform;
  robotPointingBackwords: RobotTransform;
  robotFalling: RobotTransform;
  laptopScale: number;
  laptopPosition: [number, number, number];
  laptopRotation: [number, number, number];
  cameraPosition: [number, number, number];
  cameraFov: number;
};

function SceneContent({
  robotIdle,
  robotRunning,
  robotWaving,
  robotPointing,
  robotClapping,
  robotPointingBackwords,
  robotFalling,
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
        robotIdle={robotIdle}
        robotRunning={robotRunning}
        robotWaving={robotWaving}
        robotPointing={robotPointing}
        robotClapping={robotClapping}
        robotPointingBackwords={robotPointingBackwords}
        robotFalling={robotFalling}
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
        className="mt-1 w-44"
        type="range"
        min={0.003}
        max={0.03}
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
    </>
  );
}

export default function Scene() {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [robotIdle, setRobotIdle] = useState<RobotTransform>({ position: [-1.6, 0.4, -1.2], scale: 0.01 });
  const [robotRunning, setRobotRunning] = useState<RobotTransform>({ position: [-0.8, 0.4, -1.2], scale: 0.01 });
  const [robotWaving, setRobotWaving] = useState<RobotTransform>({ position: [0, 0.4, -1.2], scale: 0.01 });
  const [robotPointing, setRobotPointing] = useState<RobotTransform>({ position: [0.8, 0.4, -1.2], scale: 0.01 });
  const [robotClapping, setRobotClapping] = useState<RobotTransform>({ position: [1.6, 0.4, -1.2], scale: 0.01 });
  const [robotPointingBackwords, setRobotPointingBackwords] = useState<RobotTransform>({
    position: [-2.4, 0.4, -1.2],
    scale: 0.01,
  });
  const [robotFalling, setRobotFalling] = useState<RobotTransform>({ position: [2.4, 0.4, -1.2], scale: 0.01 });
  const [laptopScale, setLaptopScale] = useState(0.04);
  const [laptopPosition, setLaptopPosition] = useState<[number, number, number]>([0.01, -0.43, -0.42]);
  const [laptopRotation, setLaptopRotation] = useState<[number, number, number]>([0, -0.01, 0]);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, -0.25, 1.4]);
  const [cameraFov, setCameraFov] = useState(40);

  useEffect(() => {
    if (!canvasWrapRef.current) return;
    canvasWrapRef.current.style.opacity = '0';

    canvasWrapRef.current.style.opacity = '1';
  }, []);

  return (
    <div ref={canvasWrapRef} className="fixed left-0 top-0 h-screen w-screen" style={{ opacity: 0 }}>
      <div className="pointer-events-auto fixed left-4 top-4 z-50 max-h-[92vh] overflow-y-auto rounded-lg border border-neutral-300 bg-white/95 p-3 text-xs text-neutral-800 shadow-sm">
        <p className="font-semibold">Robots</p>
        <RobotControlPanel label="RobotIdle" value={robotIdle} onChange={setRobotIdle} />
        <RobotControlPanel label="RobotRunning" value={robotRunning} onChange={setRobotRunning} />
        <RobotControlPanel label="RobotWaving" value={robotWaving} onChange={setRobotWaving} />
        <RobotControlPanel label="RobotPointing" value={robotPointing} onChange={setRobotPointing} />
        <RobotControlPanel label="RobotClapping" value={robotClapping} onChange={setRobotClapping} />
        <RobotControlPanel
          label="RobotPointingBackwords"
          value={robotPointingBackwords}
          onChange={setRobotPointingBackwords}
        />
        <RobotControlPanel label="RobotFalling" value={robotFalling} onChange={setRobotFalling} />

        <p className="mt-4 font-semibold">Laptop</p>
        <p className="mt-1">Scale: {laptopScale.toFixed(3)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={0.01}
          max={0.08}
          step={0.001}
          value={laptopScale}
          onChange={(event) => setLaptopScale(Number(event.target.value))}
        />
        <p className="mt-2">X: {laptopPosition[0].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3}
          max={3}
          step={0.01}
          value={laptopPosition[0]}
          onChange={(event) =>
            setLaptopPosition((prev) => [Number(event.target.value), prev[1], prev[2]])
          }
        />
        <p className="mt-2">Y: {laptopPosition[1].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3}
          max={3}
          step={0.01}
          value={laptopPosition[1]}
          onChange={(event) =>
            setLaptopPosition((prev) => [prev[0], Number(event.target.value), prev[2]])
          }
        />
        <p className="mt-2">Z: {laptopPosition[2].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3}
          max={3}
          step={0.01}
          value={laptopPosition[2]}
          onChange={(event) =>
            setLaptopPosition((prev) => [prev[0], prev[1], Number(event.target.value)])
          }
        />
        <p className="mt-2">Rot X: {laptopRotation[0].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3.14}
          max={3.14}
          step={0.01}
          value={laptopRotation[0]}
          onChange={(event) =>
            setLaptopRotation((prev) => [Number(event.target.value), prev[1], prev[2]])
          }
        />
        <p className="mt-2">Rot Y: {laptopRotation[1].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3.14}
          max={3.14}
          step={0.01}
          value={laptopRotation[1]}
          onChange={(event) =>
            setLaptopRotation((prev) => [prev[0], Number(event.target.value), prev[2]])
          }
        />
        <p className="mt-2">Rot Z: {laptopRotation[2].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3.14}
          max={3.14}
          step={0.01}
          value={laptopRotation[2]}
          onChange={(event) =>
            setLaptopRotation((prev) => [prev[0], prev[1], Number(event.target.value)])
          }
        />

        <p className="mt-4 font-semibold">Camera POV</p>
        <p className="mt-1">FOV: {cameraFov.toFixed(1)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={20}
          max={90}
          step={0.1}
          value={cameraFov}
          onChange={(event) => setCameraFov(Number(event.target.value))}
        />
        <p className="mt-2">Cam X: {cameraPosition[0].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-5}
          max={5}
          step={0.01}
          value={cameraPosition[0]}
          onChange={(event) =>
            setCameraPosition((prev) => [Number(event.target.value), prev[1], prev[2]])
          }
        />
        <p className="mt-2">Cam Y: {cameraPosition[1].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-5}
          max={5}
          step={0.01}
          value={cameraPosition[1]}
          onChange={(event) =>
            setCameraPosition((prev) => [prev[0], Number(event.target.value), prev[2]])
          }
        />
        <p className="mt-2">Cam Z: {cameraPosition[2].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={0.2}
          max={10}
          step={0.01}
          value={cameraPosition[2]}
          onChange={(event) =>
            setCameraPosition((prev) => [prev[0], prev[1], Number(event.target.value)])
          }
        />
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
            robotIdle={robotIdle}
            robotRunning={robotRunning}
            robotWaving={robotWaving}
            robotPointing={robotPointing}
            robotClapping={robotClapping}
            robotPointingBackwords={robotPointingBackwords}
            robotFalling={robotFalling}
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
