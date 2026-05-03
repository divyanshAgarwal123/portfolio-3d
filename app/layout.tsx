'use client';

import Lenis from 'lenis';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import gsap from 'gsap';
import './globals.css';
import { useSceneStore } from '../store/useSceneStore';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const phase = useSceneStore((state) => state.phase);

  useEffect(() => {
    const lenis = new Lenis({
      prevent: (node) => {
        // Only prevent Lenis from intercepting scroll on the canvas itself
        if (node instanceof HTMLCanvasElement) return true;
        return false;
      },
    });

    (window as typeof window & { __lenis?: Lenis }).__lenis = lenis;

    // Start Lenis in a stopped state — reveal sequence enables scrolling
    lenis.stop();

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      (window as typeof window & { __lenis?: Lenis }).__lenis = undefined;
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const lenis = (window as typeof window & { __lenis?: Lenis }).__lenis;
    if (!lenis) return;
    if (phase === 'revealed') {
      lenis.start();
    } else {
      lenis.stop();
    }
  }, [phase]);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>{children}</body>
    </html>
  );
}
