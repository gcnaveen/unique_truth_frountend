import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButterflyBackground from "../components/threejsanimations/Butterflybackground";
import BrandText from "../components/BrandText";

/* ─── Shared styles (include once globally if already loaded) ────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');
    .font-display { font-family: 'Cormorant Garamond', serif !important; }
    .font-body    { font-family: 'DM Sans', sans-serif !important; }

    @keyframes floatA {
      0%,100% { transform: translateY(0) scale(1);    opacity:.35; }
      50%      { transform: translateY(-12px) scale(1.1); opacity:.6; }
    }
    @keyframes floatB {
      0%,100% { transform: translateY(0);  opacity:.22; }
      50%      { transform: translateY(9px); opacity:.48; }
    }
    @keyframes rotateSlow { to { transform: rotate(360deg); } }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }

    .srv-float-a { animation: floatA 5s ease-in-out infinite; }
    .srv-float-b { animation: floatB 7s ease-in-out infinite; }
    .srv-rotate   { animation: rotateSlow 22s linear infinite; }

    .srv-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 256px;
    }

    /* Card hover */
    .srv-card {
      transition: transform .45s cubic-bezier(.22,1,.36,1),
                  border-color .4s,
                  box-shadow .45s;
    }
    .srv-card:hover {
      transform: translateY(-6px);
      border-color: rgba(201,168,108,.32);
      box-shadow: 0 32px 80px rgba(0,0,0,.48), 0 0 0 1px rgba(201,168,108,.1);
    }
    .srv-card:hover .srv-icon-ring { border-color: rgba(201,168,108,.45); }
    .srv-card:hover .srv-glow      { opacity: 1; }
    .srv-card:hover .srv-num       { color: #c9a86c; }
    .srv-card:hover .srv-arrow     { transform: translate(4px,-4px); opacity:1; }
    .srv-card:hover .srv-bar       { transform: scaleX(1); }

    .srv-icon-ring { transition: border-color .4s; }
    .srv-glow      { transition: opacity .55s; }
    .srv-arrow     { transition: transform .35s, opacity .35s; }
    .srv-bar       { transition: transform .5s cubic-bezier(.22,1,.36,1); transform-origin: left; }

    /* Shimmer tag */
    .srv-shimmer {
      background: linear-gradient(100deg, #c9a86c 0%, #e8d5b5 40%, #c9a86c 60%, #a0784a 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 4s linear infinite;
    }
  `}</style>
);

/* ─── useInView ──────────────────────────────────────────────────────── */
const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const FadeUp = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useInView(0.08);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ─── Service SVG Icons ──────────────────────────────────────────────── */
const IconSkills = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="sk1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5eead4" />
        <stop offset="100%" stopColor="#22c55e" stopOpacity=".7" />
      </linearGradient>
    </defs>
    {/* Open book */}
    <path
      d="M32 14 C32 14 20 11 12 14 L12 50 C20 47 32 50 32 50 C32 50 44 47 52 50 L52 14 C44 11 32 14 32 14Z"
      stroke="url(#sk1)"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <line
      x1="32"
      y1="14"
      x2="32"
      y2="50"
      stroke="url(#sk1)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Lines on left page */}
    {[22, 27, 32, 37].map((y, i) => (
      <line
        key={i}
        x1="16"
        y1={y}
        x2="28"
        y2={y}
        stroke="#5eead4"
        strokeWidth=".9"
        strokeLinecap="round"
        opacity=".55"
      />
    ))}
    {/* Lines on right page */}
    {[22, 27, 32, 37].map((y, i) => (
      <line
        key={i}
        x1="36"
        y1={y}
        x2="48"
        y2={y}
        stroke="#5eead4"
        strokeWidth=".9"
        strokeLinecap="round"
        opacity=".55"
      />
    ))}
    {/* Floating spark */}
    <circle cx="50" cy="12" r="3" fill="#c9a86c" opacity=".7" />
    <circle cx="50" cy="12" r="6" fill="#c9a86c" opacity=".12" />
    <line
      x1="50"
      y1="6"
      x2="50"
      y2="9"
      stroke="#c9a86c"
      strokeWidth="1"
      strokeLinecap="round"
      opacity=".55"
    />
    <line
      x1="44"
      y1="12"
      x2="47"
      y2="12"
      stroke="#c9a86c"
      strokeWidth="1"
      strokeLinecap="round"
      opacity=".55"
    />
  </svg>
);

const IconBehaviour = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="bh1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c9a86c" />
        <stop offset="100%" stopColor="#5eead4" stopOpacity=".8" />
      </linearGradient>
    </defs>
    {/* Head silhouette */}
    <circle cx="32" cy="22" r="11" stroke="url(#bh1)" strokeWidth="1.4" />
    <path
      d="M16 52 C16 42 22 36 32 36 C42 36 48 42 48 52"
      stroke="url(#bh1)"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    {/* Brain waves */}
    <path
      d="M24 20 Q26 17 28 20 Q30 23 32 20 Q34 17 36 20 Q38 23 40 20"
      stroke="#5eead4"
      strokeWidth="1"
      strokeLinecap="round"
      fill="none"
      opacity=".7"
    />
    {/* Radiate lines */}
    {[
      [-14, -14],
      [-18, 0],
      [-14, 14],
      [14, -14],
      [18, 0],
      [14, 14],
    ].map(([dx, dy], i) => (
      <line
        key={i}
        x1={32}
        y1={22}
        x2={32 + dx}
        y2={22 + dy}
        stroke="#c9a86c"
        strokeWidth=".7"
        strokeLinecap="round"
        opacity=".3"
      />
    ))}
  </svg>
);

const IconRelationship = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="rl1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5eead4" />
        <stop offset="100%" stopColor="#c9a86c" stopOpacity=".8" />
      </linearGradient>
    </defs>
    {/* Two figures */}
    <circle cx="22" cy="20" r="7" stroke="url(#rl1)" strokeWidth="1.3" />
    <circle cx="42" cy="20" r="7" stroke="url(#rl1)" strokeWidth="1.3" />
    <path
      d="M10 48 C10 40 14 34 22 34"
      stroke="url(#rl1)"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M54 48 C54 40 50 34 42 34"
      stroke="url(#rl1)"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    {/* Heart bridge */}
    <path
      d="M32 38 C30 34 24 34 24 39 C24 43 32 48 32 48 C32 48 40 43 40 39 C40 34 34 34 32 38Z"
      fill="#c9a86c"
      opacity=".65"
    />
    {/* Connection line */}
    <line
      x1="22"
      y1="34"
      x2="24"
      y2="38"
      stroke="#5eead4"
      strokeWidth=".8"
      opacity=".45"
    />
    <line
      x1="42"
      y1="34"
      x2="40"
      y2="38"
      stroke="#5eead4"
      strokeWidth=".8"
      opacity=".45"
    />
  </svg>
);

const IconTalent = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <linearGradient id="tl1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#c9a86c" />
        <stop offset="100%" stopColor="#5eead4" stopOpacity=".9" />
      </linearGradient>
    </defs>
    {/* Diamond / gem */}
    <path
      d="M32 10 L50 26 L32 54 L14 26 Z"
      stroke="url(#tl1)"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M14 26 L32 10 L50 26"
      stroke="url(#tl1)"
      strokeWidth="1.2"
      strokeLinejoin="round"
      opacity=".5"
    />
    <line
      x1="14"
      y1="26"
      x2="50"
      y2="26"
      stroke="url(#tl1)"
      strokeWidth="1"
      opacity=".4"
    />
    <line
      x1="32"
      y1="10"
      x2="32"
      y2="54"
      stroke="url(#tl1)"
      strokeWidth=".8"
      opacity=".25"
    />
    {/* Inner facet */}
    <path d="M23 26 L32 15 L41 26 L32 44 Z" fill="#c9a86c" opacity=".12" />
    {/* Sparkles */}
    {[
      [52, 10],
      [12, 10],
      [54, 46],
    ].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="2.2" fill="#c9a86c" opacity=".55" />
        <line
          x1={x}
          y1={y - 5}
          x2={x}
          y2={y - 8}
          stroke="#c9a86c"
          strokeWidth=".9"
          strokeLinecap="round"
          opacity=".4"
        />
        <line
          x1={x + 4}
          y1={y}
          x2={x + 7}
          y2={y}
          stroke="#c9a86c"
          strokeWidth=".9"
          strokeLinecap="round"
          opacity=".4"
        />
      </g>
    ))}
  </svg>
);

/* ─── Services data ──────────────────────────────────────────────────── */
const services = [
  {
    num: "01",
    title: "Skills Behind Studies",
    short:
      "World's first proven scientific approach to find a child's specific learning method to learn anything stress free and develop Concentration, Comprehension, and long-term memory.",
    desc: "Every student's brain is wired differently. We decode your unique learning mechanism, study patterns, and cognitive strengths — helping you study smarter, retain more, and perform with confidence.",
    image: "/assets/services/skillsbehindstudies/skillsbehindstud.png",
    accentFrom: "#5eead4",
    accentTo: "#22c55e",
  },
  {
    num: "02",
    title: "Behavioural Awareness",
    short:
      "Understand why you think, react, and decide the way you do — and transform your patterns for lasting growth.",
    desc: "Behaviour is the language of the subconscious. Through deep analysis of your behavioural tendencies, triggers, and thought cycles, we help you shift from unconscious patterns to intentional living.",
    image: "/assets/services/behavioralawareness/Behavioralawareness.png",
    accentFrom: "#c9a86c",
    accentTo: "#e8d5b5",
  },
  {
    num: "03",
    title: "Relationship Awareness",
    short:
      "Uncover your relational blueprints, love languages, and connection styles for deeper, healthier bonds.",
    desc: "Every relationship mirrors a part of you. We help you understand how you attach, communicate, and love — enabling you to build fulfilling relationships with family, partners, and colleagues alike.",
    image: "/assets/services/relationshipawareness/benifitsofr.png",
    accentFrom: "#5eead4",
    accentTo: "#c9a86c",
  },
  {
    num: "04",
    title: "Talent Awareness",
    short:
      "Reveal the innate gifts and natural abilities you were born with — and align your life's path with your truest potential.",
    desc: "Talent is not learned — it is uncovered. Using fingerprint intelligence and brain profiling, we identify your core natural gifts so you can choose careers, passions, and paths that feel effortless and fulfilling.",
    image: "/assets/services/talentawareness/benifits2.png",
    accentFrom: "#c9a86c",
    accentTo: "#5eead4",
  },
];

/* ─── Expanded card modal ────────────────────────────────────────────── */
const ServiceModal = ({ service, onClose }) => {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!service) return null;
  const { title, desc, image, accentFrom } = service;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0F2E15] shadow-[0_40px_120px_rgba(0,0,0,0.7)] p-8 sm:p-10"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 40px 120px rgba(0,0,0,.7), 0 0 0 1px ${accentFrom}22`,
        }}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute -top-16 -left-16 h-52 w-52 rounded-full blur-[80px]"
          style={{
            background: `radial-gradient(circle,${accentFrom}18 0%,transparent 70%)`,
          }}
        />

        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 shrink-0 rounded-2xl border border-white/8 bg-[#14381f]/80 flex items-center justify-center p-1.5 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-contain rounded-xl"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div>
            <h4 className="font-display text-[1.35rem] font-light text-[#fff8ef]">
              {title}
            </h4>
          </div>
        </div>

        <div
          className="h-px mb-6"
          style={{
            background: `linear-gradient(90deg,${accentFrom}40,transparent)`,
          }}
        />

        <p className="text-[0.9rem] leading-[1.9] text-[rgba(255,248,236,0.72)]">
          {desc}
        </p>

        <button
          onClick={onClose}
          className="mt-8 w-full rounded-full border border-white/10 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[rgba(255,248,236,0.5)] transition-all duration-300 hover:border-[#c9a86c]/40 hover:text-[#c9a86c]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────────────────── */
export default function Ourservices() {
  const [active, setActive] = useState(null);
  const navigate = useNavigate();

  const handleServiceActivate = (svc) => {
    if (svc.title === "Skills Behind Studies") {
      navigate("/skills-behind-studies");
      return;
    }
    if (svc.title === "Behavioural Awareness") {
      navigate("/behavioural-awareness");
      return;
    }
    if (svc.title === "Relationship Awareness") {
      navigate("/relationship-awareness");
      return;
    }
    if (svc.title === "Talent Awareness") {
      navigate("/talent-awareness");
      return;
    }
    setActive(svc);
  };

  return (
    <>
      <GlobalStyles />

      <section
        id="services"
        className="font-body relative overflow-hidden bg-[#0F2E15]"
      >
        <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
          <ButterflyBackground />
        </div>
        {/* ── Ambient glows ── */}
        <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden">
          <div className="absolute -right-40 top-10 h-[28rem] w-[28rem] rounded-full bg-[#c9a86c]/5 blur-[130px]" />
          <div className="absolute -left-32 bottom-32 h-96 w-96 rounded-full bg-teal-400/5 blur-[110px]" />
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/4 blur-[100px]" />
          <div className="srv-noise absolute inset-0 opacity-[0.022]" />
          {/* Vertical rules */}
          <div className="absolute inset-y-0 left-[6%] hidden lg:block w-px bg-gradient-to-b from-transparent via-[#c9a86c]/10 to-transparent" />
          <div className="absolute inset-y-0 right-[6%] hidden lg:block w-px bg-gradient-to-b from-transparent via-teal-400/7 to-transparent" />
          {/* Particles */}
          {[
            ["10%", "15%", "h-2 w-2", "bg-[#c9a86c]/38", "srv-float-a", "0s"],
            [
              "88%",
              "28%",
              "h-1.5 w-1.5",
              "bg-teal-400/35",
              "srv-float-b",
              "1.4s",
            ],
            ["25%", "70%", "h-1 w-1", "bg-[#c9a86c]/25", "srv-float-a", "2.2s"],
            ["72%", "80%", "h-2 w-2", "bg-teal-400/25", "srv-float-b", "0.8s"],
            [
              "50%",
              "50%",
              "h-1.5 w-1.5",
              "bg-[#c9a86c]/20",
              "srv-float-a",
              "3.1s",
            ],
          ].map(([l, t, s, c, a, d], i) => (
            <div
              key={i}
              className={`absolute ${s} rounded-full ${c} ${a}`}
              style={{ left: l, top: t, animationDelay: d }}
            />
          ))}
          {/* Rotating ring */}
          <div className="absolute right-[8%] top-[12%] w-24 h-24 opacity-15 hidden lg:block">
            <svg viewBox="0 0 96 96" fill="none" className="srv-rotate">
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="#c9a86c"
                strokeWidth=".8"
                strokeDasharray="5 7"
              />
              <circle
                cx="48"
                cy="48"
                r="32"
                stroke="#5eead4"
                strokeWidth=".6"
                strokeDasharray="3 9"
              />
            </svg>
          </div>
          <div className="absolute left-[7%] bottom-[14%] w-16 h-16 opacity-12 hidden lg:block">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              className="srv-rotate"
              style={{ animationDirection: "reverse" }}
            >
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#5eead4"
                strokeWidth=".7"
                strokeDasharray="4 6"
              />
            </svg>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-14 py-20 sm:py-28 lg:py-36 xl:max-w-[110rem] xl:py-40">
          {/* ══════════════════════════════
              HEADER
          ══════════════════════════════ */}
          <div className="mb-16 sm:mb-20 text-center relative">
            {/* Ghost watermark */}
            <div
              className="font-display pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[clamp(2.5rem,9vw,7.5rem)] font-light leading-none text-white/[0.022]"
              aria-hidden="true"
            >
              OUR SERVICES
            </div>

            <FadeUp>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.55em] text-[#c9a86c] mb-5">
                What We Offer
              </p>
            </FadeUp>

            <FadeUp delay={80}>
              <h2 className="font-display text-[clamp(2.1rem,5.5vw,3.8rem)] font-light leading-[1.18] text-[#fff8ef] 2xl:text-[clamp(2.6rem,4.6vw,4.4rem)]">
                Services crafted for your{" "}
                <em className="italic text-[#c9a86c]">
                  <BrandText text="Unique Truth" />
                </em>
              </h2>
            </FadeUp>

            <FadeUp delay={150}>
              <div className="mx-auto mt-7 h-px w-28 bg-gradient-to-r from-transparent via-[#c9a86c]/65 to-transparent" />
            </FadeUp>

            <FadeUp delay={210}>
              <p className="mx-auto mt-7 max-w-lg text-[0.9rem] leading-[1.92] text-[rgba(255,248,236,0.56)] xl:max-w-2xl xl:text-[1rem]">
                Each service is a doorway into a deeper understanding of
                yourself — your mind, your relationships, and the gifts you were
                born to share.
              </p>
            </FadeUp>
          </div>

          {/* ══════════════════════════════
              SERVICE CARDS — 2×2 GRID
          ══════════════════════════════ */}
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 mb-16 sm:mb-20 xl:gap-6">
            {services.map((svc, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div
                  className="srv-card group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/7 bg-[#14381f]/70 backdrop-blur-sm p-7 sm:p-8 lg:p-9 xl:p-10"
                  onClick={() => handleServiceActivate(svc)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleServiceActivate(svc)
                  }
                  aria-label={`Learn more about ${svc.title}`}
                >
                  {/* Top accent bar */}
                  <div
                    className="srv-bar absolute top-0 left-8 right-8 h-px scale-x-0"
                    style={{
                      background: `linear-gradient(90deg,transparent,${svc.accentFrom}60,${svc.accentTo}40,transparent)`,
                    }}
                  />

                  {/* Ambient glow (bottom corner) */}
                  <div
                    className="srv-glow pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full opacity-0"
                    style={{
                      background: `radial-gradient(circle,${svc.accentFrom}14 0%,transparent 70%)`,
                    }}
                  />

                  {/* Top row */}
                  <div className="flex items-start justify-between mb-6">
                    {/* Icon */}
                    <div className="srv-icon-ring flex h-30 w-30 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-[#0F2E15]/60 p-1.5 overflow-hidden">
                      <img
                        src={svc.image}
                        alt={svc.title}
                        className="h-full w-full object-contain rounded-xl"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    {/* Number + arrow */}
                    <div className="flex flex-col items-end gap-2">
                      <span className="srv-num text-[0.58rem] font-semibold tabular-nums tracking-widest text-[rgba(255,248,236,0.3)] transition-colors duration-300">
                        {svc.num}
                      </span>
                      <svg
                        className="srv-arrow h-4 w-4 opacity-30 text-[#c9a86c]"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 13L13 3M13 3H6M13 3V10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-[1.25rem] sm:text-[1.38rem] font-light leading-snug text-[#fff8ef] mb-4 xl:text-[1.55rem]">
                    {svc.title}
                  </h3>

                  {/* Divider */}
                  <div
                    className="mb-4 h-px w-10"
                    style={{
                      background: `linear-gradient(90deg,${svc.accentFrom}50,transparent)`,
                    }}
                  />

                  {/* Short description */}
                  <p className="flex-1 text-[0.86rem] leading-[1.85] text-[rgba(255,248,236,0.62)] xl:text-[0.94rem]">
                    {svc.short}
                  </p>

                  {/* Learn more */}
                  <div className="mt-6 flex items-center gap-2">
                    <span
                      className="text-[0.68rem] font-semibold uppercase tracking-[0.28em]"
                      style={{ color: svc.accentFrom }}
                    >
                      Learn More
                    </span>
                    <svg
                      className="srv-arrow h-3.5 w-3.5"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ color: svc.accentFrom }}
                    >
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* ══════════════════════════════
              BOTTOM ACCENT ROW
          ══════════════════════════════ */}
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-[#1a4528]/80 to-[#0a2410]/80 px-7 py-10 sm:px-14 sm:py-12 backdrop-blur-sm">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 80% at 50% 60%,rgba(201,168,108,.07) 0%,transparent 65%)",
                }}
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-44 bg-gradient-to-r from-transparent via-[#c9a86c]/50 to-transparent" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.48em] text-[#c9a86c]/75 mb-2">
                    Not Sure Where to Start?
                  </p>
                  <h4 className="font-display text-[clamp(1.2rem,2.8vw,1.9rem)] font-light text-[#fff8ef]">
                    Let us help you find your path.
                  </h4>
                </div>
                <button className="whitespace-nowrap rounded-full border border-[#c9a86c]/35 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#c9a86c] transition-all duration-300 hover:bg-[#c9a86c]/12 hover:border-[#c9a86c]/68">
                  Book a Consultation
                </button>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* ── Modal ── */}
        {active && (
          <ServiceModal service={active} onClose={() => setActive(null)} />
        )}
      </section>
    </>
  );
}
