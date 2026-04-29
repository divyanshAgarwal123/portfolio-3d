'use client';

import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';

type GlitchStartupProps = {
  triggered: boolean;
};

const GLITCH_DURATION = 1.2;

export default function GlitchStartup({ triggered }: GlitchStartupProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (!triggered) {
      setIsGlitching(false);
      startTimeRef.current = null;
      hasPlayedRef.current = false;
      return;
    }

    if (!hasPlayedRef.current) {
      setIsGlitching(true);
      startTimeRef.current = null;
      hasPlayedRef.current = true;
    }
  }, [triggered]);

  useFrame((state) => {
    if (!isGlitching) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
      return;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;

    if (elapsed >= GLITCH_DURATION) {
      setIsGlitching(false);
    }
  });

  if (!isGlitching) {
    return null;
  }

  return (
    <Html transform center position={[0, 0, 0.002]} distanceFactor={1} className="pointer-events-none">
      <div className="glitch-shell bg-black text-emerald-400">
        <div className="glitch imgloaded" data-text="BOOTING">
          <div className="glitch__img" />
          <div className="glitch__img" />
          <div className="glitch__img" />
          <div className="glitch__img" />
          <div className="glitch__img" />
        </div>
        <div className="glitch__label">BOOTING</div>
      </div>

      <style jsx>{`
        .glitch-shell {
          position: relative;
          width: 900px;
          height: 540px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: 'Courier New', Courier, monospace;
          letter-spacing: 0.5rem;
          text-transform: uppercase;
          --glitch-width: 100%;
          --glitch-height: 100%;
          --gap-horizontal: 10px;
          --gap-vertical: 6px;
          --time-anim: 1.2s;
          --delay-anim: 0s;
        }

        .glitch {
          position: absolute;
          top: 0;
          left: 0;
          width: var(--glitch-width);
          height: var(--glitch-height);
          overflow: hidden;
        }

        .glitch__img {
          position: absolute;
          top: calc(-1 * var(--gap-vertical));
          left: calc(-1 * var(--gap-horizontal));
          width: calc(100% + var(--gap-horizontal) * 2);
          height: calc(100% + var(--gap-vertical) * 2);
          background-color: currentColor;
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }

        .glitch__img:nth-child(n + 2) {
          opacity: 0;
        }

        .imgloaded .glitch__img:nth-child(n + 2) {
          animation-duration: var(--time-anim);
          animation-delay: var(--delay-anim);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .imgloaded .glitch__img:nth-child(2) {
          mix-blend-mode: screen;
          animation-name: glitch-anim-1;
        }

        .imgloaded .glitch__img:nth-child(3) {
          mix-blend-mode: screen;
          animation-name: glitch-anim-2;
        }

        .imgloaded .glitch__img:nth-child(4) {
          mix-blend-mode: screen;
          animation-name: glitch-anim-3;
        }

        .imgloaded .glitch__img:nth-child(5) {
          mix-blend-mode: screen;
          animation-name: glitch-anim-flash;
        }

        .glitch__label {
          position: relative;
          font-size: 46px;
          z-index: 2;
          animation-name: glitch-anim-text;
          animation-duration: var(--time-anim);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes glitch-anim-1 {
          0% {
            opacity: 1;
            transform: translate3d(var(--gap-horizontal), 0, 0);
            -webkit-clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%);
            clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%);
          }
          2% {
            -webkit-clip-path: polygon(0 15%, 100% 15%, 100% 15%, 0 15%);
            clip-path: polygon(0 15%, 100% 15%, 100% 15%, 0 15%);
          }
          4% {
            -webkit-clip-path: polygon(0 10%, 100% 10%, 100% 20%, 0 20%);
            clip-path: polygon(0 10%, 100% 10%, 100% 20%, 0 20%);
          }
          6% {
            -webkit-clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%);
            clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%);
          }
          8% {
            -webkit-clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
            clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
          }
          10% {
            -webkit-clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
            clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
          }
          12% {
            -webkit-clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
            clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
          }
          14% {
            -webkit-clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
            clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
          }
          16% {
            -webkit-clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
            clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
          }
          18% {
            -webkit-clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
            clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
          }
          20% {
            -webkit-clip-path: polygon(0 70%, 100% 70%, 100% 80%, 0 80%);
            clip-path: polygon(0 70%, 100% 70%, 100% 80%, 0 80%);
          }
          21.9% {
            opacity: 1;
            transform: translate3d(var(--gap-horizontal), 0, 0);
          }
          22%, 100% {
            opacity: 0;
            transform: translate3d(0, 0, 0);
            -webkit-clip-path: polygon(0 0, 0 0, 0 0, 0 0);
            clip-path: polygon(0 0, 0 0, 0 0, 0 0);
          }
        }

        @keyframes glitch-anim-2 {
          0% {
            opacity: 1;
            transform: translate3d(calc(-1 * var(--gap-horizontal)), 0, 0);
            -webkit-clip-path: polygon(0 25%, 100% 25%, 100% 30%, 0 30%);
            clip-path: polygon(0 25%, 100% 25%, 100% 30%, 0 30%);
          }
          3% {
            -webkit-clip-path: polygon(0 3%, 100% 3%, 100% 3%, 0 3%);
            clip-path: polygon(0 3%, 100% 3%, 100% 3%, 0 3%);
          }
          5% {
            -webkit-clip-path: polygon(0 5%, 100% 5%, 100% 20%, 0 20%);
            clip-path: polygon(0 5%, 100% 5%, 100% 20%, 0 20%);
          }
          7% {
            -webkit-clip-path: polygon(0 20%, 100% 20%, 100% 20%, 0 20%);
            clip-path: polygon(0 20%, 100% 20%, 100% 20%, 0 20%);
          }
          9% {
            -webkit-clip-path: polygon(0 40%, 100% 40%, 100% 40%, 0 40%);
            clip-path: polygon(0 40%, 100% 40%, 100% 40%, 0 40%);
          }
          11% {
            -webkit-clip-path: polygon(0 52%, 100% 52%, 100% 59%, 0 59%);
            clip-path: polygon(0 52%, 100% 52%, 100% 59%, 0 59%);
          }
          13% {
            -webkit-clip-path: polygon(0 60%, 100% 60%, 100% 60%, 0 60%);
            clip-path: polygon(0 60%, 100% 60%, 100% 60%, 0 60%);
          }
          15% {
            -webkit-clip-path: polygon(0 75%, 100% 75%, 100% 75%, 0 75%);
            clip-path: polygon(0 75%, 100% 75%, 100% 75%, 0 75%);
          }
          17% {
            -webkit-clip-path: polygon(0 65%, 100% 65%, 100% 40%, 0 40%);
            clip-path: polygon(0 65%, 100% 65%, 100% 40%, 0 40%);
          }
          19% {
            -webkit-clip-path: polygon(0 45%, 100% 45%, 100% 50%, 0 50%);
            clip-path: polygon(0 45%, 100% 45%, 100% 50%, 0 50%);
          }
          20% {
            -webkit-clip-path: polygon(0 14%, 100% 14%, 100% 33%, 0 33%);
            clip-path: polygon(0 14%, 100% 14%, 100% 33%, 0 33%);
          }
          21.9% {
            opacity: 1;
            transform: translate3d(calc(-1 * var(--gap-horizontal)), 0, 0);
          }
          22%, 100% {
            opacity: 0;
            transform: translate3d(0, 0, 0);
            -webkit-clip-path: polygon(0 0, 0 0, 0 0, 0 0);
            clip-path: polygon(0 0, 0 0, 0 0, 0 0);
          }
        }

        @keyframes glitch-anim-3 {
          0% {
            opacity: 1;
            transform: translate3d(0, calc(-1 * var(--gap-vertical)), 0);
            -webkit-clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%);
            clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%);
          }
          2% {
            -webkit-clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
            clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
          }
          4% {
            -webkit-clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
            clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
          }
          5% {
            -webkit-clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
            clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
          }
          6% {
            -webkit-clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
            clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
          }
          7% {
            -webkit-clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
            clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
          }
          8% {
            -webkit-clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
            clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
          }
          9% {
            -webkit-clip-path: polygon(0 70%, 100% 70%, 100% 80%, 0 80%);
            clip-path: polygon(0 70%, 100% 70%, 100% 80%, 0 80%);
          }
          9.9% {
            transform: translate3d(0, calc(-1 * var(--gap-vertical)), 0);
          }
          10%, 100% {
            opacity: 0;
            transform: translate3d(0, 0, 0);
            -webkit-clip-path: polygon(0 0, 0 0, 0 0, 0 0);
            clip-path: polygon(0 0, 0 0, 0 0, 0 0);
          }
        }

        @keyframes glitch-anim-text {
          0% {
            transform: translate3d(calc(-1 * var(--gap-horizontal)), 0, 0) scale3d(-1, -1, 1);
            -webkit-clip-path: polygon(0 20%, 100% 20%, 100% 21%, 0 21%);
            clip-path: polygon(0 20%, 100% 20%, 100% 21%, 0 21%);
          }
          2% {
            -webkit-clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
            clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
          }
          4% {
            -webkit-clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
            clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
          }
          5% {
            -webkit-clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
            clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
          }
          6% {
            -webkit-clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
            clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
          }
          7% {
            -webkit-clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
            clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
          }
          8% {
            -webkit-clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
            clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
          }
          9% {
            -webkit-clip-path: polygon(0 70%, 100% 70%, 100% 80%, 0 80%);
            clip-path: polygon(0 70%, 100% 70%, 100% 80%, 0 80%);
          }
          9.9% {
            transform: translate3d(calc(-1 * var(--gap-horizontal)), 0, 0) scale3d(-1, -1, 1);
          }
          10%, 100% {
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
            -webkit-clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
          }
        }

        @keyframes glitch-anim-flash {
          0%, 5% {
            opacity: 0.2;
            transform: translate3d(var(--gap-horizontal), var(--gap-vertical), 0);
          }
          5.5%, 100% {
            opacity: 0;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </Html>
  );
}
