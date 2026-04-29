'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

const headingTarget = '> WHO_AM_I.exe';

const bioLines = [
  'I build immersive interfaces where storytelling, motion, and code feel like one language.',
  'My focus is crafting premium web experiences with precise interaction design and clean architecture.',
  'I care about details that users feel before they notice: rhythm, depth, and atmosphere.',
];

const skills = [
  'React',
  'Next.js',
  'TypeScript',
  'Three.js',
  'Tailwind CSS',
  'Framer Motion',
  'GSAP',
  'Node.js',
];

const stackTicker = [
  '⚛ React',
  '▲ Next.js',
  '🟦 TypeScript',
  '🎨 Tailwind',
  '🧠 Framer Motion',
  '🧩 Three.js',
  '🎬 GSAP',
  '🛠 GitHub',
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [typedHeading, setTypedHeading] = useState('');

  useEffect(() => {
    if (!inView) return;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedHeading(headingTarget.slice(0, index));
      if (index >= headingTarget.length) window.clearInterval(timer);
    }, 80);

    return () => window.clearInterval(timer);
  }, [inView]);

  const tickerItems = useMemo(() => [...stackTicker, ...stackTicker], []);

  return (
    <motion.section
      ref={sectionRef}
      className="relative min-h-screen bg-[#0a0a0a] px-6 py-20 text-zinc-100 md:px-12 lg:px-20"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col justify-between gap-14">
        <div className="space-y-10">
          <h2 className="font-mono text-3xl font-semibold tracking-wide text-[#00ff88] md:text-5xl">
            {typedHeading}
            <span className="ml-1 inline-block h-8 w-[2px] animate-pulse bg-[#00ff88] align-middle md:h-10" />
          </h2>

          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            <div className="space-y-5">
              {bioLines.map((line, lineIndex) => (
                <p key={line} className="font-mono text-base leading-8 text-zinc-300 md:text-lg">
                  {line.split(' ').map((word, wordIndex) => (
                    <motion.span
                      key={`${lineIndex}-${word}`}
                      className="mr-2 inline-block"
                      initial={{ opacity: 0, y: 8 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.45,
                        delay: lineIndex * 0.35 + wordIndex * 0.04,
                        ease: 'easeOut',
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </p>
              ))}
            </div>

            <div className="flex flex-wrap content-start gap-3">
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  className="rounded-md border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2 font-mono text-sm text-[#b9ffd6] shadow-[0_0_0px_rgba(0,255,136,0)]"
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    boxShadow: '0 0 22px rgba(0,255,136,0.26)',
                  }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-md border border-[#00ff88]/30 bg-black/30 py-3">
          <motion.div
            className="flex w-max gap-10 whitespace-nowrap px-5 font-mono text-sm text-zinc-300"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
          >
            {tickerItems.map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
