import React, { useMemo } from "react";
import logoSrc from "/assets/nobglogo.png";

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function pickSpotCount(min, max) {
  return Math.floor(randomBetween(min, max + 0.999));
}

function generateSpots(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: randomBetween(6, 90),
    top: randomBetween(10, 85),
    size: randomBetween(52, 92),
    opacity: randomBetween(0.52, 0.72),
    delay: randomBetween(0, 5),
    duration: randomBetween(2.4, 4.2),
    rotate: randomBetween(-14, 14),
  }));
}

/** Fixed blink spots for the hero — stays in these 5 places, only opacity animates */
export const HERO_BLINK_SPOTS = [
  { id: 0, left: 9, top: 22, size: 68, opacity: 0.58, delay: 0, duration: 3.1, rotate: 11 },
  { id: 1, left: 86, top: 26, size: 58, opacity: 0.54, delay: 1.4, duration: 2.7, rotate: -9 },
  { id: 2, left: 7, top: 58, size: 72, opacity: 0.60, delay: 2.6, duration: 3.4, rotate: 8 },
  { id: 3, left: 90, top: 55, size: 62, opacity: 0.56, delay: 0.8, duration: 2.9, rotate: -12 },
  { id: 4, left: 16, top: 78, size: 54, opacity: 0.52, delay: 3.2, duration: 3.6, rotate: 6 },
];

/** About us section — edges, clear of center copy */
export const ABOUT_BLINK_SPOTS = [
  { id: 0, left: 8, top: 14, size: 64, opacity: 0.56, delay: 0, duration: 3.2, rotate: 10 },
  { id: 1, left: 87, top: 18, size: 56, opacity: 0.52, delay: 1.6, duration: 2.8, rotate: -11 },
  { id: 2, left: 6, top: 42, size: 70, opacity: 0.60, delay: 2.4, duration: 3.5, rotate: 7 },
  { id: 3, left: 91, top: 68, size: 60, opacity: 0.54, delay: 0.9, duration: 3.0, rotate: -8 },
  { id: 4, left: 12, top: 82, size: 52, opacity: 0.50, delay: 3.0, duration: 3.4, rotate: 5 },
];

/** Client reviews — sides of the testimonial card */
export const REVIEWS_BLINK_SPOTS = [
  { id: 0, left: 10, top: 20, size: 62, opacity: 0.56, delay: 0.2, duration: 3.0, rotate: 9 },
  { id: 1, left: 86, top: 24, size: 54, opacity: 0.52, delay: 1.5, duration: 2.9, rotate: -10 },
  { id: 2, left: 8, top: 70, size: 66, opacity: 0.60, delay: 2.8, duration: 3.3, rotate: 6 },
  { id: 3, left: 88, top: 66, size: 58, opacity: 0.54, delay: 1.0, duration: 2.7, rotate: -12 },
  { id: 4, left: 18, top: 48, size: 50, opacity: 0.50, delay: 3.4, duration: 3.6, rotate: 4 },
];

/**
 * LogoBlink — logo blinks at fixed spots inside its parent.
 * Pass `spots` for fixed positions; omit to randomize 3–5 spots once per mount.
 */
const LogoBlink = ({
  src = logoSrc,
  spots: spotsProp,
  minSpots = 3,
  maxSpots = 5,
  className = "",
}) => {
  const spots = useMemo(() => {
    if (spotsProp?.length) return spotsProp;
    return generateSpots(pickSpotCount(minSpots, maxSpots));
  }, [spotsProp, minSpots, maxSpots]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
    >
      <style>{`
        @keyframes logoBlink {
          0%, 100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9) rotate(var(--r));
          }
          48%, 52% {
            opacity: var(--op);
            transform: translate(-50%, -50%) scale(1) rotate(var(--r));
          }
        }
        .logo-blink-img {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.9) rotate(var(--r));
        }
      `}</style>

      {spots.map((s) => (
        <img
          key={s.id}
          src={src}
          alt=""
          draggable={false}
          className="logo-blink-img"
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            objectFit: "contain",
            filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.15))",
            animation: `logoBlink ${s.duration}s ease-in-out ${s.delay}s infinite backwards`,
            "--r": `${s.rotate}deg`,
            "--op": s.opacity,
            willChange: "opacity, transform",
          }}
        />
      ))}
    </div>
  );
};

export default LogoBlink;
