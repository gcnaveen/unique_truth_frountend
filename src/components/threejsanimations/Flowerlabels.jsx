import React, { memo } from "react";

/* ─── Data ─────────────────────────────────────────────────────────── */
export const LIFE_FLOWERS = [
  {
    id: "personal",
    label: "Personal Life",
    color: "#ff6b9d",
    darkColor: "#d94f83",
    centerColor: "#ffc107",
    x: "10%",
    description:
      "Build self-awareness and emotional balance through small daily habits that bring clarity, confidence, and inner calm.",
  },
  {
    id: "family",
    label: "Family Life",
    color: "#ff9a3c",
    darkColor: "#e07b22",
    centerColor: "#ffe082",
    x: "28%",
    description:
      "Strengthen trust and warmth at home with healthier communication patterns, boundaries, and compassionate understanding.",
  },
  {
    id: "spiritual",
    label: "Spiritual Life",
    color: "#a78bfa",
    darkColor: "#7c5ce8",
    centerColor: "#ffd54f",
    x: "50%",
    description:
      "Reconnect with meaning and purpose through reflective practices that soothe the mind and ground your emotions.",
  },
  {
    id: "professional",
    label: "Professional Life",
    color: "#34d399",
    darkColor: "#1fab7a",
    centerColor: "#ffca28",
    x: "72%",
    description:
      "Develop focus, resilience, and healthy work rhythms so your career growth feels sustainable and mentally supportive.",
  },
  {
    id: "social",
    label: "Social Life",
    color: "#60a5fa",
    darkColor: "#3d87ea",
    centerColor: "#fff176",
    x: "90%",
    description:
      "Improve connection and belonging with mindful social habits that reduce stress and support uplifting relationships.",
  },
];

/* ─── Static constants (computed once, not per-render) ──────────────── */
const GRASS_TUFTS = [
  { ox: -13, h: 8,  rot: -15 },
  { ox: -5,  h: 10, rot: -5  },
  { ox:  2,  h: 9,  rot:  3  },
  { ox:  9,  h: 7,  rot:  11 },
  { ox: 16,  h: 9,  rot:  17 },
];

// Pre-compute petal angles once
const BACK_PETAL_ANGLES  = [1, 3, 5].map((i) => (i / 6) * 360);
const FRONT_PETAL_ANGLES = [0, 2, 4].map((i) => (i / 6) * 360);
const DOT_ANGLES = Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2 - Math.PI / 2);

/* ─── SVG constants ─────────────────────────────────────────────────── */
const CX         = 50;
const HEAD_Y     = 60;
const PETAL_DIST = 27;
const PETAL_RX   = 12;
const PETAL_RY   = 22;
const CENTER_R   = 16;
const STEM_TOP   = HEAD_Y + CENTER_R * 0.52;
const STEM_BOT   = 188;
const LEAF1_Y    = STEM_TOP + (STEM_BOT - STEM_TOP) * 0.30;
const LEAF2_Y    = STEM_TOP + (STEM_BOT - STEM_TOP) * 0.52;
const DOT_RING   = CENTER_R * 0.63;

/* Pre-built vein offsets (relative to petal center) */
const V_Y0 = -PETAL_DIST + PETAL_RY * 0.55;
const V_Y1 = -PETAL_DIST - PETAL_RY * 0.62;
const V_MID_Y = -PETAL_DIST - PETAL_RY * 0.06;
const V_SX =  PETAL_RX * 0.55;
const V_SY = -PETAL_DIST - PETAL_RY * 0.54;

