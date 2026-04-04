---
name: threejs-scene
description: Use this skill whenever working on Three.js, 
React Three Fiber, scroll animations, or 3D model loading.
---
# 3D Scene Rules

- Always use Draco compression for GLB loading via Drei
- Wrap all Canvas in Suspense with a loading fallback
- Use useScroll from Drei for scroll-driven animations, not GSAP
- GSAP is for HTML/CSS overlays only
- White background always: #ffffff
- Check Context7 MCP for current R3F APIs before writing
- Lid mesh on laptop is named "Lid" — rotate on X axis only
