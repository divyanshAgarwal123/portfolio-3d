'use client';

import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type GlitchStartupProps = {
  triggered: boolean;
};

const TOTAL_DURATION = 1.6;

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uPhase;
  uniform float uDistortion;
  uniform float uScanlines;

  float rect(vec2 uv, vec2 center, vec2 size) {
    vec2 d = abs(uv - center) - size;
    return 1.0 - step(0.0, max(d.x, d.y));
  }

  vec3 contentAt(vec2 uv) {
    vec3 bg = vec3(1.0);

    float n1 = rect(uv, vec2(0.38, 0.52), vec2(0.035, 0.12));
    float n2 = rect(uv, vec2(0.43, 0.50), vec2(0.03, 0.10));
    float a1 = rect(uv, vec2(0.49, 0.50), vec2(0.03, 0.12));
    float a2 = rect(uv, vec2(0.53, 0.50), vec2(0.03, 0.12));
    float a3 = rect(uv, vec2(0.51, 0.50), vec2(0.04, 0.02));
    float m1 = rect(uv, vec2(0.59, 0.50), vec2(0.025, 0.12));
    float m2 = rect(uv, vec2(0.63, 0.50), vec2(0.025, 0.12));
    float m3 = rect(uv, vec2(0.61, 0.56), vec2(0.02, 0.06));
    float e1 = rect(uv, vec2(0.70, 0.50), vec2(0.03, 0.12));
    float e2 = rect(uv, vec2(0.73, 0.60), vec2(0.03, 0.02));
    float e3 = rect(uv, vec2(0.73, 0.50), vec2(0.028, 0.02));
    float e4 = rect(uv, vec2(0.73, 0.40), vec2(0.03, 0.02));

    float textMask = max(max(max(n1, n2), max(a1 + a2 + a3, m1 + m2 + m3)), max(e1, e2 + e3 + e4));
    textMask = clamp(textMask, 0.0, 1.0);

    return mix(bg, vec3(0.0), textMask);
  }

  void main() {
    float t = uTime;
    vec3 color = vec3(0.0);

    if (t < 0.3) {
      color = vec3(0.0);
    } else if (t < 0.6) {
      float scan = step(0.0, sin(vUv.y * 200.0 + uTime * 50.0));
      float flicker = step(0.5, fract(uTime * 30.0));
      float line = scan * flicker * uScanlines;
      color = vec3(line);
    } else if (t < 0.9) {
      bool flashOn = (t < 0.7) || (t >= 0.8 && t < 0.9);
      color = flashOn ? vec3(1.0) : vec3(0.0);
    } else {
      vec2 uv = vUv;
      float offset = uDistortion;

      vec2 uvR = vec2(clamp(uv.x - offset, 0.0, 1.0), uv.y);
      vec2 uvG = uv;
      vec2 uvB = vec2(clamp(uv.x + offset, 0.0, 1.0), uv.y);

      vec3 r = contentAt(uvR);
      vec3 g = contentAt(uvG);
      vec3 b = contentAt(uvB);

      color = vec3(r.r, g.g, b.b);

      float residualScan = sin(uv.y * 220.0 + uTime * 35.0) * 0.5 + 0.5;
      color += vec3(residualScan * 0.035 * uScanlines);

      float noise = fract(sin(dot(uv * (1.0 + uPhase), vec2(12.9898, 78.233))) * 43758.5453);
      color += vec3((noise - 0.5) * 0.03 * uScanlines);
    }

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

function getPhaseLabel(elapsed: number): string {
  if (elapsed < 0.3) return 'black';
  if (elapsed < 0.6) return 'scanlines';
  if (elapsed < 0.9) return 'double-flash';
  if (elapsed < 1.2) return 'heavy-distortion';
  if (elapsed < 1.6) return 'settling';
  return 'stable';
}

export default function GlitchStartup({ triggered }: GlitchStartupProps) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const prevTriggeredRef = useRef(false);
  const loggedPhaseRef = useRef<string>('idle');

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uDistortion: { value: 0 },
      uScanlines: { value: 0 },
    }),
    []
  );

  useEffect(() => {
    const wasTriggered = prevTriggeredRef.current;
    if (!wasTriggered && triggered) {
      setStartTime(null);
      setIsComplete(false);
      loggedPhaseRef.current = 'idle';
    }

    prevTriggeredRef.current = triggered;
  }, [triggered]);

  useFrame((state) => {
    if (!triggered || isComplete) {
      return;
    }

    if (startTime === null) {
      setStartTime(state.clock.elapsedTime);
      return;
    }

    const elapsed = state.clock.elapsedTime - startTime;
    const phaseProgress = THREE.MathUtils.clamp(elapsed / TOTAL_DURATION, 0, 1);

    let distortion = 0;
    let scanlines = 0;

    if (elapsed >= 0.3 && elapsed < 0.6) {
      scanlines = 1.0;
    } else if (elapsed >= 0.9 && elapsed < 1.2) {
      distortion = 0.03;
      scanlines = 0.45;
    } else if (elapsed >= 1.2 && elapsed < 1.6) {
      const settle = 1.0 - THREE.MathUtils.clamp((elapsed - 1.2) / 0.4, 0, 1);
      distortion = 0.03 * settle;
      scanlines = 0.45 * settle;
    }

    uniforms.uTime.value = elapsed;
    uniforms.uPhase.value = phaseProgress;
    uniforms.uDistortion.value = distortion;
    uniforms.uScanlines.value = scanlines;

    const phaseLabel = getPhaseLabel(elapsed);
    if (loggedPhaseRef.current !== phaseLabel) {
      console.log('[GlitchStartup] phase:', phaseLabel);
      loggedPhaseRef.current = phaseLabel;
    }

    if (elapsed >= TOTAL_DURATION) {
      setIsComplete(true);
      console.log('[GlitchStartup] complete');
    }
  });

  if (isComplete) {
    return (
      <group>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial color="white" toneMapped={false} />
        </mesh>
        <Text
          position={[0, 0, 0]}
          fontSize={0.4}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          NAME
        </Text>
      </group>
    );
  }

  return (
    <mesh renderOrder={1000}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthTest={false}
        depthWrite={false}
        transparent={false}
        toneMapped={false}
      />
    </mesh>
  );
}
