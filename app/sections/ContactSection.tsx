'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const titleText = '> CONTACT.init';

const socialLinks = [
  { label: 'GitHub', short: 'GH', href: '#' },
  { label: 'LinkedIn', short: 'IN', href: '#' },
  { label: 'Twitter', short: 'TW', href: '#' },
];

export default function ContactSection() {
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
    <div>
      <section ref={sectionRef} className="min-h-screen bg-[#0a0a0a] px-6 py-20 text-zinc-100 md:px-12 lg:px-20">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col justify-center">
          <h2 className="mb-10 font-mono text-4xl font-semibold tracking-tight text-[#00ff88] md:text-6xl">
            {typedTitle}
            <span className="ml-1 animate-pulse text-zinc-300">|</span>
          </h2>

          <form className="space-y-4 rounded-xl border border-zinc-800 bg-[#111111] p-6">
            <input
              type="text"
              placeholder="name"
              className="w-full rounded-md border border-zinc-700 bg-[#0a0a0a] px-4 py-3 font-mono text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-[#00ff88] focus:shadow-[0_0_16px_rgba(0,255,136,0.25)]"
            />
            <input
              type="email"
              placeholder="email"
              className="w-full rounded-md border border-zinc-700 bg-[#0a0a0a] px-4 py-3 font-mono text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-[#00ff88] focus:shadow-[0_0_16px_rgba(0,255,136,0.25)]"
            />
            <textarea
              rows={5}
              placeholder="message"
              className="w-full rounded-md border border-zinc-700 bg-[#0a0a0a] px-4 py-3 font-mono text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-[#00ff88] focus:shadow-[0_0_16px_rgba(0,255,136,0.25)]"
            />
          </form>

          <div className="mt-7 flex items-center gap-3">
            {socialLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ y: -2, boxShadow: '0 0 18px rgba(0,255,136,0.35)' }}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-[#111111] px-3 py-2 font-mono text-xs text-zinc-200 transition-colors hover:border-[#00ff88]"
              >
                <span className="rounded-sm border border-[#00ff88]/40 px-1 text-[#00ff88]">{link.short}</span>
                {link.label}
              </motion.a>
            ))}
          </div>

          <p className="mt-10 font-mono text-xs tracking-widest text-zinc-500">{'> END_OF_FILE'}</p>
        </div>
      </section>
    </div>
  );
}
