# Hoskinson Health Website

[LIVE SITE: Hallmarks of Aging](https://hoskinsonhealth.com/hallmarks-of-aging)

The Hoskinson Health Website is a modern web application built using a TypeScript-based monorepo managed by Turborepo and Yarn.

Core Application (apps/web):
This is the main user-facing website, built with Next.js, styled with Tailwind CSS.
Content is dynamically managed via a headless CMS, Sanity.io.
It supports internationalization (i18n) for multi-language capabilities.

Shared Packages (packages/):

@hoskinson-health-website/webgl-longevity: This package provides sophisticated, interactive WebGL-based particle visualizations using Vertex Animation Textures to drive the animations. It leverages React Three Fiber and Three.js, using custom GLSL shaders for high-performance graphics. It includes leva for real-time parameter tuning during development and zustand for local state management of the WebGL component.

@hoskinson-health-website/icons: A shared React library for a consistent icon system across the application.

Key Technologies & Architecture:
Frontend: Next.js, React, Tailwind CSS.
WebGL/3D: Three.js, React Three Fiber, GLSL shaders.
Content: Sanity.io (headless CMS).

Build & Workflow: Turborepo, Yarn, TypeScript, ESLint, Prettier.
