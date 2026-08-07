// src/utils/constants.ts

/* =====================================================
   ANIMATION
===================================================== */

export const ANIMATION = {
  duration: 0.8,
  fast: 0.4,
  slow: 1.2,
  stagger: 0.08,

  ease: "power3.out",
  easeIn: "power3.in",
  easeInOut: "power3.inOut",
  smooth: "power2.out",
} as const;

/* =====================================================
   BREAKPOINTS
===================================================== */

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1440,
} as const;

/* =====================================================
   COLORS
===================================================== */

export const COLORS = {
  background: "#050505",
  surface: "#111111",
  white: "#ffffff",
  text: "#f5f5f5",
  textDim: "#adada8",
  border: "rgba(255,255,255,.08)",
} as const;

/* =====================================================
   HERO
===================================================== */

export const HERO = {
  shrinkScale: 0.45,
  borderRadius: 24,
  logoSize: 300,
  marqueeSpeed: 24,
} as const;

/* =====================================================
   NAVBAR
===================================================== */

export const NAVBAR = {
  height: 80,
} as const;

/* =====================================================
   Z INDEX
===================================================== */

export const Z = {
  loader: 9999,
  navbar: 100,
  heroLogo: 30,
  heroContent: 20,
  heroVideo: 10,
} as const;

/* =====================================================
   SPACING
===================================================== */

export const SPACING = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 40,
  xl: 64,
  xxl: 96,
} as const;
