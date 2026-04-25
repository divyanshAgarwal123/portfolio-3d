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
        if (!(node instanceof HTMLElement)) return false;

        if (node.tagName === 'CANVAS') return true;

        let current: HTMLElement | null = node;
        while (current) {
          const style = window.getComputedStyle(current);
          if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
            return true;
          }
          current = current.parentElement;
        }

        return false;
      },
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);

    return () => {
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
