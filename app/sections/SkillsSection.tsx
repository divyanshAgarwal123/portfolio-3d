'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

const titleText = '> SKILLS.json';

const skillGroups = {
  Frontend: [
    { name: 'React', level: 92 },
    { name: 'Next.js', level: 90 },
    { name: 'TypeScript', level: 88 },
  ],
  Backend: [
    { name: 'Node.js', level: 82 },
    { name: 'APIs', level: 86 },
    { name: 'SQL', level: 78 },
  ],
  Tools: [
    { name: 'GitHub', level: 90 },
    { name: 'Docker', level: 72 },
    { name: 'Figma', level: 76 },
  ],
};

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [typedTitle, setTypedTitle] = useState('');
  const [typedJson, setTypedJson] = useState('');

  const jsonSnippet = useMemo(
    () =>
      `{
  "Frontend": ["React", "Next.js", "TypeScript"],
  "Backend": ["Node.js", "APIs", "SQL"],
  "Tools": ["GitHub", "Docker", "Figma"]
}`,
    [],
  );

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

  useEffect(() => {
    if (!isInView) return;
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedJson(jsonSnippet.slice(0, index));
      if (index >= jsonSnippet.length) {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [isInView, jsonSnippet]);

  return (
    <div>
      <section ref={sectionRef} className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-zinc-100 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="mb-10 font-mono text-4xl font-semibold tracking-tight text-[#00ff88] md:text-6xl">
            {typedTitle}
            <span className="ml-1 animate-pulse text-zinc-300">|</span>
          </h2>

          <div className="mb-10 rounded-xl border border-zinc-800 bg-[#111111] p-6">
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-[#7c3aed] md:text-base">
              {typedJson}
              <span className="ml-1 animate-pulse text-zinc-400">|</span>
            </pre>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {Object.entries(skillGroups).map(([category, skills], categoryIndex) => (
              <div key={category} className="rounded-xl border border-zinc-800 bg-[#111111] p-5">
                <h3 className="mb-4 font-mono text-lg text-zinc-100">{category}</h3>
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={skill.name}>
                      <div className="mb-1 flex items-center justify-between font-mono text-xs text-zinc-300">
                        <span>{skill.name}</span>
                        <span>{skill.level}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true, margin: '-100px' }}
                          transition={{
                            duration: 0.8,
                            delay: categoryIndex * 0.14 + index * 0.1,
                            ease: 'easeOut',
                          }}
                          className="h-full rounded-full bg-[#00ff88]/80"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
