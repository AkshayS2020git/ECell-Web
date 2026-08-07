// src/utils/gsapSetup.ts
// Centralized GSAP + ScrollTrigger registration.
// Import this file once (e.g., from page.tsx) instead of calling
// gsap.registerPlugin(ScrollTrigger) in every component file.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
