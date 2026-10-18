import React from "react";

interface ConstellationNetworkProps {
  /** Sponsor card under the pointer; its links light up. */
  hoveredNode: string | null;
}

/** The lines and nodes linking sponsor cards, drawn behind the grid. */
export default function ConstellationNetwork({ hoveredNode }: ConstellationNetworkProps): React.ReactElement {
  const isConnected = (...nodes: string[]) => {
    if (!hoveredNode) return false;
    return nodes.includes(hoveredNode);
  };

  return (
    <svg
      className="constellation-svg"
      viewBox="0 0 1000 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(244, 244, 242, 0.06)" />
          <stop offset="50%" stopColor="rgba(244, 244, 242, 0.35)" />
          <stop offset="100%" stopColor="rgba(244, 244, 242, 0.06)" />
        </linearGradient>
        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── PATH TIER 1: North connections ── */}
      {/* Nokia down to Belgian Waffle */}
      <path
        d="M 290 115 V 160 H 190"
        className={`constellation-line-path path-tier-1${isConnected("node-nokia", "node-waffle") ? " is-active" : ""}`}
      />

      {/* Center Hub (Herody) up to Red Bull */}
      <path
        d="M 625 185 V 70 H 685"
        className={`constellation-line-path path-tier-1${isConnected("node-herody", "node-redbull") ? " is-active" : ""}`}
      />

      {/* ── PATH TIER 2: Mid-North horizontal bridges ── */}
      {/* Belgian Waffle to TVS */}
      <path
        d="M 230 205 H 280"
        className={`constellation-line-path path-tier-2${isConnected("node-waffle", "node-tvs") ? " is-active" : ""}`}
      />

      {/* Herody to Mercedes */}
      <path
        d="M 720 205 H 770"
        className={`constellation-line-path path-tier-2${isConnected("node-herody", "node-merc") ? " is-active" : ""}`}
      />

      {/* ── PATH TIER 3: Mid-North down to Growth tier ── */}
      {/* TVS down to Atty's */}
      <path
        d="M 375 240 V 325 H 330"
        className={`constellation-line-path path-tier-3${isConnected("node-tvs", "node-attys") ? " is-active" : ""}`}
      />

      {/* Herody down to Cube */}
      <path
        d="M 625 240 V 325 H 580"
        className={`constellation-line-path path-tier-3${isConnected("node-herody", "node-cube") ? " is-active" : ""}`}
      />

      {/* Mercedes down to Justvend */}
      <path
        d="M 870 240 V 325 H 825"
        className={`constellation-line-path path-tier-3${isConnected("node-merc", "node-justvend") ? " is-active" : ""}`}
      />

      {/* ── PATH TIER 4: Growth down to Base anchors ── */}
      {/* Justvend down to Mile */}
      <path
        d="M 765 365 V 450 H 695"
        className={`constellation-line-path path-tier-4${isConnected("node-justvend", "node-mile") ? " is-active" : ""}`}
      />

      {/* Atty's down to EasyBites */}
      <path
        d="M 235 365 V 450 H 305"
        className={`constellation-line-path path-tier-4${isConnected("node-attys", "node-easybites") ? " is-active" : ""}`}
      />

      {/* ── SPONSOR ANCHOR NODES (Where cards dock) ── */}
      <g className="anchor-nodes-group">
        {/* Nokia Anchor */}
        <circle cx="290" cy="115" r="3" className="constellation-anchor-node" />
        <circle cx="290" cy="115" r="2" className="node-ping-ring" />

        {/* Red Bull Anchor */}
        <circle cx="685" cy="70" r="3" className="constellation-anchor-node" />
        <circle cx="685" cy="70" r="2" className="node-ping-ring" />

        {/* Waffle Anchor */}
        <circle cx="190" cy="160" r="3" className="constellation-anchor-node" />
        <circle cx="190" cy="160" r="2" className="node-ping-ring" />

        {/* TVS Anchor */}
        <circle cx="375" cy="240" r="3" className="constellation-anchor-node" />
        <circle cx="375" cy="240" r="2" className="node-ping-ring" />

        {/* Herody Hub Anchor */}
        <circle cx="625" cy="185" r="3.5" className="constellation-anchor-node anchor-hub" />
        <circle cx="625" cy="185" r="2" className="node-ping-ring" />

        {/* Mercedes Anchor */}
        <circle cx="870" cy="240" r="3" className="constellation-anchor-node" />
        <circle cx="870" cy="240" r="2" className="node-ping-ring" />

        {/* Atty's Anchor */}
        <circle cx="235" cy="365" r="3" className="constellation-anchor-node" />
        <circle cx="235" cy="365" r="2" className="node-ping-ring" />

        {/* Cube Anchor */}
        <circle cx="580" cy="325" r="3" className="constellation-anchor-node" />
        <circle cx="580" cy="325" r="2" className="node-ping-ring" />

        {/* Justvend Anchor */}
        <circle cx="765" cy="365" r="3" className="constellation-anchor-node" />
        <circle cx="765" cy="365" r="2" className="node-ping-ring" />

        {/* EasyBites Anchor */}
        <circle cx="305" cy="450" r="3" className="constellation-anchor-node" />
        <circle cx="305" cy="450" r="2" className="node-ping-ring" />

        {/* Mile Anchor */}
        <circle cx="695" cy="450" r="3" className="constellation-anchor-node" />
        <circle cx="695" cy="450" r="2" className="node-ping-ring" />
      </g>

      {/* ── JUNCTION INTERSECTION DOTS ── */}
      <circle
        cx="290"
        cy="160"
        r="2.5"
        className={`constellation-junction-dot${isConnected("node-nokia", "node-waffle") ? " is-active" : ""}`}
      />
      <circle
        cx="625"
        cy="70"
        r="2.5"
        className={`constellation-junction-dot${isConnected("node-herody", "node-redbull") ? " is-active" : ""}`}
      />
      <circle
        cx="625"
        cy="185"
        r="2.5"
        className={`constellation-junction-dot${isConnected("node-herody", "node-redbull", "node-merc") ? " is-active" : ""}`}
      />
      <circle
        cx="375"
        cy="325"
        r="2.5"
        className={`constellation-junction-dot${isConnected("node-tvs", "node-attys") ? " is-active" : ""}`}
      />
      <circle
        cx="625"
        cy="325"
        r="2.5"
        className={`constellation-junction-dot${isConnected("node-herody", "node-cube") ? " is-active" : ""}`}
      />
      <circle
        cx="870"
        cy="325"
        r="2.5"
        className={`constellation-junction-dot${isConnected("node-merc", "node-justvend") ? " is-active" : ""}`}
      />
      <circle
        cx="765"
        cy="450"
        r="2.5"
        className={`constellation-junction-dot${isConnected("node-justvend", "node-mile") ? " is-active" : ""}`}
      />
      <circle
        cx="235"
        cy="450"
        r="2.5"
        className={`constellation-junction-dot${isConnected("node-attys", "node-easybites") ? " is-active" : ""}`}
      />
    </svg>
  );
}
