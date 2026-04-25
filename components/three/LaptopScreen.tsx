'use client';

import { PerspectiveCamera, RenderTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import GlitchStartup from './GlitchStartup';

type LaptopScreenProps = {
  laptopScene: THREE.Object3D | null;
  lidAngle: number;
};

function findLidGroup(root: THREE.Object3D): THREE.Object3D | null {
  let lidGroup: THREE.Object3D | null = null;

  root.traverse((object) => {
    if (lidGroup) return;
    if (object.name && object.name.toLowerCase().includes('lid')) {
      lidGroup = object;
    }
  });

  return lidGroup;
}

function findScreenMesh(searchRoot: THREE.Object3D): THREE.Mesh | null {
  let namedScreen: THREE.Mesh | null = null;
  let namedDisplay: THREE.Mesh | null = null;
  let areaFallback: THREE.Mesh | null = null;
  let maxArea = -Infinity;

  const size = new THREE.Vector3();

  searchRoot.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return;

    const mesh = object as THREE.Mesh;
    const lowerName = mesh.name.toLowerCase();

    if (lowerName.includes('screen')) {
      namedScreen = mesh;
      return;
    }

    if (!namedDisplay && (lowerName.includes('display') || lowerName.includes('monitor') || lowerName.includes('panel'))) {
      namedDisplay = mesh;
    }

    const geometry = mesh.geometry;
    if (!geometry?.boundingBox) {
      geometry?.computeBoundingBox();
    }

    const box = geometry?.boundingBox;
    if (!box) return;

    box.getSize(size);
    const area = size.x * size.y;
    if (area > maxArea) {
      maxArea = area;
      areaFallback = mesh;
    }
  });

  return namedScreen ?? namedDisplay ?? areaFallback;
}

export default function LaptopScreen({ laptopScene, lidAngle }: LaptopScreenProps) {
  const [screenMesh, setScreenMesh] = useState<THREE.Mesh | null>(null);
  const originalMaterialRef = useRef<THREE.Material | THREE.Material[] | null>(null);
  const hasLoggedLidNames = useRef(false);

  // In this scene, lid angle animates from about -1.59 (closed) to -0.23 (open).
  // Activate the laptop screen only when nearly open.
  const isScreenActive = lidAngle >= -0.3;

  const lidGroup = useMemo(() => {
    if (!laptopScene) return null;
    return findLidGroup(laptopScene);
  }, [laptopScene]);

  useEffect(() => {
    if (!lidGroup || hasLoggedLidNames.current) return;

    const names: string[] = [];
    lidGroup.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        names.push(mesh.name || '(unnamed-mesh)');
      }
    });

    console.log('[LaptopScreen] Lid group mesh names:', names);
    hasLoggedLidNames.current = true;
  }, [lidGroup]);

  useEffect(() => {
    if (!laptopScene) {
      setScreenMesh(null);
      return;
    }

    const targetRoot = lidGroup ?? laptopScene;
    const foundScreenMesh = findScreenMesh(targetRoot);

    if (foundScreenMesh) {
      console.log('[LaptopScreen] Using screen mesh:', foundScreenMesh.name || '(unnamed-mesh)');
    } else {
      console.warn('[LaptopScreen] No dedicated screen mesh found in lid group/scene.');
    }

    setScreenMesh(foundScreenMesh);
  }, [laptopScene, lidGroup]);

  useEffect(() => {
    console.log('[LaptopScreen] lidAngle:', lidAngle.toFixed(3), 'active:', isScreenActive);
  }, [lidAngle, isScreenActive]);

  useEffect(() => {
    if (!screenMesh) return;

    if (!isScreenActive && originalMaterialRef.current) {
      screenMesh.material = originalMaterialRef.current;
    }
  }, [isScreenActive, screenMesh]);

  useEffect(() => {
    return () => {
      if (screenMesh && originalMaterialRef.current) {
        screenMesh.material = originalMaterialRef.current;
      }
    };
  }, [screenMesh]);

  if (!screenMesh || !isScreenActive) {
    return null;
  }

  if (!originalMaterialRef.current) {
    originalMaterialRef.current = screenMesh.material;
  }

  return (
    <primitive object={screenMesh}>
      <meshBasicMaterial toneMapped={false}>
        <RenderTexture attach="map" frames={Infinity}>
          <PerspectiveCamera makeDefault position={[0, 0, 1]} fov={45} />
          <GlitchStartup triggered={isScreenActive} />
        </RenderTexture>
      </meshBasicMaterial>
    </primitive>
  );
}
