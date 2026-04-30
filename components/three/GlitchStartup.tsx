'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';

type GlitchStartupProps = {
  triggered: boolean;
  onComplete?: () => void;
};

type GlitchPhase = 'idle' | 'flash' | 'static' | 'resolve' | 'done';

// Phase durations in seconds
const FLASH_DURATION = 0.35;
const STATIC_DURATION = 1.2;
const RESOLVE_DURATION = 0.7;

export default function GlitchStartup({ triggered, onComplete }: GlitchStartupProps) {
  const [phase, setPhase] = useState<GlitchPhase>('idle');
  const startTimeRef = useRef<number | null>(null);
  const hasPlayedRef = useRef(false);
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const noiseCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const noiseRafRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Start the sequence when triggered
  useEffect(() => {
    if (!triggered) {
      setPhase('idle');
      startTimeRef.current = null;
      hasPlayedRef.current = false;
      return;
    }

    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      setPhase('flash');
      startTimeRef.current = null;
    }
  }, [triggered]);

  // Canvas noise generator — renders random grayscale pixels at ~15fps
  const initNoise = useCallback((canvas: HTMLCanvasElement | null) => {
    noiseCanvasRef.current = canvas;
    if (!canvas) {
      if (noiseRafRef.current) cancelAnimationFrame(noiseRafRef.current);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    noiseCtxRef.current = ctx;

    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    let lastDraw = 0;

    const drawNoise = (timestamp: number) => {
      // Throttle to ~15fps for that choppy analog feel
      if (timestamp - lastDraw < 66) {
        noiseRafRef.current = requestAnimationFrame(drawNoise);
        return;
      }
      lastDraw = timestamp;

      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      noiseRafRef.current = requestAnimationFrame(drawNoise);
    };

    noiseRafRef.current = requestAnimationFrame(drawNoise);
  }, []);

  // Cleanup noise loop
  useEffect(() => {
    return () => {
      if (noiseRafRef.current) cancelAnimationFrame(noiseRafRef.current);
    };
  }, []);

  // Phase state machine driven by R3F frame loop
  useFrame((state) => {
    if (phase === 'idle' || phase === 'done') return;

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
      return;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;

    if (phase === 'flash' && elapsed >= FLASH_DURATION) {
      startTimeRef.current = state.clock.elapsedTime;
      setPhase('static');
    } else if (phase === 'static' && elapsed >= STATIC_DURATION) {
      startTimeRef.current = state.clock.elapsedTime;
      setPhase('resolve');
    } else if (phase === 'resolve' && elapsed >= RESOLVE_DURATION) {
      setPhase('done');
      if (noiseRafRef.current) cancelAnimationFrame(noiseRafRef.current);
      onCompleteRef.current?.();
    }
  });

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <Html
      transform
      center
      position={[0, 0, 0.002]}
      distanceFactor={1}
      className="pointer-events-none"
    >
      <div className="glitch-boot-shell">
        {/* Phase 1: Power flash */}
        {phase === 'flash' && <div className="power-flash" />}

        {/* Phase 2: TV static noise */}
        {(phase === 'static' || phase === 'resolve') && (
          <>
            <canvas
              ref={initNoise}
              width={128}
              height={80}
              className={`noise-canvas ${phase === 'resolve' ? 'noise-fade' : ''}`}
            />

            {/* RGB split text */}
            <div className={`rgb-split ${phase === 'resolve' ? 'rgb-converge' : ''}`}>
              <span className="rgb-r" data-text="BOOTING">BOOTING</span>
              <span className="rgb-g" data-text="BOOTING">BOOTING</span>
              <span className="rgb-b" data-text="BOOTING">BOOTING</span>
            </div>

            {/* Horizontal tear bars */}
            <div className="h-tear tear-1" />
            <div className="h-tear tear-2" />
            <div className="h-tear tear-3" />

            {/* Scanlines overlay */}
            <div className="scanlines" />
          </>
        )}
      </div>

      <style jsx>{`
        .glitch-boot-shell {
          position: relative;
          width: 900px;
          height: 540px;
          background: #000;
          overflow: hidden;
          font-family: 'Courier New', Courier, monospace;
        }

        /* ── Phase 1: CRT power-on flash ── */
        .power-flash {
          position: absolute;
          inset: 0;
          z-index: 10;
          background: #fff;
          animation: flash-anim ${FLASH_DURATION}s ease-out forwards;
        }

        @keyframes flash-anim {
          0% { opacity: 0; }
          15% { opacity: 1; }
          40% { opacity: 0.6; }
          60% { opacity: 0.9; }
          100% { opacity: 0; background: #000; }
        }

        /* ── Phase 2: Canvas noise ── */
        .noise-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          image-rendering: pixelated;
          opacity: 0.85;
          z-index: 1;
          animation: noise-flicker 0.15s steps(2) infinite;
        }

        .noise-fade {
          animation: noise-fadeout ${RESOLVE_DURATION}s ease-in forwards;
        }

        @keyframes noise-flicker {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 0.65; }
        }

        @keyframes noise-fadeout {
          0% { opacity: 0.85; }
          100% { opacity: 0; }
        }

        /* ── RGB channel separation ── */
        .rgb-split {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
        }

        .rgb-split span {
          position: absolute;
          font-size: 56px;
          font-weight: 700;
          letter-spacing: 0.6rem;
          text-transform: uppercase;
          mix-blend-mode: screen;
        }

        .rgb-r {
          color: #ff0000;
          animation: rgb-shift-r ${STATIC_DURATION}s ease-in-out infinite;
        }
        .rgb-g {
          color: #00ff00;
          animation: rgb-shift-g ${STATIC_DURATION}s ease-in-out infinite;
        }
        .rgb-b {
          color: #0000ff;
          animation: rgb-shift-b ${STATIC_DURATION}s ease-in-out infinite;
        }

        .rgb-converge span {
          animation-duration: ${RESOLVE_DURATION}s !important;
          animation-fill-mode: forwards !important;
          animation-iteration-count: 1 !important;
        }
        .rgb-converge .rgb-r {
          animation-name: rgb-converge-r;
        }
        .rgb-converge .rgb-g {
          animation-name: rgb-converge-g;
        }
        .rgb-converge .rgb-b {
          animation-name: rgb-converge-b;
        }

        @keyframes rgb-shift-r {
          0%, 100% { transform: translate(-4px, 0); }
          25% { transform: translate(-8px, 2px); }
          50% { transform: translate(-3px, -1px); }
          75% { transform: translate(-6px, 1px); }
        }

        @keyframes rgb-shift-g {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(2px, -2px); }
          66% { transform: translate(-1px, 1px); }
        }

        @keyframes rgb-shift-b {
          0%, 100% { transform: translate(4px, 0); }
          25% { transform: translate(6px, -2px); }
          50% { transform: translate(3px, 1px); }
          75% { transform: translate(8px, -1px); }
        }

        @keyframes rgb-converge-r {
          0% { transform: translate(-6px, 1px); opacity: 1; }
          100% { transform: translate(0, 0); opacity: 0; }
        }
        @keyframes rgb-converge-g {
          0% { transform: translate(1px, -1px); opacity: 1; }
          100% { transform: translate(0, 0); opacity: 0; }
        }
        @keyframes rgb-converge-b {
          0% { transform: translate(6px, -1px); opacity: 1; }
          100% { transform: translate(0, 0); opacity: 0; }
        }

        /* ── Horizontal tear bars ── */
        .h-tear {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.15);
          z-index: 4;
          mix-blend-mode: overlay;
        }

        .tear-1 {
          top: 22%;
          animation: tear-slide-1 0.4s linear infinite;
        }
        .tear-2 {
          top: 58%;
          animation: tear-slide-2 0.55s linear infinite;
        }
        .tear-3 {
          top: 81%;
          animation: tear-slide-3 0.3s linear infinite;
          height: 5px;
        }

        @keyframes tear-slide-1 {
          0% { transform: translateX(-20px); opacity: 0.8; }
          50% { transform: translateX(30px); opacity: 0.4; }
          100% { transform: translateX(-10px); opacity: 0.7; }
        }

        @keyframes tear-slide-2 {
          0% { transform: translateX(15px); opacity: 0.6; }
          50% { transform: translateX(-25px); opacity: 0.9; }
          100% { transform: translateX(15px); opacity: 0.5; }
        }

        @keyframes tear-slide-3 {
          0% { transform: translateX(-30px); opacity: 0.5; }
          50% { transform: translateX(20px); opacity: 0.3; }
          100% { transform: translateX(-30px); opacity: 0.6; }
        }

        /* ── Scanlines ── */
        .scanlines {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.2) 0px,
            rgba(0, 0, 0, 0.2) 1px,
            transparent 1px,
            transparent 3px
          );
        }
      `}</style>
    </Html>
  );
}
