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

    // Staggered reveal — name first, then role, then footer
    const t1 = setTimeout(() => setShowName(true), 200);
    const t2 = setTimeout(() => setShowRole(true), 1800);
    const t3 = setTimeout(() => setShowFooter(true), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <Html
      transform
      center
      position={[0, 0, 0.001]}
      distanceFactor={1}
      className="pointer-events-none"
    >
      <div className="intro-screen">
        {/* Status header */}
        <div className="status-bar">
          <span className="status-text">&gt; SYSTEM ONLINE</span>
          <span className="cursor-blink">_</span>
        </div>

        {/* Profile photo ring */}
        <div className="profile-area">
          <div className="photo-ring">
            <div className="photo-glow" />
            <img
              src="/me.jpg"
              alt="Divyansh Agarwal"
              className="photo"
              onError={(e) => {
                // Fallback: hide broken image, show initials
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

        {/* Name — typewriter animation */}
        <div className="name-area">
          {showName && (
            <h1 className="name-text">
              Hey, I&apos;m <span className="name-highlight">Divyansh</span>
            </h1>
          )}
        </div>

        {/* Role — second typewriter */}
        <div className="role-area">
          {showRole && <p className="role-text">FULL STACK DEVELOPER</p>}
        </div>

        {/* Greeting line */}
        <div className="greeting-area">
          {showRole && <p className="greeting-text">Nice to meet you.</p>}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="footer-bar">
            <span>&gt; PORTFOLIO_v1.0</span>
          </div>
        )}

        {/* Persistent scanlines */}
        <div className="scanlines-overlay" />
      </div>

      <style jsx>{`
        .intro-screen {
          position: relative;
          width: 900px;
          height: 540px;
          background: #000;
          color: #00ff88;
          font-family: 'Courier New', Courier, monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          text-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
          animation: crt-flicker 4s infinite;
        }

        /* ── Status Bar ── */
        .status-bar {
          position: absolute;
          top: 20px;
          left: 24px;
          font-size: 16px;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          gap: 2px;
          z-index: 2;
          animation: fade-in 0.5s ease-out;
        }

        .status-text {
          opacity: 0.9;
        }

        .cursor-blink {
          animation: blink 0.85s step-end infinite;
        }

        /* ── Profile Photo ── */
        .profile-area {
          z-index: 2;
          margin-bottom: 20px;
          animation: fade-scale-in 0.6s ease-out 0.1s both;
        }

        .photo-ring {
          position: relative;
          width: 140px;
          height: 140px;
          border-radius: 9999px;
          border: 2px solid #00ff88;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 255, 136, 0.04);
        }

        .photo-glow {
          position: absolute;
          inset: -6px;
          border-radius: 9999px;
          border: 1px solid rgba(0, 255, 136, 0.3);
          box-shadow: 0 0 24px rgba(0, 255, 136, 0.35),
                      0 0 48px rgba(0, 255, 136, 0.15),
                      inset 0 0 16px rgba(0, 255, 136, 0.1);
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
          font-size: 48px;
          font-weight: 700;
          color: #00ff88;
          background: linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05));
          border-radius: 9999px;
        }

        /* ── Name ── */
        .name-area {
          z-index: 2;
          min-height: 52px;
        }

        .name-text {
          font-size: 36px;
          font-weight: 400;
          letter-spacing: 1px;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          width: 0;
          border-right: 2px solid #00ff88;
          animation: type-name 1.2s steps(20, end) forwards,
                     blink 0.85s step-end infinite;
        }

        .name-highlight {
          font-weight: 700;
          text-shadow: 0 0 12px rgba(0, 255, 136, 0.7);
        }

        /* ── Role ── */
        .role-area {
          z-index: 2;
          min-height: 32px;
          margin-top: 10px;
        }

        .role-text {
          font-size: 22px;
          letter-spacing: 3px;
          opacity: 0.9;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          width: 0;
          border-right: 2px solid #00ff88;
          animation: type-role 1.2s steps(20, end) forwards,
                     blink 0.85s step-end infinite;
        }

        /* ── Greeting ── */
        .greeting-area {
          z-index: 2;
          min-height: 24px;
          margin-top: 14px;
        }

        .greeting-text {
          font-size: 18px;
          opacity: 0;
          margin: 0;
          letter-spacing: 1px;
          color: rgba(0, 255, 136, 0.7);
          animation: fade-in 0.8s ease-out 0.6s forwards;
        }

        /* ── Footer ── */
        .footer-bar {
          position: absolute;
          right: 24px;
          bottom: 18px;
          font-size: 14px;
          letter-spacing: 1.5px;
          z-index: 2;
          opacity: 0.7;
          animation: fade-in 0.5s ease-out;
        }

        /* ── Scanlines (persistent) ── */
        .scanlines-overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.12) 0px,
            rgba(0, 0, 0, 0.12) 1px,
            transparent 1px,
            transparent 3px
          );
        }

        /* ── Keyframes ── */
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        @keyframes type-name {
          from { width: 0; }
          to { width: 20ch; }
        }

        @keyframes type-role {
          from { width: 0; }
          to { width: 20ch; }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-scale-in {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 24px rgba(0, 255, 136, 0.35),
                        0 0 48px rgba(0, 255, 136, 0.15),
                        inset 0 0 16px rgba(0, 255, 136, 0.1);
          }
          50% {
            box-shadow: 0 0 32px rgba(0, 255, 136, 0.5),
                        0 0 64px rgba(0, 255, 136, 0.25),
                        inset 0 0 24px rgba(0, 255, 136, 0.15);
          }
        }

        @keyframes crt-flicker {
          0%, 13%, 14.5%, 41%, 42.5%, 67%, 68.25%, 100% { opacity: 1; }
          13.5%, 42%, 67.5% { opacity: 0.97; }
        }
      `}</style>
    </Html>
  );
}
