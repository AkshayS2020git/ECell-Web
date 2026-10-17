import { useEffect, type RefObject } from "react";
import { gsap } from "@/src/utils/gsapSetup";

/** Previous events: hovering a row floats that event's photo beside the
 *  cursor. Mouse/trackpad only, and off for reduced motion. */
export function useArchivePreview(
  archiveRef: RefObject<HTMLDivElement | null>,
  previewRef: RefObject<HTMLDivElement | null>,
  /** Re-binds when the rows change. */
  rowCount: number,
): void {
  useEffect(() => {
  const archive = archiveRef.current;
  const preview = previewRef.current;
  if (!archive || !preview) return;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!finePointer || reduced) return;

  const images = Array.from(preview.querySelectorAll("img"));
  gsap.set(preview, { xPercent: -50, yPercent: -50, x: -9999, y: 0, scale: 0.85, rotation: 0 });
  const xTo = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3.out" });
  const yTo = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3.out" });
  const tilt = gsap.quickTo(preview, "rotation", { duration: 0.6, ease: "power3.out" });
  let placed = false;
  let lastX = 0;

  const onMove = (event: PointerEvent) => {
    // Sit to the right of the cursor, kept inside the viewport.
    const half = preview.offsetWidth / 2;
    const x = Math.min(event.clientX + half + 40, window.innerWidth - half - 16);
    const y = event.clientY;
    if (!placed) {
      gsap.set(preview, { x, y });
      placed = true;
    }
    xTo(x);
    yTo(y);
    tilt(gsap.utils.clamp(-7, 7, (event.clientX - lastX) * 0.35));
    lastX = event.clientX;
  };
  const onOver = (event: PointerEvent) => {
    const row = (event.target as HTMLElement).closest<HTMLElement>(".ea-archive-row");
    if (!row) {
      preview.classList.remove("is-visible");
      return;
    }
    const index = Number(row.dataset.index);
    images.forEach((img, i) => img.classList.toggle("is-active", i === index));
    preview.classList.add("is-visible");
    gsap.to(preview, { scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
  };
  const onLeave = () => {
    preview.classList.remove("is-visible");
    gsap.to(preview, { scale: 0.85, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    placed = false;
  };

  archive.addEventListener("pointermove", onMove);
  archive.addEventListener("pointerover", onOver);
  archive.addEventListener("pointerleave", onLeave);
  return () => {
    archive.removeEventListener("pointermove", onMove);
    archive.removeEventListener("pointerover", onOver);
    archive.removeEventListener("pointerleave", onLeave);
    gsap.killTweensOf(preview);
  };
  }, [archiveRef, previewRef, rowCount]);
}
