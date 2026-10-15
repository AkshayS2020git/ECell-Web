/** Lays out and rasterises the big flat "ECELL RVU" title. */

// One line on landscape screens, stacked on portrait ones.
const LINES_WIDE = ["ECELL RVU"];
const LINES_NARROW = ["ECELL", "RVU"];

export interface Glyph {
  char: string;
  x: number; // left of the advance box, CSS px
  y: number; // baseline, CSS px
}

export interface Layout {
  size: number;
  font: string;
  glyphs: Glyph[];
  /** Ink right edge of the last line, CSS px from the left. */
  right: number;
  /** Baseline of the last line, CSS px from the top. */
  baseline: number;
}

export function layoutText(w: number, h: number, family: string): Layout {
  const ctx = document.createElement("canvas").getContext("2d")!;
  const lines = w / h < 1 ? LINES_NARROW : LINES_WIDE;
  const fontAt = (s: number) => `900 ${s}px ${family}, Archivo, "Arial Black", sans-serif`;
  const trackingEm = -0.035;

  const lineWidth = (line: string, s: number) => {
    ctx.font = fontAt(s);
    let total = 0;
    for (const ch of line) total += ctx.measureText(ch).width + trackingEm * s;
    return total - trackingEm * s;
  };

  const pad = Math.max(w * 0.0125, 12);
  const lineHeight = 0.86;
  const widest = Math.max(...lines.map((l) => lineWidth(l, 100)));
  let size = ((w - pad * 2) / widest) * 100;
  size = Math.min(size, (h * 0.62) / (lines.length * lineHeight));

  const font = fontAt(size);
  ctx.font = font;
  const capH = ctx.measureText("E").actualBoundingBoxAscent || size * 0.72;
  const step = size * lineHeight;
  const blockH = capH + step * (lines.length - 1);
  const tracking = trackingEm * size;

  const glyphs: Glyph[] = [];
  let y = (h - blockH) / 2 + capH;
  for (const line of lines) {
    let x = (w - lineWidth(line, size)) / 2;
    for (const ch of line) {
      glyphs.push({ char: ch, x, y });
      x += ctx.measureText(ch).width + tracking;
    }
    y += step;
  }
  const last = glyphs[glyphs.length - 1];
  const right = last.x + ctx.measureText(last.char).actualBoundingBoxRight;
  return { size, font, glyphs, right, baseline: last.y };
}

/** The credit under the title, and the easter egg the ink uncovers in its place. */
export const CREDIT_TEXT = "Built by ECell Tech Team";
export const CREDIT_SECRET = "Best team ever. We voted.";

/**
 * Rasterises the flat layer into separate channels so the ink can treat each
 * on its own: R the title, G the "—— BUILT BY ECELL TECH TEAM" credit, B the
 * easter egg hidden under the credit (with its glow).
 */
export function drawFlatText(
  canvas: HTMLCanvasElement,
  layout: Layout,
  cssW: number,
  cssH: number,
  scale: number,
  creditFamily: string,
) {
  canvas.width = Math.max(2, Math.round(cssW * scale));
  canvas.height = Math.max(2, Math.round(cssH * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(scale, scale);
  // Additive, so a channel never punches a hole in another.
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "#f00";
  ctx.font = layout.font;
  ctx.textBaseline = "alphabetic";
  for (const g of layout.glyphs) ctx.fillText(g.char, g.x, g.y);

  // Credit: right-aligned just under the end of the title, small and tracked.
  const size = Math.min(15, Math.max(10, layout.size * 0.042));
  const top = layout.baseline + layout.size * 0.13;
  const middle = top + size / 2;
  const right = layout.right;
  const pad = Math.max(cssW * 0.0125, 12);
  const fontAt = (s: number) => `600 ${s}px ${creditFamily}, -apple-system, BlinkMacSystemFont, sans-serif`;

  // "—— TEXT" in the credit style: tracked caps after a short rule, ending at
  // `right`. Shrinks (never grows) to fit narrow screens.
  const drawCreditLine = (text: string) => {
    const chars = [...text.toUpperCase()];
    // Every letter carries its tracking, the last one too (as CSS does).
    const widthAt = (s: number) => {
      ctx.font = fontAt(s);
      return chars.reduce((w, ch) => w + ctx.measureText(ch).width + s * 0.22, 0) + s * 4.1;
    };
    const s = Math.min(size, size * ((right - pad) / widthAt(size)));
    const textW = widthAt(s) - s * 4.1;
    const metrics = ctx.measureText("B");
    const ascent = metrics.fontBoundingBoxAscent || s * 0.97;
    const descent = metrics.fontBoundingBoxDescent || s * 0.24;
    const baseline = middle - (ascent + descent) / 2 + ascent;
    let x = right - textW;
    for (const ch of chars) {
      ctx.fillText(ch, x, baseline);
      x += ctx.measureText(ch).width + s * 0.22;
    }
    const ruleW = s * 3.2;
    ctx.fillRect(right - textW - s * 0.9 - ruleW, middle - 0.5, ruleW, 1);
    return s;
  };

  ctx.fillStyle = "#0f0";
  drawCreditLine(CREDIT_TEXT);

  // Easter egg: the same line, rewritten, glowing where the ink uncovers it.
  ctx.fillStyle = "#00f";
  ctx.shadowColor = "rgba(0, 0, 255, 0.85)";
  ctx.shadowBlur = size * 0.8 * scale;
  drawCreditLine(CREDIT_SECRET);
  ctx.shadowBlur = 0;
  drawCreditLine(CREDIT_SECRET);
}
