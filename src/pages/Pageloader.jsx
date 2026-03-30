import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ── Brand tokens – matched to website theme ──────────────────
const C = {
  teal: "#5eead4",
  gold: "#c9a86c",
  green: "#0F2E15",
  darkGreen: "#0a1f14",
  lightText: "#fff8ef",
  ink: "#0a1f14",
};

// ── Logo reveal: image fades + scales in as progress 0→100 ────
function LogoReveal({ progress }) {
  const p = Number.isFinite(progress)
    ? Math.min(100, Math.max(0, progress)) / 100
    : 1;
  // Opacity: starts at 0, reaches full by ~80% progress
  const opacity = Math.min(p * 1.25, 1);
  // Scale: starts at 0.78, reaches 1.0 at 100%
  const scale = 0.78 + p * 0.22;
  // Blur: starts blurry, clears as progress grows
  const blur = Math.max(0, 10 - p * 12);
  // Vertical drift: starts 20px down, rises to 0
  const translateY = Math.max(0, 20 - p * 24);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        filter: `blur(${blur}px)`,
        transition:
          "opacity 0.18s ease-out, transform 0.18s ease-out, filter 0.18s ease-out",
        willChange: "opacity, transform, filter",
      }}
    >
      <img
        src="/assets/nobglogo.png"
        alt="Unique Truth"
        style={{
          width: "clamp(140px, 20vw, 220px)",
          height: "auto",
          display: "block",
          userSelect: "none",
          pointerEvents: "none",
          filter: `drop-shadow(0 0 ${8 + (1 - p) * 12}px ${C.teal}${Math.round(
            p * 0.4 * 255,
          )
            .toString(16)
            .padStart(2, "0")})`,
        }}
      />
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────
function ProgressBar({ progress }) {
  const value = Number.isFinite(progress)
    ? Math.min(100, Math.max(0, progress))
    : 100;
  return (
    <div
      style={{
        width: "clamp(160px, 30vw, 220px)",
        height: "2px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          height: "100%",
          borderRadius: "999px",
          background: `linear-gradient(90deg, ${C.teal}, ${C.green}, ${C.gold})`,
        }}
        initial={{ width: "0%" }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      />
    </div>
  );
}

// ── Main PageLoader ───────────────────────────────────────────
export default function PageLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const totalDuration = 2200; // ms total
    const interval = 30; // tick every 30ms
    const steps = totalDuration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const raw = steps > 0 ? current / steps : 1;
      const eased = 1 - Math.pow(1 - raw, 1.8);
      const value = Math.min(100, Math.max(0, Math.round(eased * 100)));
      if (Number.isFinite(value)) setProgress(value);

      if (current >= steps) {
        clearInterval(timer);
        // Brief pause at 100% then exit
        setTimeout(() => {
          setVisible(false);
          onComplete?.();
        }, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: `linear-gradient(135deg, ${C.darkGreen} 0%, ${C.green} 50%, #0d2416 100%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Radial glow behind logo */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "420px",
                height: "420px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${C.teal}20 0%, ${C.gold}10 40%, transparent 68%)`,
                transform: "translateY(-5%)",
              }}
            />
          </div>

          {/* Content stack */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0px",
            }}
          >
            {/* ── Logo image reveal ── */}
            <div style={{ marginBottom: "28px" }}>
              <LogoReveal progress={progress} />
            </div>

            {/* ── Brand name ── */}
            <motion.div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                marginBottom: "28px",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Name row */}
              <div
                style={{ display: "flex", alignItems: "baseline", gap: "8px" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-cormorant-garamond), serif",
                    fontWeight: 600,
                    fontSize: "clamp(24px, 4vw, 34px)",
                    color: C.lightText,
                    letterSpacing: "0.06em",
                  }}
                >
                  Unique
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(14px, 2vw, 18px)",
                    color: C.teal,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                  }}
                >
                  TRUTH
                </span>
              </div>

              {/* Rainbow underline — animates width on mount */}
              <motion.div
                style={{
                  height: "2px",
                  borderRadius: "999px",
                  background: `linear-gradient(90deg, ${C.teal}, ${C.gold})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 0.7,
                  delay: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              {/* Tagline */}
              <motion.p
                style={{
                  marginTop: "8px",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontWeight: 300,
                  fontSize: "10px",
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                Reveals Your Unique Natures
              </motion.p>
            </motion.div>

            {/* ── Progress bar + % ── */}
            <motion.div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <ProgressBar progress={progress} />
              <span
                style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontWeight: 300,
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  color: `rgba(${parseInt(C.teal.slice(1, 3), 16)},${parseInt(C.teal.slice(3, 5), 16)},${parseInt(C.teal.slice(5, 7), 16)},0.4)`,
                }}
              >
                {Number.isFinite(progress) ? progress : 100}%
              </span>
            </motion.div>
          </div>

          {/* Corner accent dots */}
          {[
            { top: "6%", left: "6%", color: C.teal },
            { top: "6%", right: "6%", color: C.gold },
            { bottom: "6%", left: "6%", color: C.teal },
            { bottom: "6%", right: "6%", color: C.gold },
          ].map((dot, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: dot.color,
                top: dot.top,
                left: dot.left,
                right: dot.right,
                bottom: dot.bottom,
              }}
              animate={{ opacity: [0.25, 0.7, 0.25] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