/* ─── CartoonFlower (memoised – re-renders only when colours change) ── */
const CartoonFlower = memo(function CartoonFlower({ color, darkColor, centerColor }) {
  return (
    <svg
      viewBox="0 0 100 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: "100%", height: "100%", overflow: "visible", display: "block" }}
    >
      {/* Stem */}
      <line x1={CX} y1={STEM_TOP} x2={CX} y2={STEM_BOT}
        stroke="#3e9c4a" strokeWidth="5.5" strokeLinecap="round" />
      {/* Stem highlight */}
      <line x1={CX - 1.3} y1={STEM_TOP + 6} x2={CX - 1.3} y2={STEM_BOT - 8}
        stroke="#62c46e" strokeWidth="1.5" strokeLinecap="round" opacity="0.48" />

      {/* Left leaf */}
      <g transform={`translate(${CX},${LEAF1_Y})`}>
        <path d="M 0,0 C -19,-11 -40,2 -32,23 C -24,35 -6,21 0,0 Z" fill="#5cb85c" />
        <path d="M 0,0 C -14,4 -27,15 -32,23" stroke="#3e9c4a" strokeWidth="1.1" fill="none" opacity="0.5" />
        <path d="M -4,2 C -17,-2 -29,7 -27,17" stroke="#7ed88a" strokeWidth="0.9" fill="none" opacity="0.42" />
      </g>

      {/* Right leaf */}
      <g transform={`translate(${CX},${LEAF2_Y})`}>
        <path d="M 0,0 C 19,-11 40,2 32,23 C 24,35 6,21 0,0 Z" fill="#5cb85c" />
        <path d="M 0,0 C 14,4 27,15 32,23" stroke="#3e9c4a" strokeWidth="1.1" fill="none" opacity="0.5" />
        <path d="M 4,2 C 17,-2 29,7 27,17" stroke="#7ed88a" strokeWidth="0.9" fill="none" opacity="0.42" />
      </g>

      {/* Petals */}
      <g transform={`translate(${CX},${HEAD_Y})`}>
        {/* Back petals */}
        {BACK_PETAL_ANGLES.map((angle, idx) => (
          <g key={idx} transform={`rotate(${angle})`}>
            <ellipse cx={0} cy={-PETAL_DIST} rx={PETAL_RX} ry={PETAL_RY}
              fill={darkColor} stroke={darkColor} strokeWidth="0.6" opacity="0.88" />
            <line x1="0" y1={V_Y0} x2="0" y2={V_Y1} stroke="rgba(0,0,0,0.14)" strokeWidth="0.9" />
            <line x1="0" y1={V_MID_Y} x2={V_SX}  y2={V_SY} stroke="rgba(0,0,0,0.09)" strokeWidth="0.7" />
            <line x1="0" y1={V_MID_Y} x2={-V_SX} y2={V_SY} stroke="rgba(0,0,0,0.09)" strokeWidth="0.7" />
            <ellipse cx={-PETAL_RX * 0.26} cy={-PETAL_DIST - PETAL_RY * 0.2}
              rx={PETAL_RX * 0.3} ry={PETAL_RY * 0.22} fill="rgba(255,255,255,0.22)" />
          </g>
        ))}

        {/* Front petals */}
        {FRONT_PETAL_ANGLES.map((angle, idx) => (
          <g key={idx} transform={`rotate(${angle})`}>
            <ellipse cx={0} cy={-PETAL_DIST} rx={PETAL_RX} ry={PETAL_RY}
              fill={color} stroke={darkColor} strokeWidth="0.6" opacity="0.93" />
            <line x1="0" y1={V_Y0} x2="0" y2={V_Y1} stroke="rgba(0,0,0,0.12)" strokeWidth="0.9" />
            <line x1="0" y1={V_MID_Y} x2={V_SX}  y2={V_SY} stroke="rgba(0,0,0,0.07)" strokeWidth="0.7" />
            <line x1="0" y1={V_MID_Y} x2={-V_SX} y2={V_SY} stroke="rgba(0,0,0,0.07)" strokeWidth="0.7" />
            <ellipse cx={-PETAL_RX * 0.26} cy={-PETAL_DIST - PETAL_RY * 0.22}
              rx={PETAL_RX * 0.3} ry={PETAL_RY * 0.22} fill="rgba(255,255,255,0.28)" />
          </g>
        ))}

        {/* Centre glow */}
        <circle cx={0} cy={0} r={CENTER_R + 3.5} fill={centerColor} opacity="0.22" />
        {/* Centre fill */}
        <circle cx={0} cy={0} r={CENTER_R} fill={centerColor} />
        {/* Inner sheen */}
        <circle cx={0} cy={0} r={CENTER_R * 0.72} fill="rgba(255,255,255,0.3)" />
        {/* Dot ring */}
        {DOT_ANGLES.map((a, i) => (
          <circle key={i}
            cx={Math.cos(a) * DOT_RING} cy={Math.sin(a) * DOT_RING}
            r={2.2} fill="#7a3800" opacity="0.7" />
        ))}
        {/* Centre dot */}
        <circle cx={0} cy={0} r={1.9} fill="#7a3800" opacity="0.52" />
        {/* Specular highlight */}
        <circle cx={-CENTER_R * 0.28} cy={-CENTER_R * 0.28}
          r={CENTER_R * 0.22} fill="rgba(255,255,255,0.42)" />
      </g>

      {/* Grass tufts */}
      {GRASS_TUFTS.map(({ ox, h, rot }, i) => (
        <ellipse key={i}
          cx={CX + ox} cy={STEM_BOT - h / 2}
          rx={2.3} ry={h / 2}
          fill="#4caf50" opacity="0.55"
          transform={`rotate(${rot},${CX + ox},${STEM_BOT})`} />
      ))}
    </svg>
  );
});

