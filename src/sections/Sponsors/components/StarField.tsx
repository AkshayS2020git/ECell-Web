import React from "react";
import BackdropPlanets from "./BackdropPlanets";

// Deterministic so the server and client render the same backdrop.
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(20260611);
// Extra twinkling stars layered on top of the six hand-placed ones.
const BACKDROP_STARS = Array.from({ length: 56 }, () => ({
  top: (rand() * 100).toFixed(2),
  left: (rand() * 100).toFixed(2),
  size: (1 + rand() * 1.8).toFixed(2),
  delay: (rand() * 5).toFixed(2),
  duration: (3 + rand() * 4).toFixed(2),
  dim: rand() < 0.45,
}));

// Small star figures drawn faintly in the margins (points in a 100 x 70 box).
const BACKDROP_CONSTELLATIONS: Array<{
  id: string;
  points: Array<[number, number]>;
  edges: Array<[number, number]>;
}> = [
  { id: "ml", points: [[14, 10], [22, 34], [12, 58], [46, 46], [70, 62]], edges: [[0, 1], [1, 2], [1, 3], [3, 4]] },
  { id: "mr", points: [[20, 56], [38, 36], [62, 40], [80, 16], [90, 52]], edges: [[0, 1], [1, 2], [2, 3], [2, 4]] },
];

// "ECELL" and "RVU" spelled in stars across the top margins, one word on each
// side of the header. Points sit in a box 31 high and 20 wide per letter, so
// both words share one letter size. Corners are nudged off-grid so they read
// as constellations, not a font; the first star of each letter is the bright
// one. Letters trace in reading order, ECELL then RVU.
type WordmarkLetter = {
  points: Array<[number, number]>;
  edges: Array<[number, number]>;
};

const WORDMARKS: Array<{ id: string; width: number; letters: WordmarkLetter[] }> = [
  {
    id: "ecell",
    width: 100,
    letters: [
      // E
      { points: [[2.5, 4], [14, 4.6], [2, 15], [11, 15.6], [2.6, 26], [14.4, 25.4]], edges: [[1, 0], [0, 2], [2, 3], [2, 4], [4, 5]] },
      // C
      { points: [[35, 6.4], [27, 4], [23, 10.6], [23.2, 19.6], [27.2, 26], [35.4, 24]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
      // E
      { points: [[44, 4.2], [56.4, 5], [44.4, 15.4], [52.6, 15], [44, 26.4], [56, 26]], edges: [[1, 0], [0, 2], [2, 3], [2, 4], [4, 5]] },
      // L
      { points: [[65.4, 4], [65, 26], [76, 25.6]], edges: [[0, 1], [1, 2]] },
      // L
      { points: [[84.4, 4.4], [84, 26.2], [95.6, 26.6]], edges: [[0, 1], [1, 2]] },
    ],
  },
  {
    id: "rvu",
    width: 60,
    letters: [
      // R
      { points: [[2.4, 4], [11, 4.6], [14.2, 9.6], [11.2, 14.8], [2, 15], [2.6, 26], [14.4, 26]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4], [4, 5], [3, 6]] },
      // V
      { points: [[23, 4.4], [26.2, 15.4], [29.2, 26], [32.4, 15], [35.4, 4]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      // U
      { points: [[44.2, 4], [44, 19], [47.6, 26], [52.8, 26.2], [56.4, 19.4], [56, 4.4]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
    ],
  },
];

/** Everything behind the sponsor grid: stars, planets, faint constellations
 *  and the ECELL RVU wordmark. */
export default function StarField(): React.ReactElement {
  return (
    <div className="constellation-star-field" aria-hidden="true">
      <span className="constellation-star star-1" />
      <span className="constellation-star star-2" />
      <span className="constellation-star star-3" />
      <span className="constellation-star star-4" />
      <span className="constellation-star star-5" />
      <span className="constellation-star star-6" />
      {BACKDROP_STARS.map((star, i) => (
        <span
          key={i}
          className={`backdrop-star${star.dim ? " is-dim" : ""}`}
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
      <BackdropPlanets />
      {BACKDROP_CONSTELLATIONS.map((figure) => (
        <svg
          key={figure.id}
          className={`bg-constellation bg-constellation--${figure.id}`}
          viewBox="0 0 100 70"
          fill="none"
        >
          {figure.edges.map(([from, to]) => (
            <path
              key={`${from}-${to}`}
              className="bg-constellation-line"
              d={`M ${figure.points[from][0]} ${figure.points[from][1]} L ${figure.points[to][0]} ${figure.points[to][1]}`}
            />
          ))}
          {figure.points.map(([cx, cy], i) => (
            <circle key={i} className="bg-constellation-star" cx={cx} cy={cy} r={i === 0 ? 1.6 : 1.1} />
          ))}
        </svg>
      ))}
      {WORDMARKS.map((word) => (
        <svg
          key={word.id}
          className={`bg-constellation bg-wordmark bg-wordmark--${word.id}`}
          viewBox={`0 0 ${word.width} 31`}
          fill="none"
        >
          {word.letters.map((letter, li) => (
            <g key={li} className="bg-wordmark-letter">
              {letter.edges.map(([from, to]) => (
                <path
                  key={`${from}-${to}`}
                  className="bg-wordmark-line"
                  d={`M ${letter.points[from][0]} ${letter.points[from][1]} L ${letter.points[to][0]} ${letter.points[to][1]}`}
                />
              ))}
              {letter.points.map(([cx, cy], i) => (
                <circle key={i} className="bg-wordmark-star" cx={cx} cy={cy} r={i === 0 ? 0.95 : 0.65} />
              ))}
            </g>
          ))}
        </svg>
      ))}
    </div>
  );
}
