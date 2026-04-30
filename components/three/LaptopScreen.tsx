"use client";

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import IntroContent from '../screen/IntroContent';
import GlitchStartup from './GlitchStartup';

type LaptopScreenProps = {
  laptopScene: THREE.Object3D | null;
  lidAngle: number;
  screenScaleX?: number;
  screenScaleY?: number;
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
  let bestHeuristic: THREE.Mesh | null = null;
  let bestHeuristicArea = -Infinity;

  const size = new THREE.Vector3();
  const positiveKeywords = ['screen', 'display', 'monitor', 'panel'];
  const negativeKeywords = ['lid', 'base', 'body', 'keyboard', 'hinge', 'frame'];

  searchRoot.traverse((object) => {
    if (!(object as THREE.Mesh).isMesh) return;

    const mesh = object as THREE.Mesh;
    const lowerName = (mesh.name || '').toLowerCase();
    const materialName = Array.isArray(mesh.material)
      ? mesh.material.map((m) => (m?.name || '').toLowerCase()).join(' ')
      : (mesh.material?.name || '').toLowerCase();
    const combinedName = `${lowerName} ${materialName}`;

    if (positiveKeywords.some((keyword) => combinedName.includes(keyword))) {
      namedScreen = mesh;
      return;
    }

    if (!namedDisplay && (combinedName.includes('display') || combinedName.includes('monitor') || combinedName.includes('panel'))) {
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

    const minDimension = Math.min(size.x, size.y, size.z);
    const maxDimension = Math.max(size.x, size.y, size.z);
    const aspect = maxDimension > 0 ? Math.max(size.x, size.y) / Math.min(size.x, size.y || 1e-6) : 1;
    const hasNegativeKeyword = negativeKeywords.some((keyword) => combinedName.includes(keyword));

    // Heuristic for unnamed screen plane: thin rectangular surface, but not obvious lid/body parts.
    if (!hasNegativeKeyword && minDimension < 0.2 && aspect > 1.15 && area > bestHeuristicArea) {
      bestHeuristicArea = area;
      bestHeuristic = mesh;
    }
  });

  const selected = (namedScreen ?? namedDisplay ?? bestHeuristic) as THREE.Mesh | null;

  if (!selected) return null;

  const selectedName = (selected.name || '').toLowerCase();
  if (selectedName.includes('lid') || selectedName.includes('base')) {
    return null;
  }

  return selected;
}

export default function LaptopScreen({
  laptopScene,
  lidAngle,
  screenScaleX = 0.985,
  screenScaleY = 0.985,
}: LaptopScreenProps) {
  const [screenMesh, setScreenMesh] = useState<THREE.Mesh | null>(null);
  const [glitchDone, setGlitchDone] = useState(false);
  const hasLoggedLidNames = useRef(false);
  const overlayGroupRef = useRef<THREE.Group>(null);

  const worldPosition = useRef(new THREE.Vector3());
  const worldQuaternion = useRef(new THREE.Quaternion());
  const worldScale = useRef(new THREE.Vector3());

  // Activate the laptop screen only when nearly open.
  const isScreenActive = lidAngle >= -0.3;

  // Reset glitch state when screen deactivates
  useEffect(() => {
    if (!isScreenActive) {
      setGlitchDone(false);
    }
  }, [isScreenActive]);

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

    hasLoggedLidNames.current = true;
  }, [lidGroup]);

  useEffect(() => {
    if (!laptopScene) {
      setScreenMesh(null);
      return;
    }

    const targetRoot = lidGroup ?? laptopScene;
    const foundScreenMesh = findScreenMesh(targetRoot);

    setScreenMesh(foundScreenMesh);
  }, [laptopScene, lidGroup]);

  useFrame(() => {
    if (!screenMesh || !overlayGroupRef.current) return;

    screenMesh.updateWorldMatrix(true, false);
    screenMesh.matrixWorld.decompose(
      worldPosition.current,
      worldQuaternion.current,
      worldScale.current
    );

    overlayGroupRef.current.position.copy(worldPosition.current);
    overlayGroupRef.current.quaternion.copy(worldQuaternion.current);
    overlayGroupRef.current.scale.set(
      worldScale.current.x * screenScaleX,
      worldScale.current.y * screenScaleY,
      worldScale.current.z * 0.985
    );
  });

  if (!screenMesh || !isScreenActive) {
    return null;
  }

  return (
    <group ref={overlayGroupRef} renderOrder={20}>
      {/* Black base screen */}
      <mesh geometry={screenMesh.geometry} renderOrder={20} frustumCulled={false}>
        <meshBasicMaterial color="black" toneMapped={false} />
      </mesh>

      {/* Phase 1: Glitch boot-up effect */}
      {!glitchDone && (
        <GlitchStartup
          triggered={isScreenActive}
          onComplete={() => setGlitchDone(true)}
        />
      )}

      {/* Phase 2: Profile content (after glitch completes) */}
      {glitchDone && <IntroContent />}
    </group>
  );
}

