"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { LAND_MASK } from "./landMask";

export interface GlobeMarker {
  id: string;
  title: string;
  url: string;
  lat: number;
  lng: number;
}

// Candidate spots on the sphere; only the ones on land become dots (about a third).
const DOT_COUNT = 15000;
const START = { lat: 16, lng: 78 }; // Face India first.
const SPIN_PER_MS = 0.00008; // About one turn every 80 seconds.
const DRAG_SPEED = 0.005;
const MAX_TILT = 0.9;

function toVector(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Soft round sprite so points draw as dots instead of squares. */
function dotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.45, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function pointsGeometry(vectors: THREE.Vector3[]): THREE.BufferGeometry {
  return new THREE.BufferGeometry().setFromPoints(vectors);
}

/** Whether the 1°×1° cell holding this point is land (see landMask.ts). */
function makeIsLand(): (lat: number, lng: number) => boolean {
  const bytes = Uint8Array.from(atob(LAND_MASK), (char) => char.charCodeAt(0));
  return (lat, lng) => {
    const row = Math.min(179, Math.floor(90 - lat));
    const col = Math.min(359, Math.floor(lng + 180));
    const bit = row * 360 + col;
    return ((bytes[bit >> 3] >> (bit & 7)) & 1) === 1;
  };
}

/** Even spread over the sphere (Fibonacci lattice), keeping only spots on land. */
function landDots(count: number, radius: number): THREE.Vector3[] {
  const isLand = makeIsLand();
  const golden = Math.PI * (3 - Math.sqrt(5));
  const dots: THREE.Vector3[] = [];
  for (let index = 0; index < count; index++) {
    const y = 1 - (index / (count - 1)) * 2;
    const angle = golden * index;
    const lat = Math.asin(y) * (180 / Math.PI);
    // Same longitude convention as toVector().
    const lng = ((((Math.atan2(Math.sin(angle), -Math.cos(angle)) * 180) / Math.PI + 360) % 360) - 180);
    if (isLand(lat, lng)) dots.push(toVector(lat, lng, radius));
  }
  return dots;
}

/**
 * Dotted globe with red markers. Drag to spin; hover a marker for its name,
 * click to open it. Every marker's link must also be on the page as a normal
 * link, for keyboard and screen-reader users.
 */
export default function Globe({ markers }: { markers: GlobeMarker[] }): React.ReactElement {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<{ title: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      // No WebGL: drop the globe and its hint; the list still has everything.
      wrapperRef.current?.setAttribute("hidden", "");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.z = 3.9;

    const globe = new THREE.Group();
    const start = toVector(START.lat, START.lng, 1);
    globe.rotation.y = Math.atan2(-start.x, start.z);
    globe.rotation.x = Math.atan2(start.y, Math.hypot(start.x, start.z));
    scene.add(globe);

    const styles = getComputedStyle(mount);
    const dotColor = new THREE.Color(styles.getPropertyValue("--op-accent").trim() || "#bababa");
    const markerColor = new THREE.Color(styles.getPropertyValue("--op-hot").trim() || "#ff001a");
    const fillColor = new THREE.Color(styles.getPropertyValue("--op-globe-fill").trim() || "#141414");
    const texture = dotTexture();

    // Solid core hides the dots on the far side.
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.985, 48, 48), new THREE.MeshBasicMaterial({ color: fillColor }));
    const dots = new THREE.Points(
      pointsGeometry(landDots(DOT_COUNT, 1)),
      new THREE.PointsMaterial({ color: dotColor, size: 0.02, map: texture, transparent: true, opacity: 0.7, depthWrite: false }),
    );
    const pins = new THREE.Points(
      pointsGeometry(markers.map((marker) => toVector(marker.lat, marker.lng, 1.012))),
      new THREE.PointsMaterial({ color: markerColor, size: 0.075, map: texture, transparent: true, depthWrite: false }),
    );
    globe.add(core, dots, pins);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.05 };
    const pointer = new THREE.Vector2();
    const worldPin = new THREE.Vector3();
    let hoveredIndex = -1;
    let drag: { x: number; y: number; moved: number } | null = null;
    let visible = true;
    let frame = 0;
    let last = performance.now();

    const resize = () => {
      const size = mount.clientWidth;
      renderer.setSize(size, size, false);
    };

    const pick = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      // Only pins on the side facing us count; the core hides the rest.
      const hit = raycaster
        .intersectObject(pins)
        .find((intersection) => worldPin.copy(intersection.point).z > 0.15);
      hoveredIndex = hit?.index ?? -1;
      const marker = markers[hoveredIndex];
      setHovered(marker ? { title: marker.title, x: event.clientX - rect.left, y: event.clientY - rect.top } : null);
      renderer.domElement.style.cursor = marker ? "pointer" : drag ? "grabbing" : "grab";
    };

    const onPointerDown = (event: PointerEvent) => {
      drag = { x: event.clientX, y: event.clientY, moved: 0 };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (drag) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        drag = { x: event.clientX, y: event.clientY, moved: drag.moved + Math.abs(dx) + Math.abs(dy) };
        globe.rotation.y += dx * DRAG_SPEED;
        globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x + dy * DRAG_SPEED, -MAX_TILT, MAX_TILT);
      }
      pick(event);
    };
    const onPointerUp = (event: PointerEvent) => {
      // A tap or click, not the end of a drag.
      if (drag && drag.moved < 6) {
        pick(event);
        const marker = markers[hoveredIndex];
        if (marker) window.open(marker.url, "_blank", "noopener,noreferrer");
      }
      drag = null;
    };
    const onPointerLeave = () => {
      drag = null;
      hoveredIndex = -1;
      setHovered(null);
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const elapsed = Math.min(now - last, 50);
      last = now;
      if (!visible) return;
      if (!reducedMotion && !drag && hoveredIndex < 0) globe.rotation.y += elapsed * SPIN_PER_MS;
      renderer.render(scene, camera);
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.style.cursor = "grab";

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    visibility.observe(mount);
    resize();
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      for (const object of [core, dots, pins]) {
        object.geometry.dispose();
        (object.material as THREE.Material).dispose();
      }
      texture.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [markers]);

  return (
    <div className="op-hero-globe" ref={wrapperRef}>
      <div
        className="op-globe"
        ref={mountRef}
        role="img"
        aria-label={`Globe with red dots: ${markers.map((marker) => marker.title).join(", ")}.`}
      >
        {hovered && (
          <span className="op-globe__label" style={{ left: hovered.x, top: hovered.y }} aria-hidden="true">
            {hovered.title}
          </span>
        )}
      </div>
      <p className="op-globe-hint" aria-hidden="true">
        Drag to spin · tap the red dot
      </p>
    </div>
  );
}
