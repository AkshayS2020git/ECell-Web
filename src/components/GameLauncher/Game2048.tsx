"use client";

import React, { useCallback, useEffect, useState } from "react";

type Board = number[][];
type Direction = "up" | "down" | "left" | "right";

const emptyBoard = (): Board => Array.from({ length: 4 }, () => Array(4).fill(0));

function addTile(board: Board): Board {
  const open = board.flatMap((row, y) => row.map((value, x) => value === 0 ? { x, y } : null)).filter((cell): cell is { x: number; y: number } => cell !== null);
  if (!open.length) return board;
  const cell = open[Math.floor(Math.random() * open.length)];
  const next = board.map((row) => [...row]);
  next[cell.y][cell.x] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function newBoard(): Board { return addTile(addTile(emptyBoard())); }

function merge(line: number[]): { line: number[]; gained: number } {
  const values = line.filter(Boolean);
  const result: number[] = [];
  let gained = 0;
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) { const value = values[index] * 2; result.push(value); gained += value; index += 1; }
    else result.push(values[index]);
  }
  return { line: [...result, ...Array(4 - result.length).fill(0)], gained };
}

function moveBoard(board: Board, direction: Direction): { board: Board; gained: number; moved: boolean } {
  const next = emptyBoard();
  let gained = 0;
  for (let index = 0; index < 4; index += 1) {
    const source = direction === "left" || direction === "right" ? board[index] : board.map((row) => row[index]);
    const ordered = direction === "left" || direction === "up" ? source : [...source].reverse();
    const merged = merge(ordered);
    gained += merged.gained;
    const output = direction === "left" || direction === "up" ? merged.line : [...merged.line].reverse();
    for (let offset = 0; offset < 4; offset += 1) {
      if (direction === "left" || direction === "right") next[index][offset] = output[offset];
      else next[offset][index] = output[offset];
    }
  }
  return { board: next, gained, moved: next.some((row, y) => row.some((value, x) => value !== board[y][x])) };
}

function canMove(board: Board): boolean {
  return board.some((row, y) => row.some((value, x) => !value || row[x + 1] === value || board[y + 1]?.[x] === value));
}

export default function Game2048(): React.ReactElement {
  const [board, setBoard] = useState<Board>(newBoard);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const restart = useCallback(() => { setBoard(newBoard()); setScore(0); setWon(false); setGameOver(false); }, []);
  const move = useCallback((direction: Direction) => {
    if (gameOver || won) return;
    const result = moveBoard(board, direction);
    if (!result.moved) return;
    const next = addTile(result.board);
    setBoard(next);
    setScore((current) => current + result.gained);
    if (next.some((row) => row.some((value) => value >= 2048))) setWon(true);
    else if (!canMove(next)) setGameOver(true);
  }, [board, gameOver, won]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keys: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        W: "up",
        a: "left",
        A: "left",
        s: "down",
        S: "down",
        d: "right",
        D: "right",
      };
      if (keys[event.key]) { event.preventDefault(); move(keys[event.key]); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  const finishSwipe = (end: { x: number; y: number }) => {
    if (!touchStart) return;
    const dx = end.x - touchStart.x;
    const dy = end.y - touchStart.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 28) move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    setTouchStart(null);
  };

  return (
    <div className="arcade-game">
      <p className="game-window__intro">Combine matching signals. Use arrows or W, A, S, D to reach 2048.</p>
      <div className="game-stats"><span>SCORE <strong>{String(score).padStart(4, "0")}</strong></span><span>GOAL <strong>2048</strong></span></div>
      <div className="arcade-board arcade-board--2048" onTouchStart={(event) => setTouchStart({ x: event.touches[0].clientX, y: event.touches[0].clientY })} onTouchEnd={(event) => finishSwipe({ x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY })}>
        {board.flatMap((row, y) => row.map((value, x) => <span className={`tile-2048 ${value ? `tile-2048--${value}` : ""}`} key={`${x}-${y}`}>{value || ""}</span>))}
        {(won || gameOver) && <div className="arcade-board__message"><span>{won ? "2048 reached" : "Board locked"}</span><button type="button" onClick={restart}>Restart run</button></div>}
      </div>
      <button className="arcade-restart" type="button" onClick={restart}>Restart run</button>
    </div>
  );
}
