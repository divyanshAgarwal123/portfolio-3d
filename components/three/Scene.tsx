'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import LaptopScene from './LaptopScene';

type CameraPOVSyncProps = {
  position: [number, number, number];
  fov: number;
  near: number;
  far: number;
};

function CameraPOVSync({ position, fov, near, far }: CameraPOVSyncProps) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.fov = fov;
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
  }, [camera, position, fov, near, far]);

  return null;
}

type LightingProps = {
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
};

function Lighting({ ambientIntensity, directionalIntensity, directionalPosition }: LightingProps) {
  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={directionalPosition} intensity={directionalIntensity} castShadow />
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
  robotScale: number;
  robotBehavior: {
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
  laptopScale: number;
  laptopPosition: [number, number, number];
  laptopRotation: [number, number, number];
  lidClosedAngle: number;
  lidOpenAngle: number;
  lidScrollEnd: number;
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
  cameraPosition: [number, number, number];
  cameraFov: number;
  cameraNear: number;
  cameraFar: number;
};

function SceneContent({
  robotScale,
  robotBehavior,
  laptopScale,
  laptopPosition,
  laptopRotation,
  lidClosedAngle,
  lidOpenAngle,
  lidScrollEnd,
  ambientIntensity,
  directionalIntensity,
  directionalPosition,
  cameraPosition,
  cameraFov,
  cameraNear,
  cameraFar,
}: SceneContentProps) {
  return (
    <>
      <Lighting
        ambientIntensity={ambientIntensity}
        directionalIntensity={directionalIntensity}
        directionalPosition={directionalPosition}
      />
      <WireframeFloors />
      <LaptopScene
        robotScale={robotScale}
        robotBehavior={robotBehavior}
        laptopScale={laptopScale}
        laptopPosition={laptopPosition}
        laptopRotation={laptopRotation}
        lidClosedAngle={lidClosedAngle}
        lidOpenAngle={lidOpenAngle}
        lidScrollEnd={lidScrollEnd}
      />
      <CameraPOVSync
        position={cameraPosition}
        fov={cameraFov}
        near={cameraNear}
        far={cameraFar}
      />
    </>
  );
}

function LoadingFallback() {
  return <div className="h-screen w-screen bg-white" />;
}

export default function Scene() {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [robotScale, setRobotScale] = useState(0.04);
  const [robotBehavior, setRobotBehavior] = useState({
    runStart: 0.15,
    runEnd: 0.45,
    pointStart: 0.65,
    startX: -4,
    endX: 0.8,
    y: -1,
    z: -1,
    runFacingY: -1.5,
    idleFacingY: 0.3,
  });
  const [laptopScale, setLaptopScale] = useState(0.04);
  const [laptopPosition, setLaptopPosition] = useState<[number, number, number]>([0.01, -0.43, -0.42]);
  const [laptopRotation, setLaptopRotation] = useState<[number, number, number]>([0, -0.01, 0]);
  const [lidClosedAngle, setLidClosedAngle] = useState(-1.59);
  const [lidOpenAngle, setLidOpenAngle] = useState(-0.23);
  const [lidScrollEnd, setLidScrollEnd] = useState(0.431);
  const [ambientIntensity, setAmbientIntensity] = useState(0.8);
  const [directionalIntensity, setDirectionalIntensity] = useState(1.2);
  const [directionalPosition, setDirectionalPosition] = useState<[number, number, number]>([5, 5, 3]);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, -0.25, 1.4]);
  const [cameraFov, setCameraFov] = useState(40);
  const [cameraNear, setCameraNear] = useState(0.1);
  const [cameraFar, setCameraFar] = useState(100);

  useEffect(() => {
    if (!canvasWrapRef.current) return;
    canvasWrapRef.current.style.opacity = '0';

    canvasWrapRef.current.style.opacity = '1';
  }, []);

  return (
    <div ref={canvasWrapRef} className="fixed left-0 top-0 h-screen w-screen" style={{ opacity: 0 }}>
      <div className="pointer-events-auto fixed left-4 top-4 z-50 rounded-lg border border-neutral-300 bg-white/95 p-3 text-xs text-neutral-800 shadow-sm">
        <p className="font-semibold">Robot</p>
        <p className="mt-1">Scale: {robotScale.toFixed(3)}</p>
        <input
          className="mt-2 w-44"
          type="range"
          min={0.005}
          max={0.08}
          step={0.001}
          value={robotScale}
          onChange={(event) => setRobotScale(Number(event.target.value))}
        />
        <p className="mt-3 font-semibold">Robot Motion</p>
        <p className="mt-1">Run start: {robotBehavior.runStart.toFixed(3)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={robotBehavior.runStart}
          onChange={(event) =>
            setRobotBehavior((prev) => ({ ...prev, runStart: Number(event.target.value) }))
          }
        />
        <p className="mt-2">Run end: {robotBehavior.runEnd.toFixed(3)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={robotBehavior.runEnd}
          onChange={(event) =>
            setRobotBehavior((prev) => ({ ...prev, runEnd: Number(event.target.value) }))
          }
        />
        <p className="mt-2">Point start: {robotBehavior.pointStart.toFixed(3)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={robotBehavior.pointStart}
          onChange={(event) =>
            setRobotBehavior((prev) => ({ ...prev, pointStart: Number(event.target.value) }))
          }
        />
        <p className="mt-2">Start X: {robotBehavior.startX.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-10}
          max={3}
          step={0.01}
          value={robotBehavior.startX}
          onChange={(event) =>
            setRobotBehavior((prev) => ({ ...prev, startX: Number(event.target.value) }))
          }
        />
        <p className="mt-2">End X: {robotBehavior.endX.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3}
          max={5}
          step={0.01}
          value={robotBehavior.endX}
          onChange={(event) =>
            setRobotBehavior((prev) => ({ ...prev, endX: Number(event.target.value) }))
          }
        />
        <p className="mt-2">Y: {robotBehavior.y.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3}
          max={3}
          step={0.01}
          value={robotBehavior.y}
          onChange={(event) =>
            setRobotBehavior((prev) => ({ ...prev, y: Number(event.target.value) }))
          }
        />
        <p className="mt-2">Z: {robotBehavior.z.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-10}
          max={3}
          step={0.01}
          value={robotBehavior.z}
          onChange={(event) =>
            setRobotBehavior((prev) => ({ ...prev, z: Number(event.target.value) }))
          }
        />
        <p className="mt-2">Run facing Y: {robotBehavior.runFacingY.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3.14}
          max={3.14}
          step={0.01}
          value={robotBehavior.runFacingY}
          onChange={(event) =>
            setRobotBehavior((prev) => ({ ...prev, runFacingY: Number(event.target.value) }))
          }
        />
        <p className="mt-2">Idle facing Y: {robotBehavior.idleFacingY.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3.14}
          max={3.14}
          step={0.01}
          value={robotBehavior.idleFacingY}
          onChange={(event) =>
            setRobotBehavior((prev) => ({ ...prev, idleFacingY: Number(event.target.value) }))
          }
        />

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

        <p className="mt-3 font-semibold">Lid Motion</p>
        <p className="mt-1">Closed angle: {lidClosedAngle.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3.14}
          max={0}
          step={0.01}
          value={lidClosedAngle}
          onChange={(event) => setLidClosedAngle(Number(event.target.value))}
        />
        <p className="mt-2">Open angle: {lidOpenAngle.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-3.14}
          max={0}
          step={0.01}
          value={lidOpenAngle}
          onChange={(event) => setLidOpenAngle(Number(event.target.value))}
        />
        <p className="mt-2">Scroll end: {lidScrollEnd.toFixed(3)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={0.05}
          max={1}
          step={0.001}
          value={lidScrollEnd}
          onChange={(event) => setLidScrollEnd(Number(event.target.value))}
        />

        <p className="mt-4 font-semibold">Lighting</p>
        <p className="mt-1">Ambient: {ambientIntensity.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={0}
          max={3}
          step={0.01}
          value={ambientIntensity}
          onChange={(event) => setAmbientIntensity(Number(event.target.value))}
        />
        <p className="mt-2">Directional: {directionalIntensity.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={0}
          max={5}
          step={0.01}
          value={directionalIntensity}
          onChange={(event) => setDirectionalIntensity(Number(event.target.value))}
        />
        <p className="mt-2">Dir X: {directionalPosition[0].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-20}
          max={20}
          step={0.01}
          value={directionalPosition[0]}
          onChange={(event) =>
            setDirectionalPosition((prev) => [Number(event.target.value), prev[1], prev[2]])
          }
        />
        <p className="mt-2">Dir Y: {directionalPosition[1].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-20}
          max={20}
          step={0.01}
          value={directionalPosition[1]}
          onChange={(event) =>
            setDirectionalPosition((prev) => [prev[0], Number(event.target.value), prev[2]])
          }
        />
        <p className="mt-2">Dir Z: {directionalPosition[2].toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={-20}
          max={20}
          step={0.01}
          value={directionalPosition[2]}
          onChange={(event) =>
            setDirectionalPosition((prev) => [prev[0], prev[1], Number(event.target.value)])
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
        <p className="mt-2">Near: {cameraNear.toFixed(2)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={0.01}
          max={5}
          step={0.01}
          value={cameraNear}
          onChange={(event) => setCameraNear(Number(event.target.value))}
        />
        <p className="mt-2">Far: {cameraFar.toFixed(1)}</p>
        <input
          className="mt-1 w-44"
          type="range"
          min={10}
          max={300}
          step={1}
          value={cameraFar}
          onChange={(event) => setCameraFar(Number(event.target.value))}
        />
      </div>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          className="h-screen w-screen"
          shadows
          camera={{ fov: cameraFov, position: cameraPosition, near: cameraNear, far: cameraFar }}
          onCreated={({ gl }) => {
            gl.setClearColor('#ffffff', 1);
          }}
        >
          <SceneContent
            robotScale={robotScale}
            robotBehavior={robotBehavior}
            laptopScale={laptopScale}
            laptopPosition={laptopPosition}
            laptopRotation={laptopRotation}
            lidClosedAngle={lidClosedAngle}
            lidOpenAngle={lidOpenAngle}
            lidScrollEnd={lidScrollEnd}
            ambientIntensity={ambientIntensity}
            directionalIntensity={directionalIntensity}
            directionalPosition={directionalPosition}
            cameraPosition={cameraPosition}
            cameraFov={cameraFov}
            cameraNear={cameraNear}
            cameraFar={cameraFar}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
