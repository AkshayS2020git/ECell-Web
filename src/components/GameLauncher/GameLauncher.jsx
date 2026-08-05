import { useEffect, useRef, useState } from "react";
import "./GameLauncher.css";

const ROUND_LENGTH = 15;

function SparkArcadeIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path className="game-launcher__spark" d="m16 4.25 1.8 6.02L23.75 12l-5.95 1.72L16 19.75l-1.8-6.03L8.25 12l5.95-1.73L16 4.25Z" />
      <path className="game-launcher__arcade" d="M9.1 17.1h13.8c2.12 0 3.74 1.9 3.38 3.98l-.72 4.19a2.34 2.34 0 0 1-3.82 1.45l-2.48-2.03h-6.52l-2.48 2.03a2.34 2.34 0 0 1-3.82-1.45l-.72-4.19A3.84 3.84 0 0 1 9.1 17.1Z" />
      <path className="game-launcher__arcade" d="M10.15 20.56v2.92m-1.46-1.46h2.92M21.3 20.9h.01m1.9 1.9h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

export default function GameLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_LENGTH);
  const [isPlaying, setIsPlaying] = useState(false);
  const [target, setTarget] = useState({ x: 52, y: 48 });
  const closeButtonRef = useRef(null);
  const launcherButtonRef = useRef(null);
  const gameActive = isPlaying && timeLeft > 0;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!gameActive) return undefined;
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [gameActive, timeLeft]);

  const moveTarget = () => {
    setScore((value) => value + 1);
    setTarget({
      x: 12 + Math.random() * 76,
      y: 14 + Math.random() * 68,
    });
  };

  const startRound = () => {
    setScore(0);
    setTimeLeft(ROUND_LENGTH);
    setTarget({ x: 52, y: 48 });
    setIsPlaying(true);
  };

  const closeWindow = () => {
    setIsOpen(false);
    setIsPlaying(false);
    window.requestAnimationFrame(() => launcherButtonRef.current?.focus());
  };

  return (
    <aside className={`game-launcher ${isOpen ? "game-launcher--open" : ""}`}>
      {isOpen && (
        <>
          <button className="game-launcher__backdrop" type="button" onClick={closeWindow} aria-label="Close Founder Sprint" />
          <section className="game-window" role="dialog" aria-modal="true" aria-labelledby="game-window-title">
            <header className="game-window__header">
              <div>
                <span className="game-window__eyebrow">ECELL // AFTER HOURS</span>
                <h2 id="game-window-title">Founder Sprint</h2>
              </div>
              <button ref={closeButtonRef} className="game-window__close" type="button" onClick={closeWindow} aria-label="Close Founder Sprint">
                <CloseIcon />
              </button>
            </header>

            <p className="game-window__intro">Build momentum. Catch every spark before the clock runs out.</p>

            <div className="game-stats" aria-live="polite">
              <span>SPARKS <strong>{String(score).padStart(2, "0")}</strong></span>
              <span>TIME <strong>{String(timeLeft).padStart(2, "0")}s</strong></span>
            </div>

            <div className="game-stage">
              {!gameActive && (
                <div className="game-stage__start">
                  <span>{timeLeft === 0 ? `Round complete — ${score} sparks` : "15-second focus round"}</span>
                  <button type="button" onClick={startRound}>{timeLeft === 0 ? "Play again" : "Start sprint"}</button>
                </div>
              )}
              {gameActive && (
                <button
                  className="game-target"
                  type="button"
                  onClick={moveTarget}
                  style={{ left: `${target.x}%`, top: `${target.y}%` }}
                  aria-label="Collect spark"
                >
                  ✦
                </button>
              )}
            </div>

            <footer className="game-window__footer">
              <span>{gameActive ? "Tap the moving spark" : "Made for a quick break"}</span>
              <span className="game-window__status"><i /> ONLINE</span>
            </footer>
          </section>
        </>
      )}

      <button
        ref={launcherButtonRef}
        className="game-launcher__button"
        type="button"
        onClick={() => (isOpen ? closeWindow() : setIsOpen(true))}
        aria-expanded={isOpen}
        aria-controls="game-window-title"
        aria-label={isOpen ? "Close Founder Sprint" : "Open Founder Sprint"}
      >
        <span className="game-launcher__icon"><SparkArcadeIcon /></span>
      </button>
    </aside>
  );
}
