"use client";

import React, { useEffect, useMemo, useState } from "react";

const symbols = ["+", "o", "x", "*", "=", "#", "~", ">"];
const shuffledDeck = () => [...symbols, ...symbols].sort(() => Math.random() - 0.5);

export default function MemoryMatchGame(): React.ReactElement {
  const [deck, setDeck] = useState<string[]>(shuffledDeck);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const complete = matched.length === deck.length;
  const remaining = useMemo(() => (deck.length - matched.length) / 2, [deck.length, matched.length]);

  useEffect(() => {
    if (open.length !== 2) return undefined;
    const timer = window.setTimeout(() => {
      if (deck[open[0]] === deck[open[1]]) setMatched((current) => [...current, ...open]);
      setOpen([]);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [deck, open]);

  const choose = (index: number) => {
    if (open.length === 2 || open.includes(index) || matched.includes(index)) return;
    setOpen((current) => [...current, index]);
    if (open.length === 1) setMoves((current) => current + 1);
  };

  const restart = () => { setDeck(shuffledDeck()); setOpen([]); setMatched([]); setMoves(0); };

  return (
    <div className="arcade-game">
      <p className="game-window__intro">Reveal matching signals. Clear the board with the fewest moves.</p>
      <div className="game-stats"><span>MOVES <strong>{String(moves).padStart(2, "0")}</strong></span><span>PAIRS <strong>{String(remaining).padStart(2, "0")}</strong></span></div>
      <div className="arcade-board arcade-board--memory">
        {deck.map((symbol, index) => <button className={`memory-card ${(open.includes(index) || matched.includes(index)) ? "memory-card--open" : ""}`} type="button" key={`${symbol}-${index}`} onClick={() => choose(index)} aria-label="Reveal card">{(open.includes(index) || matched.includes(index)) && symbol}</button>)}
        {complete && <div className="arcade-board__message"><span>Board cleared</span><button type="button" onClick={restart}>Play again</button></div>}
      </div>
      <button className="arcade-restart" type="button" onClick={restart}>Restart match</button>
    </div>
  );
}
