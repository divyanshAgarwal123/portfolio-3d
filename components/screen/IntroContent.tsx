'use client';

import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

export default function IntroContent() {
  return (
    <Html transform position={[0, 0, 0.001]}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ width: 1000, height: 620, position: 'relative' }}
      >
        <div className="intro-crt-screen">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="status-row"
          >
            <span>&gt; SYSTEM ONLINE</span>
            <span className="cursor">_</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="profile-wrap"
          >
            <div className="profile-ring">
              <img src="/me.jpg" alt="Profile placeholder" className="profile-image" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className="name-wrap"
          >
            <p className="typing name">DIVYANSH AGARWAL</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55 }}
            className="designation-wrap"
          >
            <p className="typing designation">FULL STACK DEVELOPER</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.75 }}
            className="footer-row"
          >
            <span>&gt; PORTFOLIO_v1.0</span>
          </motion.div>

          <div className="scanlines" />
        </div>
      </motion.div>

      <style jsx>{`
        .intro-crt-screen {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000000;
          color: #00ff88;
          font-family: 'Courier New', Courier, monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          text-shadow: 0 0 6px rgba(0, 255, 136, 0.45);
          animation: flicker 4s infinite;
        }

        .status-row {
          position: absolute;
          top: 24px;
          left: 24px;
          font-size: 18px;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 2;
        }

        .cursor {
          animation: blink 0.9s step-end infinite;
        }

        .profile-wrap {
          z-index: 2;
        }

        .profile-ring {
          width: 180px;
          height: 180px;
          border-radius: 9999px;
          border: 2px solid #00ff88;
          box-shadow: 0 0 20px #00ff88;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 255, 136, 0.06);
        }

        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(15%);
        }

        .name-wrap,
        .designation-wrap {
          width: 80%;
          text-align: center;
          z-index: 2;
        }

        .name-wrap {
          margin-top: 26px;
        }

        .designation-wrap {
          margin-top: 12px;
        }

        .typing {
          margin: 0 auto;
          white-space: nowrap;
          overflow: hidden;
          width: 0;
          border-right: 2px solid #00ff88;
        }

        .name {
          font-size: 44px;
          font-weight: 700;
          letter-spacing: 2px;
          animation: typing-name 1.5s steps(17, end) forwards, blink 0.9s step-end infinite;
        }

        .designation {
          font-size: 24px;
          letter-spacing: 1px;
          opacity: 0.95;
          animation: typing-designation 1.5s steps(20, end) 3s forwards, blink 0.9s step-end 3s infinite;
        }

        .footer-row {
          position: absolute;
          right: 24px;
          bottom: 20px;
          font-size: 16px;
          letter-spacing: 1px;
          z-index: 2;
        }

        .scanlines {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.15) 0px,
            rgba(0, 0, 0, 0.15) 1px,
            rgba(0, 0, 0, 0) 3px
          );
          mix-blend-mode: normal;
        }

        @keyframes blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }

        @keyframes typing-name {
          from {
            width: 0;
          }
          to {
            width: 17ch;
          }
        }

        @keyframes typing-designation {
          from {
            width: 0;
          }
          to {
            width: 20ch;
          }
        }

        @keyframes flicker {
          0%,
          13%,
          14.5%,
          41%,
          42.5%,
          67%,
          68.25%,
          100% {
            opacity: 1;
          }
          13.5%,
          42%,
          67.5% {
            opacity: 0.97;
          }
        }
      `}</style>
    </Html>
  );
}
