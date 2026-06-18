import { motion } from "motion/react";
import BrandText from "../BrandText";
import { BRAND_LOADER_COLORS, brandLoaderBackground } from "./brandLoaderTheme";

function LogoMark({ compact = false }) {
  const size = compact ? "clamp(72px, 12vw, 110px)" : "clamp(100px, 16vw, 180px)";

  return (
    <motion.div
      animate={{
        scale: [1, 1.045, 1],
        opacity: [0.88, 1, 0.88],
      }}
      transition={{
        duration: 2.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <img
        src="/assets/nobglogo.png"
        alt="Unique Truth"
        className="pointer-events-none block h-auto select-none"
        style={{
          width: size,
          filter: `drop-shadow(0 0 14px ${BRAND_LOADER_COLORS.teal}55)`,
        }}
      />
    </motion.div>
  );
}

function BrandLockup({ compact = false }) {
  if (compact) return null;

  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-baseline gap-2">
        <span
          className="font-semibold tracking-[0.06em] text-[#fff8ef]"
          style={{ fontSize: "clamp(20px, 3vw, 28px)" }}
        >
          <BrandText text="Unique" />
        </span>
        <span
          className="font-medium uppercase tracking-[0.24em] text-[#5eead4]"
          style={{ fontSize: "clamp(12px, 1.8vw, 15px)" }}
        >
          <BrandText text="TRUTH" />
        </span>
      </div>
      <motion.div
        className="h-0.5 rounded-full bg-linear-to-r from-[#5eead4] to-[#c9a86c]"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: "clamp(140px, 24vw, 200px)" }}
      />
    </motion.div>
  );
}

function IndeterminateProgressBar({ compact = false }) {
  const width = compact ? "clamp(120px, 22vw, 180px)" : "clamp(160px, 30vw, 220px)";

  return (
    <div
      className="relative overflow-hidden rounded-full bg-white/10"
      style={{ width, height: compact ? 2 : 3 }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-[#5eead4] via-[#0F2E15] to-[#c9a86c]"
        style={{ width: "42%" }}
        animate={{ x: ["-120%", "280%"] }}
        transition={{
          duration: 1.35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

function CornerDots() {
  const dots = [
    { top: "6%", left: "6%", color: BRAND_LOADER_COLORS.teal },
    { top: "6%", right: "6%", color: BRAND_LOADER_COLORS.gold },
    { bottom: "6%", left: "6%", color: BRAND_LOADER_COLORS.teal },
    { bottom: "6%", right: "6%", color: BRAND_LOADER_COLORS.gold },
  ];

  return dots.map((dot, index) => (
    <motion.div
      key={index}
      className="pointer-events-none absolute h-1.5 w-1.5 rounded-full"
      style={{
        top: dot.top,
        left: dot.left,
        right: dot.right,
        bottom: dot.bottom,
        background: dot.color,
      }}
      animate={{ opacity: [0.25, 0.75, 0.25] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.35,
      }}
    />
  ));
}

function SplashContent({ label, compact = false, showBrand = true, showCorners = false }) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div
          className="rounded-full"
          style={{
            width: compact ? 260 : 420,
            height: compact ? 260 : 420,
            background: `radial-gradient(circle, ${BRAND_LOADER_COLORS.teal}20 0%, ${BRAND_LOADER_COLORS.gold}10 40%, transparent 68%)`,
            transform: "translateY(-4%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5 px-4 text-center">
        <LogoMark compact={compact} />
        {showBrand ? <BrandLockup compact={compact} /> : null}
        <div className="flex flex-col items-center gap-3">
          <IndeterminateProgressBar compact={compact} />
          {label ? (
            <motion.p
              className="max-w-xs text-[11px] font-light uppercase tracking-[0.22em] text-white/45"
              animate={{ opacity: [0.45, 0.85, 0.45] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {label}
            </motion.p>
          ) : null}
        </div>
      </div>

      {showCorners ? <CornerDots /> : null}
    </>
  );
}

export default function BrandSplashLoader({
  label = "Loading…",
  variant = "inline",
  compact = false,
  className = "",
  minHeight = "min-h-[50vh]",
}) {
  const isOverlay = variant === "overlay";

  if (isOverlay) {
    return (
      <div
        className={["fixed inset-0 z-50 flex items-center justify-center", className].join(" ")}
        style={{ background: brandLoaderBackground }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <SplashContent
            label={label}
            compact={compact}
            showBrand
            showCorners
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "relative flex w-full items-center justify-center overflow-hidden",
        minHeight,
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <SplashContent
        label={label}
        compact={compact}
        showBrand={!compact}
        showCorners={false}
      />
    </div>
  );
}
