'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const titleText = '> WHO_AM_I.exe';
const bioLines = [
  'I build immersive interfaces where code feels tactile and stories unfold through motion.',
  'My focus is high-performance frontend systems, 3D interaction, and product experiences that feel alive.',
  'I care about elegant architecture, clear DX, and details users can feel before they can explain.',
];

const skills = ['TypeScript', 'Next.js', 'React Three Fiber', 'GSAP', 'Framer Motion', 'Tailwind CSS'];
const tickerItems = ['▲ Next.js', '⚛ React', '◉ Three.js', '▣ Framer Motion', '◎ Tailwind', '✦ GSAP'];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [typedTitle, setTypedTitle] = useState('');

  useEffect(() => {
    if (!isInView) return;
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedTitle(titleText.slice(0, index));
      if (index >= titleText.length) {
        clearInterval(interval);
      }
    }, 70);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.75, ease: 'easeOut' }}
    >
      <section ref={sectionRef} className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-zinc-100 md:px-12 lg:px-20">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col justify-center gap-12">
          <h2 className="font-mono text-4xl font-semibold tracking-tight text-[#00ff88] md:text-6xl">
            {typedTitle}
            <span className="ml-1 animate-pulse text-zinc-300">|</span>
          </h2>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-4">
              {bioLines.map((line, lineIndex) => (
                <motion.p
                  key={line}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  variants={{
                    visible: {
                      transition: { delayChildren: lineIndex * 0.24, staggerChildren: 0.045 },
                    },
                  }}
                  className="text-base leading-relaxed text-zinc-300 md:text-lg"
                >
                  {line.split(' ').map((word) => (
                    <motion.span
                      key={`${line}-${word}`}
                      className="mr-1 inline-block"
                      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                      transition={{ duration: 0.32, ease: 'easeOut' }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.p>
              ))}
            </div>

            <div className="flex flex-wrap content-start gap-3">
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, y: 14 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                  transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                  className="rounded-md border border-[#00ff88]/40 bg-[#0f0f0f] px-4 py-2 font-mono text-sm text-[#00ff88] shadow-[0_0_18px_rgba(0,255,136,0.18)]"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 overflow-hidden border-t border-[#00ff88]/30">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="flex w-max items-center gap-8 py-4 font-mono text-sm text-zinc-300"
          >
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <span key={`${item}-${idx}`} className="whitespace-nowrap">
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