/* ─── Static CSS string (allocated once at module load) ─────────────── */
const FLOWER_CSS = `
  @keyframes flowerGrow {
    0%   { opacity: 0; transform: scaleY(0) scaleX(0.35); }
    55%  { opacity: 1; transform: scaleY(1.07) scaleX(1.04); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes gentleSway {
    0%,  100% { transform: rotate(0deg); }
    22%        { transform: rotate(1.9deg); }
    65%        { transform: rotate(-1.6deg); }
  }
  @keyframes labelFadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── hover / focus ─────────────────────── */
  .flower-btn:hover  .flower-svg-wrap,
  .flower-btn:focus-visible .flower-svg-wrap {
    filter: drop-shadow(0 7px 18px rgba(0,0,0,0.24));
    transform: scale(1.07);
  }
  .flower-btn .flower-svg-wrap {
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), filter 0.25s ease;
    will-change: transform;
  }
  .flower-sway-wrap { will-change: transform; }
  .flower-grow-wrap { will-change: transform, opacity; }
  .flower-label-pill {
    transition: box-shadow 0.2s ease;
  }
  .flower-btn:hover  .flower-label-pill,
  .flower-btn:focus-visible .flower-label-pill {
    box-shadow: 0 7px 22px rgba(0,0,0,0.2) !important;
  }

  /* ── Desktop: absolute per-flower positioning ─ */
  .flower-stage { position: absolute; inset: 0; pointer-events: none; z-index: 10; }
  .flower-pos   { position: absolute; bottom: 3%; transform: translateX(-50%);
                  display: flex; flex-direction: column; align-items: center; }

  /* ── Tablet ≤ 860px : switch to flex row ─────── */
  @media (max-width: 860px) {
    .flower-stage {
      top: auto !important;
      height: auto !important;
      bottom: 2% !important;
      left: 0 !important;
      right: 0 !important;
      display: flex !important;
      justify-content: space-evenly !important;
      align-items: flex-end !important;
      padding: 0 6px !important;
    }
    .flower-pos {
      position: static !important;
      transform: none !important;
      bottom: auto !important;
      left: auto !important;
    }
    .flower-svg-wrap { width: clamp(70px, 11.5vw, 95px) !important; }
  }

  /* ── Mobile ≤ 520px ──────────────────────────── */
  @media (max-width: 520px) {
    .flower-stage { bottom: 1.5% !important; padding: 0 2px !important; }
    .flower-svg-wrap { width: clamp(52px, 15.5vw, 70px) !important; }
    .flower-label-pill {
      white-space: normal !important;
      max-width: 62px !important;
      text-align: center !important;
      font-size: clamp(7px, 2.4vw, 9.5px) !important;
      padding: 3px 7px !important;
    }
  }

  /* ── Reduced motion ──────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .flower-grow-wrap { animation: none !important; opacity: 1 !important; transform: none !important; }
    .flower-sway-wrap { animation: none !important; }
    .flower-label-pill { animation: none !important; opacity: 1 !important; }
    .flower-btn .flower-svg-wrap { transition: none !important; }
  }
`;

/* ─── FlowerLabels ──────────────────────────────────────────────────── */
const FlowerLabels = memo(function FlowerLabels({ onFlowerClick }) {
  return (
    <div className="flower-stage">
      <style>{FLOWER_CSS}</style>

      {LIFE_FLOWERS.map((f, i) => (
        /* outer: handles position (absolute on desktop, static in flex on mobile) */
        <div
          key={f.id}
          className="flower-pos"
          style={{ left: f.x }}
        >
          {/* grow-in animation wrapper */}
          <div
            className="flower-grow-wrap"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: `flowerGrow 0.85s cubic-bezier(0.34,1.56,0.64,1) ${0.22 + i * 0.13}s both`,
              transformOrigin: "50% 100%",
            }}
          >
            {/* sway wrapper */}
            <div
              className="flower-sway-wrap"
              style={{
                animation: `gentleSway ${3.6 + i * 0.38}s ease-in-out ${i * 0.5}s infinite`,
                transformOrigin: "50% 100%",
              }}
            >
              <button
                type="button"
                onClick={() => onFlowerClick?.(f)}
                className="flower-btn"
                aria-label={`Learn about ${f.label}`}
                style={{
                  pointerEvents: "auto",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "7px",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* SVG flower — bigger on desktop */}
                <span
                  className="flower-svg-wrap"
                  style={{
                    display: "block",
                    width: "clamp(88px, 9.2vw, 124px)",
                    aspectRatio: "100 / 200",
                  }}
                >
                  <CartoonFlower
                    color={f.color}
                    darkColor={f.darkColor}
                    centerColor={f.centerColor}
                  />
                </span>

                {/* Label pill */}
                <span
                  className="flower-label-pill"
                  style={{
                    display: "inline-block",
                    background:
                      "linear-gradient(150deg,rgba(255,255,255,0.97) 0%,rgba(238,252,242,0.93) 100%)",
                    border: `1.5px solid ${f.color}55`,
                    borderRadius: "999px",
                    padding: "5px 15px",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: "clamp(9.5px, 1.05vw, 13px)",
                    fontWeight: 600,
                    color: "#1e4829",
                    whiteSpace: "nowrap",
                    boxShadow:
                      "0 4px 14px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.8)",
                    letterSpacing: "0.01em",
                    animation: `labelFadeUp 0.5s ease ${0.68 + i * 0.13}s both`,
                  }}
                >
                  {f.label}
                </span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default FlowerLabels;
