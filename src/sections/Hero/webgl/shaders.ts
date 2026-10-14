/**
 * Full-screen passes for the hero reveal.
 *
 * The ink is a stable-fluids simulation (as on noth.in): the pointer splats
 * velocity and dye, both are advected through the velocity field, and a
 * pressure projection keeps the flow divergence-free, so the dye curls into
 * smooth, smoky swirls. FINAL_FRAG thresholds the dye into a hard-edged mask
 * that shows the 3D scene through the flat white/black title.
 */
export const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Semi-Lagrangian advection. Velocity is in texels of the advected field per
// 60Hz frame, so uDt is the frame time in 60Hz frames. Manual bilinear
// filtering keeps the sample exact whatever the render target's filter.
export const ADVECT_FRAG = /* glsl */ `
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uDt;
uniform float uDissipation;
varying vec2 vUv;
vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize) {
  vec2 st = uv / tsize - 0.5;
  vec2 iuv = floor(st);
  vec2 fuv = fract(st);
  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}
void main() {
  vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexel;
  gl_FragColor = uDissipation * bilerp(uSource, coord, uTexel);
}
`;

// Adds a gaussian blob of uColor at uPoint (velocity or dye).
export const SPLAT_FRAG = /* glsl */ `
uniform sampler2D uTarget;
uniform float uAspect;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform float uRadius;
varying vec2 vUv;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
}
`;

export const DIVERGENCE_FRAG = /* glsl */ `
uniform sampler2D uVelocity;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  float L = texture2D(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}
`;

// One Jacobi iteration of the pressure solve.
export const PRESSURE_FRAG = /* glsl */ `
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float C = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - C) * 0.25, 0.0, 0.0, 1.0);
}
`;

export const GRADIENT_FRAG = /* glsl */ `
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  float L = texture2D(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B) * 0.5;
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

// Flat text everywhere; inside the ink, the nebula behind glass letters.
export const FINAL_FRAG = /* glsl */ `
uniform sampler2D uText;
uniform sampler2D uScene;
uniform float uDark;
// Fades the flat title out as the floating logo lands on the card.
uniform float uTitleFade;
// 0 once all ink has faded: skips the dye and 3D lookups entirely.
uniform float uInk;
uniform sampler2D uDye;
uniform float uRevealSize;
uniform float uEdge;
varying vec2 vUv;

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
vec3 toSRGB(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  float textA = texture2D(uText, vUv).r;
  // White page / black title, easing into a dark card / light title as the
  // hero shrinks on scroll, so the card sits naturally on the dark site.
  vec3 paper = mix(vec3(1.0), vec3(0.045), uDark);
  vec3 title = mix(vec3(0.0), vec3(0.93, 0.93, 0.91), uDark);
  vec3 base = mix(paper, title, textA * (1.0 - uTitleFade));
  if (uInk < 0.5) {
    gl_FragColor = vec4(base, 1.0);
    return;
  }

  // Hard threshold on the dye: a crisp liquid edge, antialiased where the
  // upscaled dye field is steep.
  float raw = texture2D(uDye, vUv).r * uRevealSize;
  float width = max(uEdge, fwidth(raw));
  float reveal = smoothstep(0.5, 0.5 + width, raw);

  vec3 inner = toSRGB(aces(texture2D(uScene, vUv).rgb));
  gl_FragColor = vec4(mix(base, inner, reveal), 1.0);
}
`;
