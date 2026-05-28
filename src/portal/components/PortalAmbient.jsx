import { motion } from "motion/react";

/** Soft animated backdrop for portal pages */
export default function PortalAmbient({ variant = "default" }) {
  const isHero = variant === "hero";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className={`absolute rounded-full blur-3xl ${
          isHero ? "right-[-10%] top-[-20%] h-[420px] w-[420px] bg-[#5eead4]/18" : "right-0 top-0 h-72 w-72 bg-[#5eead4]/12"
        }`}
        animate={{ x: [0, 24, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`absolute rounded-full blur-3xl ${
          isHero ? "bottom-[-15%] left-[-8%] h-[380px] w-[380px] bg-[#c9a86c]/16" : "bottom-0 left-0 h-64 w-64 bg-[#c9a86c]/10"
        }`}
        animate={{ x: [0, -20, 0], y: [0, 14, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {isHero ? (
        <>
          <motion.div
            className="absolute left-1/2 top-1/3 h-2 w-2 rounded-full bg-[#5eead4]/80 shadow-[0_0_12px_#5eead4]"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -30, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute right-[20%] top-[45%] h-1.5 w-1.5 rounded-full bg-[#fde68a]/90"
            animate={{ opacity: [0.2, 0.9, 0.2], y: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          />
          <motion.div
            className="portal-rotate-slow absolute left-[18%] top-[22%] h-32 w-32 rounded-full border border-[#5eead4]/15"
          />
        </>
      ) : null}
    </div>
  );
}
