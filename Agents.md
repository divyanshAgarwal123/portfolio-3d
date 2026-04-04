# 3D Portfolio — Agent Rules

## Project Overview
An immersive 3D portfolio website built with Next.js 14, 
React Three Fiber, Drei, and GSAP ScrollTrigger.
White background, professional aesthetic.
3D models: laptop.glb (lid mesh = "Lid"), robot.glb (idle animation at clip[0]).

## Tech Stack
- Framework: Next.js 14 App Router
- 3D: React Three Fiber + Drei
- Animation: GSAP ScrollTrigger
- Styling: Tailwind CSS
- Hosting: Firebase
- Version Control: GitHub

## Code Rules
- Always use TypeScript
- All 3D components go in /components/three/
- All page sections go in /components/sections/
- Never hardcode colors — use Tailwind classes only
- Always compress GLB models before loading (use Draco decoder from Drei)
- Always wrap canvas in <Suspense> with a loading fallback
- Never use deprecated Three.js APIs — check Context7 MCP for current docs

## Behavior Rules
- Plan before coding. Use Sequential Thinking MCP for any task
  involving 3D scene changes or scroll animations.
- Build one feature at a time. Do not chain more than 3 file edits
  without pausing for my review.
- Do not run automated tests. I will test manually.
- Do not install new packages without telling me first and waiting
  for approval.
- If you are unsure about a Three.js or R3F API, query Context7
  before writing the code.

## GitHub Rules — CRITICAL
After every major update, you MUST:
1. Stage all changed files with git add .
2. Write a clear commit message in this format:
   feat: [what was built]
   fix: [what was fixed] 
   chore: [setup/config changes]
3. Commit and push to the main branch via the GitHub MCP.
4. Tell me the commit was pushed and show me the commit message.

A "major update" is defined as:
- Any new component added
- Any 3D scene change (lighting, model position, animation)
- Any scroll behavior added or modified
- Any deployment to Firebase

## Scene Rules
- Background: pure white (#ffffff), no exceptions
- No dark mode
- Lighting: ambient (intensity 0.8) + directional from (5, 5, 3) at intensity 1.2
- Camera: perspective, fov 45, initial position z=6
- No post-processing on initial load
- Robots always behind the laptop in Z-axis

## Do NOT Ever
- Use scroll-jacking that breaks native browser scroll
- Add random floating animations that weren't asked for
- Change the background color
- Push broken/incomplete code to GitHub
- Use Three.js r < 150 APIs