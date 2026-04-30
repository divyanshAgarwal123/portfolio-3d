'use client';

import { useEffect, useState } from 'react';
import AboutSection from './AboutSection';
import ContactSection from './ContactSection';
import ProjectsSection from './ProjectsSection';
import SkillsSection from './SkillsSection';

function Divider() {
  return <div className="mx-auto h-px w-full max-w-6xl bg-[#00ff88]/70 shadow-[0_0_16px_rgba(0,255,136,0.45)]" />;
}

export default function SectionsStack() {
  const [isLaptopOpen, setIsLaptopOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsLaptopOpen(true);
    const handleClose = () => setIsLaptopOpen(false);

    window.addEventListener('laptop-lid-open', handleOpen);
    window.addEventListener('laptop-lid-close', handleClose);

    return () => {
      window.removeEventListener('laptop-lid-open', handleOpen);
      window.removeEventListener('laptop-lid-close', handleClose);
    };
  }, []);

  return (
    <div
      className={`relative z-10 bg-[#0a0a0a] text-zinc-100 transition-opacity duration-500 ${
        isLaptopOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!isLaptopOpen}
    >
      <AboutSection />
      <Divider />
      <ProjectsSection />
      <Divider />
      <SkillsSection />
      <Divider />
      <ContactSection />
    </div>
  );
}
