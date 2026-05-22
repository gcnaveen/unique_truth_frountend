import React from "react";
import { useLocation } from "react-router-dom";
import logoSrc from "/assets/nobglogo.png";

// Each flake: position, size, speed, stagger delay, slight tilt, opacity
const FLAKES = [
  { left:  7, size: 96,  duration: 13, delay:  0.0, rotate:  12, opacity: 0.45 },
  { left: 21, size: 76,  duration: 16, delay:  3.5, rotate:  -8, opacity: 0.40 },
  { left: 36, size: 108, duration: 11, delay:  6.8, rotate:  15, opacity: 0.50 },
  { left: 52, size: 70,  duration: 15, delay:  1.2, rotate: -13, opacity: 0.42 },
  { left: 66, size: 90,  duration: 14, delay:  9.0, rotate:   7, opacity: 0.48 },
  { left: 80, size: 80,  duration: 17, delay:  4.0, rotate: -16, opacity: 0.40 },
  { left: 13, size: 100, duration: 10, delay: 11.5, rotate:  10, opacity: 0.44 },
  { left: 45, size: 72,  duration: 18, delay:  2.5, rotate:  -5, opacity: 0.41 },
  { left: 60, size: 88,  duration: 12, delay:  7.5, rotate:  14, opacity: 0.46 },
  { left: 88, size: 82,  duration: 15, delay:  5.2, rotate: -10, opacity: 0.43 },
];

// Remounting this resets all CSS animations — triggered by key change in parent
const FallingLogos = ({ src }) => (
  <div
    aria-hidden="true"
    style={{
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 10,
      overflow: "hidden",
    }}
  >
    <style>{`
      @keyframes logoFall {
        0%   { transform: translateY(-130px) rotate(var(--r)); opacity: 0; }
        8%   { opacity: var(--op); }
        92%  { opacity: var(--op); }
        100% { transform: translateY(110vh) rotate(var(--r)); opacity: 0; }
      }
    `}</style>

    {FLAKES.map((f, i) => (
      <img
        key={i}
        src={src}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          top: 0,
          left: `${f.left}vw`,
          width: `${f.size}px`,
          height: `${f.size}px`,
          objectFit: "contain",
          animation: `logoFall ${f.duration}s linear ${f.delay}s infinite backwards`,
          "--r": `${f.rotate}deg`,
          "--op": f.opacity,
          willChange: "transform, opacity",
        }}
      />
    ))}
  </div>
);

// key={pathname} causes FallingLogos to fully unmount+remount on every route change,
// which restarts all CSS animations from frame 0
const LogoSnowfall = ({ src = logoSrc }) => {
  const { pathname } = useLocation();
  return <FallingLogos key={pathname} src={src} />;
};

export default LogoSnowfall;
