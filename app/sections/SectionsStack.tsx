'use client';

import AboutSection from './AboutSection';
import ContactSection from './ContactSection';
import ProjectsSection from './ProjectsSection';
import SkillsSection from './SkillsSection';

function Divider() {
  return <div className="mx-auto h-px w-full max-w-6xl bg-[#00ff88]/70 shadow-[0_0_16px_rgba(0,255,136,0.45)]" />;
}

export default function SectionsStack() {
  return (
    <div className="relative z-10 bg-[#0a0a0a] text-zinc-100">
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
