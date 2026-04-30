'use client';

import Lenis from 'lenis';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import gsap from 'gsap';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const lenis = new Lenis({
      prevent: (node) => {
        // Only prevent Lenis from intercepting scroll on the canvas itself
        if (node instanceof HTMLCanvasElement) return true;
        return false;
      },
    });

    // Start Lenis in a stopped state — lid animation handles scroll first
    lenis.stop();

    const onLidOpen = () => {
      lenis.start();
    };
    window.addEventListener('laptop-lid-open', onLidOpen);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('laptop-lid-open', onLidOpen);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>{children}</body>
    </html>
  );
}
