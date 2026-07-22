// src/utils/math.js

/**
 * Clamps a number between min and max.
 */
export function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation.
 * Example:
 * lerp(0, 100, 0.5) -> 50
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Smoothstep interpolation.
 * Produces a smooth ease-in/ease-out transition.
 */
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Maps a value from one range to another.
 */
export function mapRange(
  value,
  inMin,
  inMax,
  outMin,
  outMax
) {
  return (
    outMin +
    ((value - inMin) * (outMax - outMin)) /
      (inMax - inMin)
  );
}

/**
 * Normalize a value to 0-1.
 */
export function normalize(value, min, max) {
  return (value - min) / (max - min);
}

/**
 * Degrees → Radians.
 */
export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Radians → Degrees.
 */
export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}