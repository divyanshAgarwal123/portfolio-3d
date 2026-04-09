'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const MODEL_PATH = '/models/laptop.glb';
const DRACO_DECODER_PATH = '/draco-gltf/';

type LaptopProps = {
  lidAngle: number;
  verticalOffset: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  rotationY?: number;
  modelScale?: number;
};

export default function Laptop({
  lidAngle,
  verticalOffset,
  position = [0.01, -0.43, -0.42],
  rotation,
  rotationY = -0.01,
  modelScale = 0.04,
}: LaptopProps) {
  const { scene } = useGLTF(MODEL_PATH, DRACO_DECODER_PATH);
  const hasLoggedMeshNames = useRef(false);

  const { lidMesh, meshNames } = useMemo(() => {
    const names: string[] = [];
    let foundLidMesh: THREE.Mesh | null = null;

    scene.children.forEach((child) => {
      child.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          names.push(mesh.name || '(unnamed-mesh)');

          const lowerName = mesh.name.toLowerCase();
          if (!foundLidMesh && (lowerName.includes('lid') || lowerName.includes('screen'))) {
            foundLidMesh = mesh;
          }
        }
      });
    });

    return { lidMesh: foundLidMesh, meshNames: names };
  }, [scene]);

  useEffect(() => {
    if (!hasLoggedMeshNames.current) {
      console.log('[Laptop] Mesh names:', meshNames);
      hasLoggedMeshNames.current = true;
    }
  }, [meshNames]);

  useEffect(() => {
    if (lidMesh) {
      lidMesh.rotation.x = lidAngle;
    }
  }, [lidMesh, lidAngle]);

  return (
    <group
      position={[position[0], position[1] + verticalOffset, position[2]]}
      rotation={rotation ?? [0, rotationY, 0]}
      dispose={null}
    >
      <group scale={modelScale}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

useGLTF.setDecoderPath(DRACO_DECODER_PATH);
useGLTF.preload(MODEL_PATH);
