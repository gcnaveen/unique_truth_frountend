import { Link } from "react-router-dom";
import { motion } from "motion/react";
import LogoBlink, { HERO_BLINK_SPOTS } from "../../components/Logoblink";
import BrandText from "../../components/BrandText";

const FLOAT_PARTICLES = [
  ["12%", "22%", "hero-float-a", "0s", "h-2 w-2", "bg-[#c9a86c]/40"],
  ["86%", "38%", "hero-float-b", "1.1s", "h-1.5 w-1.5", "bg-teal-400/35"],
  ["24%", "68%", "hero-float-a", "1.8s", "h-1 w-1", "bg-[#c9a86c]/30"],
  ["78%", "74%", "hero-float-b", "0.6s", "h-2 w-2", "bg-teal-400/28"],
];

export default function PortalDashboardHero({
  firstName,
  levelLabel,
  stats = [],
}) {
  const displayStats =
    stats.length > 0
      ? stats
      : [
          { value: "—", label: "Enquiries" },
          { value: "—", label: "Upcoming" },
          { value: "—", label: "Completed" },
        ];

  return (
    <section className="relative -mx-4 overflow-hidden bg-[#0F2E15] md:-mx-8">
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <LogoBlink spots={HERO_BLINK_SPOTS} />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-teal-400/8 blur-[110px]" />
        <div className="absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-[#5eead4]/6 blur-[100px]" />
        <div className="hero-noise absolute inset-0 opacity-[0.028]" />
        <div className="absolute inset-y-0 left-[5%] hidden w-px bg-linear-to-b from-transparent via-[#c9a86c]/15 to-transparent lg:block" />
        {FLOAT_PARTICLES.map(([left, top, anim, delay, size, color], i) => (
          <div
            key={i}
            className={`absolute rounded-full ${size} ${color} ${anim}`}
            style={{ left, top, animationDelay: delay }}
          />
        ))}
        <div className="portal-rotate-slow absolute left-1/2 top-[32%] hidden h-40 w-40 -translate-x-1/2 rounded-full border border-[#5eead4]/10 lg:block" />
        <svg
          className="portal-rotate-slow absolute left-1/2 top-[34%] hidden h-36 w-36 -translate-x-1/2 opacity-[0.1] lg:block"
          viewBox="0 0 80 80"
          fill="none"
          aria-hidden
        >
          <circle cx="40" cy="40" r="36" stroke="#c9a86c" strokeWidth="0.7" strokeDasharray="4 8" />
          <circle cx="40" cy="40" r="26" stroke="#5eead4" strokeWidth="0.6" strokeDasharray="3 7" />
        </svg>
      </div>

      <motion.img
        src="/assets/toprightfinal.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 z-[8] w-[clamp(200px,32vw,420px)] max-w-none select-none"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-4 sm:px-6 lg:px-8 lg:pb-20 lg:pt-8 xl:max-w-[110rem]">
        <div className="relative flex min-h-[min(72vh,640px)] flex-col items-center justify-center py-10 lg:min-h-[min(68vh,580px)] lg:py-14">
          <div
            className="font-display pointer-events-none absolute left-1/2 top-1/2 w-full max-w-full -translate-x-1/2 -translate-y-1/2 select-none text-center text-[clamp(3rem,14vw,8rem)] font-light leading-none text-white/[0.025]"
            aria-hidden
          >
            <BrandText text="Unique TRUTH" />
          </div>

          <motion.div
            className="relative z-10 mx-auto w-full max-w-[720px] text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="inline-flex items-center gap-2.5 rounded-full border border-[#c9a86c]/30 bg-[#14381f]/70 px-5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[#c9a86c] shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset] backdrop-blur-md"
              animate={{
                boxShadow: [
                  "0 0 0 rgba(201,168,108,0), inset 0 0 0 1px rgba(255,255,255,0.05)",
                  "0 0 32px rgba(201,168,108,0.2), inset 0 0 0 1px rgba(255,255,255,0.08)",
                  "0 0 0 rgba(201,168,108,0), inset 0 0 0 1px rgba(255,255,255,0.05)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-[#c9a86c] shadow-[0_0_8px_#c9a86c]"
                animate={{ scale: [1, 1.35, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              Your member space
            </motion.span>

            <motion.h1
              className="font-display mt-7 text-[clamp(2.5rem,6vw,4.25rem)] font-light leading-[1.06] tracking-[-0.02em] text-[#fff8ef]"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.65 }}
            >
              <span className="block">Welcome back</span>
              {firstName ? (
                <motion.span
                  className="mt-1 block sm:mt-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="hero-unique-script bg-linear-to-r from-[#e7c387] via-[#fde68a] to-[#5eead4] bg-clip-text text-transparent">
                    {firstName}
                  </span>
                </motion.span>
              ) : null}
            </motion.h1>

            <motion.div
              className="mx-auto mt-7 flex max-w-xs items-center justify-center gap-3 sm:max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="h-px flex-1 max-w-[100px] bg-linear-to-r from-transparent to-[#c9a86c]/70"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={{ originX: 0.5 }}
              />
              <motion.div
                className="h-1.5 w-1.5 shrink-0 rotate-45 bg-[#c9a86c]"
                animate={{ rotate: [45, 135, 45] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              <motion.div
                className="h-px flex-1 max-w-[100px] bg-linear-to-l from-transparent to-[#5eead4]/50"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ originX: 0.5 }}
              />
            </motion.div>

            <motion.p
              className="mx-auto mt-6 max-w-[540px] text-[0.94rem] leading-[1.9] text-[rgba(255,248,236,0.58)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              Track your enquiry journey, connect with your counsellor, and manage upcoming
              sessions — all in one calm, private space crafted for you.
            </motion.p>

            {levelLabel ? (
              <motion.p
                className="mt-4 inline-flex rounded-full border border-[#5eead4]/25 bg-[#5eead4]/8 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#a7f3d0]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                {levelLabel}
              </motion.p>
            ) : null}

            <motion.div
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/portal/dashboard/enquiries"
                  className="hero-cta-primary inline-flex items-center gap-2 rounded-full border border-[#f6dfb3] bg-[#e7c387] px-8 py-3.5 text-[0.8rem] font-bold tracking-[0.12em] text-[#1a120c] no-underline shadow-[0_12px_40px_rgba(201,168,108,0.3)] ring-1 ring-[#fff3d7]/30"
                >
                  My journey
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/portal/dashboard/sessions"
                  className="hero-cta-ghost inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.06] px-8 py-3.5 text-[0.8rem] font-semibold tracking-[0.06em] text-[rgba(255,248,236,0.9)] no-underline backdrop-blur-sm"
                >
                  View sessions
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="mx-auto mt-14 grid w-full max-w-xl grid-cols-3 gap-3 sm:gap-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.75 } },
              }}
            >
              {displayStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.9 },
                    show: { opacity: 1, y: 0, scale: 1 },
                  }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.05] px-3 py-5 text-center backdrop-blur-md sm:px-4 sm:py-6"
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background:
                        i === 0
                          ? "linear-gradient(135deg, rgba(201,168,108,0.12), transparent)"
                          : i === 1
                            ? "linear-gradient(135deg, rgba(94,234,212,0.12), transparent)"
                            : "linear-gradient(135deg, rgba(148,163,184,0.1), transparent)",
                    }}
                  />
                  <motion.div
                    className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#c9a86c]/15 blur-xl"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3 + i, repeat: Infinity }}
                  />
                  <div className="font-display relative text-[clamp(1.5rem,4.5vw,2rem)] font-light leading-none text-[#c9a86c]">
                    {s.value}
                  </div>
                  <div className="relative mt-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[rgba(255,248,236,0.45)]">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
