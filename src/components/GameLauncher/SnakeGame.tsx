"use client";

import React, { useCallback, useEffect, useState } from "react";

const GRID_SIZE = 14;
type Cell = { x: number; y: number };
type Direction = "up" | "down" | "left" | "right";

const initialSnake: Cell[] = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];

function makeFood(snake: Cell[]): Cell {
  let food: Cell = { x: 2, y: 2 };
  do {
    food = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
  } while (snake.some((cell) => cell.x === food.x && cell.y === food.y));
  return food;
}

export default function SnakeGame(): React.ReactElement {
  const [snake, setSnake] = useState<Cell[]>(initialSnake);
  const [food, setFood] = useState<Cell>({ x: 10, y: 7 });
  const [direction, setDirection] = useState<Direction>("right");
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState<Cell | null>(null);

  const changeDirection = useCallback((next: Direction) => {
    setDirection((current) => {
      const opposite = (current === "up" && next === "down") || (current === "down" && next === "up") || (current === "left" && next === "right") || (current === "right" && next === "left");
      return opposite ? current : next;
    });
  }, []);

  const restart = useCallback(() => {
    setSnake(initialSnake);
    setFood({ x: 10, y: 7 });
    setDirection("right");
    setGameOver(false);
    setRunning(true);
  }, []);

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
      if (keys[event.key]) {
        event.preventDefault();
        changeDirection(keys[event.key]);
        setRunning(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [changeDirection]);

  useEffect(() => {
    if (!running || gameOver) return undefined;
    const timer = window.setInterval(() => {
      setSnake((current) => {
        const head = current[0];
        const delta: Record<Direction, Cell> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
        const next = { x: head.x + delta[direction].x, y: head.y + delta[direction].y };
        const hitWall = next.x < 0 || next.y < 0 || next.x >= GRID_SIZE || next.y >= GRID_SIZE;
        const hitSelf = current.some((cell) => cell.x === next.x && cell.y === next.y);
        if (hitWall || hitSelf) {
          setGameOver(true);
          setRunning(false);
          return current;
        }
        const ateFood = next.x === food.x && next.y === food.y;
        const updated = [next, ...current];
        if (ateFood) setFood(makeFood(updated));
        else updated.pop();
        return updated;
      });
    }, 130);
    return () => window.clearInterval(timer);
  }, [direction, food, gameOver, running]);

  const swipe = (end: Cell) => {
    if (!touchStart) return;
    const dx = end.x - touchStart.x;
    const dy = end.y - touchStart.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) changeDirection(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    setRunning(true);
    setTouchStart(null);
  };

  return (
    <div className="arcade-game">
      <p className="game-window__intro">Guide the signal. Avoid the walls and collect every spark.</p>
      <div className="game-stats"><span>SCORE <strong>{String(snake.length - initialSnake.length).padStart(2, "0")}</strong></span><span>GRID <strong>{GRID_SIZE}x{GRID_SIZE}</strong></span></div>
      <div className="arcade-board arcade-board--snake" onTouchStart={(event) => setTouchStart({ x: event.touches[0].clientX, y: event.touches[0].clientY })} onTouchEnd={(event) => swipe({ x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY })}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => <span className="arcade-cell" key={index} />)}
        {snake.map((cell, index) => <i className={`snake-segment ${index === 0 ? "snake-segment--head" : ""}`} key={`${cell.x}-${cell.y}`} style={{ left: `${(cell.x / GRID_SIZE) * 100}%`, top: `${(cell.y / GRID_SIZE) * 100}%` }} />)}
        <i className="snake-food" style={{ left: `${(food.x / GRID_SIZE) * 100}%`, top: `${(food.y / GRID_SIZE) * 100}%` }} />
        {(!running || gameOver) && <div className="arcade-board__message"><span>{gameOver ? "Signal lost" : "Arrows or W, A, S, D"}</span><button type="button" onClick={restart}>{gameOver ? "Restart run" : "Start run"}</button></div>}
      </div>
      <div className="arcade-controls" aria-label="Snake controls"><button type="button" onClick={() => changeDirection("left")}>Left</button><button type="button" onClick={() => changeDirection("up")}>Up</button><button type="button" onClick={() => changeDirection("down")}>Down</button><button type="button" onClick={() => changeDirection("right")}>Right</button></div>
    </div>
  );
}
