'use client';

import { Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';

export default function IntroContent() {
  const [showName, setShowName] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showFooter, setShowFooter] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    const t1 = setTimeout(() => setShowName(true), 200);
    const t2 = setTimeout(() => setShowRole(true), 1800);
    const t3 = setTimeout(() => setShowFooter(true), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <Html
      center
      position={[0, 0, 0.001]}
      className="pointer-events-none"
      zIndexRange={[100, 0]}
    >
      <div className="intro-screen">
        <div className="status-bar">
          <span className="status-text">&gt; SYSTEM ONLINE</span>
          <span className="cursor-blink">_</span>
        </div>

        <div className="profile-area">
          <div className="photo-ring">
            <div className="photo-glow" />
            <img
              src="/me.jpg"
              alt="Divyansh Agarwal"
              className="photo"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'photo-fallback';
                  fallback.textContent = 'DA';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        </div>

        <div className="name-area">
          {showName && (
            <h1 className="name-text">
              Hey, I&apos;m <span className="name-highlight">Divyansh</span>
            </h1>
          )}
        </div>

        <div className="role-area">
          {showRole && <p className="role-text">FULL STACK DEVELOPER</p>}
        </div>

        <div className="greeting-area">
          {showRole && <p className="greeting-text">Nice to meet you.</p>}
        </div>

        {showFooter && (
          <div className="footer-bar">
            <span>&gt; PORTFOLIO_v1.0</span>
          </div>
        )}

        <div className="scanlines-overlay" />
      </div>

      <style jsx>{`
        .intro-screen {
          position: relative;
          width: var(--laptop-screen-width, 280px);
          height: var(--laptop-screen-height, 175px);
          background: #000;
          color: #00ff88;
          font-family: 'Courier New', Courier, monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          text-shadow: 0 0 4px rgba(0, 255, 136, 0.5);
          animation: crt-flicker 4s infinite;
          border-radius: 4px;
          transform: translate3d(
              var(--laptop-screen-offset-x, 0px),
              var(--laptop-screen-offset-y, 0px),
              var(--laptop-screen-offset-z, 0px)
            )
            scale(var(--laptop-screen-scale, 1));
          transform-origin: center;
        }

        .status-bar {
          position: absolute;
          top: 8px;
          left: 10px;
          font-size: 7px;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 1px;
          z-index: 2;
          animation: fade-in 0.5s ease-out;
        }

        .cursor-blink { animation: blink 0.85s step-end infinite; }

        .profile-area {
          z-index: 2;
          margin-bottom: 6px;
          animation: fade-scale-in 0.6s ease-out 0.1s both;
        }

        .photo-ring {
          position: relative;
          width: 45px;
          height: 45px;
          border-radius: 9999px;
          border: 1px solid #00ff88;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 255, 136, 0.04);
        }

        .photo-glow {
          position: absolute;
          inset: -3px;
          border-radius: 9999px;
          border: 1px solid rgba(0, 255, 136, 0.3);
          box-shadow: 0 0 8px rgba(0, 255, 136, 0.35), 0 0 16px rgba(0, 255, 136, 0.15);
          animation: glow-pulse 2.5s ease-in-out infinite;
        }

        .photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(15%) brightness(1.05);
          border-radius: 9999px;
        }

        .photo-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: #00ff88;
          background: linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05));
          border-radius: 9999px;
        }

        .name-area { z-index: 2; min-height: 14px; }

        .name-text {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.5px;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          width: 0;
          border-right: 1px solid #00ff88;
          animation: type-name 1.2s steps(20, end) forwards, blink 0.85s step-end infinite;
        }

        .name-highlight {
          font-weight: 700;
          text-shadow: 0 0 6px rgba(0, 255, 136, 0.7);
        }

        .role-area { z-index: 2; min-height: 10px; margin-top: 3px; }

        .role-text {
          font-size: 7px;
          letter-spacing: 1.5px;
          opacity: 0.9;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          width: 0;
          border-right: 1px solid #00ff88;
          animation: type-role 1.2s steps(20, end) forwards, blink 0.85s step-end infinite;
        }

        .greeting-area { z-index: 2; min-height: 10px; margin-top: 4px; }

        .greeting-text {
          font-size: 7px;
          opacity: 0;
          margin: 0;
          letter-spacing: 0.5px;
          color: rgba(0, 255, 136, 0.7);
          animation: fade-in 0.8s ease-out 0.6s forwards;
        }

        .footer-bar {
          position: absolute;
          right: 10px;
          bottom: 6px;
          font-size: 6px;
          letter-spacing: 0.5px;
          z-index: 2;
          opacity: 0.7;
          animation: fade-in 0.5s ease-out;
        }

        .scanlines-overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: repeating-linear-gradient(to bottom, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px);
        }

        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes type-name { from { width: 0; } to { width: 20ch; } }
        @keyframes type-role { from { width: 0; } to { width: 20ch; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-scale-in { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(0,255,136,0.35), 0 0 16px rgba(0,255,136,0.15); }
          50% { box-shadow: 0 0 12px rgba(0,255,136,0.5), 0 0 24px rgba(0,255,136,0.25); }
        }
        @keyframes crt-flicker {
          0%, 13%, 14.5%, 41%, 42.5%, 67%, 68.25%, 100% { opacity: 1; }
          13.5%, 42%, 67.5% { opacity: 0.97; }
        }
      `}</style>
    </Html>
  );
}
