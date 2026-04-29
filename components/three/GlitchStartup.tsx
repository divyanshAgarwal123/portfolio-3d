'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';

type GlitchStartupProps = {
  triggered: boolean;
};

const GLITCH_DURATION = 1.6;

export default function GlitchStartup({ triggered }: GlitchStartupProps) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const prevTriggeredRef = useRef(false);

  useEffect(() => {
    const wasTriggered = prevTriggeredRef.current;
    if (!wasTriggered && triggered) {
      setStartTime(null);
      setIsComplete(false);
    }

    prevTriggeredRef.current = triggered;
  }, [triggered]);

  useFrame((state) => {
    if (!triggered || isComplete) return;

    if (startTime === null) {
      setStartTime(state.clock.elapsedTime);
      return;
    }

    const elapsed = state.clock.elapsedTime - startTime;
    if (elapsed >= GLITCH_DURATION) {
      setIsComplete(true);
    }
  });

  if (!triggered) {
    return null;
  }

  if (isComplete) {
    return (
      <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="black" toneMapped={false} />
      </mesh>
    );
  }

  return (
    <group>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="black" toneMapped={false} />
      </mesh>
      <Html transform center position={[0, 0, 0.001]}>
        <div className="glitch-screen bg-black text-emerald-400">
          <div className="glitch" data-text="SYSTEM GLITCH">
            SYSTEM GLITCH
          </div>
        </div>
        <style jsx>{`
          .glitch-screen {
            width: 1000px;
            height: 620px;
            display: grid;
            place-items: center;
            font-family: 'Courier New', Courier, monospace;
            text-transform: uppercase;
            letter-spacing: 8px;
            position: relative;
            overflow: hidden;
          }

          .glitch {
            position: relative;
            font-size: 64px;
            line-height: 1;
            text-shadow: 0 0 12px currentColor;
            animation: glitch-skew 1.2s infinite steps(2, end);
          }

          .glitch::before,
          .glitch::after {
            content: attr(data-text);
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            opacity: 0.8;
          }

          .glitch::before {
            transform: translate(-2px, -1px);
            clip-path: inset(0 0 60% 0);
            animation: glitch-clip-1 0.9s infinite steps(2, end);
          }

          .glitch::after {
            transform: translate(2px, 1px);
            clip-path: inset(40% 0 0 0);
            animation: glitch-clip-2 1.1s infinite steps(2, end);
          }

          @keyframes glitch-clip-1 {
            0% {
              clip-path: inset(0 0 70% 0);
            }
            20% {
              clip-path: inset(10% 0 55% 0);
            }
            40% {
              clip-path: inset(30% 0 35% 0);
            }
            60% {
              clip-path: inset(45% 0 20% 0);
            }
            80% {
              clip-path: inset(15% 0 60% 0);
            }
            100% {
              clip-path: inset(0 0 70% 0);
            }
          }

          @keyframes glitch-clip-2 {
            0% {
              clip-path: inset(45% 0 10% 0);
            }
            25% {
              clip-path: inset(35% 0 25% 0);
            }
            50% {
              clip-path: inset(55% 0 5% 0);
            }
            75% {
              clip-path: inset(20% 0 55% 0);
            }
            100% {
              clip-path: inset(45% 0 10% 0);
            }
          }

          @keyframes glitch-skew {
            0% {
              transform: skewX(0deg);
            }
            20% {
              transform: skewX(2deg);
            }
            40% {
              transform: skewX(-1deg);
            }
            60% {
              transform: skewX(1.5deg);
            }
            80% {
              transform: skewX(-2deg);
            }
            100% {
              transform: skewX(0deg);
            }
          }
        `}</style>
      </Html>
    </group>
  );
}
