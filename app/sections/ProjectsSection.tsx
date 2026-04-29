'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const titleText = '> PROJECTS.log';

const projects = [
  {
    name: 'Chronicle Studio',
    description: 'An immersive storytelling interface with scroll-driven narrative transitions and rich motion states.',
    stack: ['Next.js', 'TypeScript', 'Framer Motion'],
  },
  {
    name: 'Neon Commerce',
    description: 'A high-converting product experience focused on speed, interaction polish, and smart checkout UX.',
    stack: ['React', 'Tailwind CSS', 'Node.js'],
  },
  {
    name: 'Pulse Dashboard',
    description: 'A real-time monitoring dashboard that translates dense technical data into elegant visual signals.',
    stack: ['Next.js', 'Zustand', 'WebSockets'],
  },
];

export default function ProjectsSection() {
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
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="mb-12 font-mono text-4xl font-semibold tracking-tight text-[#00ff88] md:text-6xl">
            {typedTitle}
            <span className="ml-1 animate-pulse text-zinc-300">|</span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.article
                key={project.name}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.55, delay: index * 0.15, ease: 'easeOut' }}
                whileHover={{ y: -8, borderColor: 'rgba(124,58,237,0.85)', boxShadow: '0 0 28px rgba(124,58,237,0.28)' }}
                className="flex h-full flex-col rounded-xl border border-zinc-800 bg-[#111111] p-6"
              >
                <h3 className="mb-3 font-mono text-xl text-zinc-100">{project.name}</h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-zinc-400">{project.description}</p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-[#00ff88]/25 bg-[#0a0a0a] px-2.5 py-1 font-mono text-xs text-[#00ff88]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <motion.button
                  whileHover={{ boxShadow: '0 0 18px rgba(124,58,237,0.4)' }}
                  className="w-fit rounded-md border border-[#7c3aed]/60 px-4 py-2 font-mono text-sm text-zinc-100 transition-colors hover:bg-[#7c3aed]/10"
                >
                  view
                </motion.button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
