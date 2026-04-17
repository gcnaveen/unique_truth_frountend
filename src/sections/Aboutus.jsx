import React, { useEffect, useRef, useState } from "react";
import FirefliesBackground from "../components/threejsanimations/Firefliesbackground";
import BrandText from "../components/BrandText";

/* ─── Google Fonts ───────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');

    .font-display { font-family: 'Cormorant Garamond', serif !important; }
    .font-body    { font-family: 'DM Sans', sans-serif !important; }

    @keyframes floatA {
      0%,100% { transform: translateY(0px) scale(1); opacity:.35; }
      50%      { transform: translateY(-14px) scale(1.1); opacity:.65; }
    }
    @keyframes floatB {
      0%,100% { transform: translateY(0px); opacity:.25; }
      50%      { transform: translateY(10px); opacity:.5; }
    }
    @keyframes spinSlow { to { transform: rotate(360deg); } }

    .animate-float-a { animation: floatA 5s ease-in-out infinite; }
    .animate-float-b { animation: floatB 7s ease-in-out infinite; }
    .animate-spin-slow { animation: spinSlow 18s linear infinite; }

    .pillar-card { transition: border-color .4s, background .4s, transform .35s cubic-bezier(.22,1,.36,1); }
    .pillar-card:hover { border-color: rgba(201,168,108,.3); transform: translateX(5px); }

    .stat-card { transition: border-color .4s, box-shadow .4s; }
    .stat-card:hover { border-color: rgba(201,168,108,.38); box-shadow: 0 22px 65px rgba(0,0,0,.42); }

    .vm-card { transition: border-color .4s, background .4s; }
    .vm-card:hover { border-color: rgba(255,255,255,.15); background: rgba(255,255,255,.065); }

    .noise-bg {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 256px;
    }

    .cta-btn { transition: background .3s, border-color .3s, letter-spacing .35s; }
    .cta-btn:hover { background: rgba(201,168,108,.13); border-color: rgba(201,168,108,.72); letter-spacing:.22em; }

    .glow-left  { transition: opacity .5s; }
    .pillar-card:hover .glow-left { opacity: 1 !important; }
    .vm-card:hover .corner-glow { opacity: 1 !important; }
  `}</style>
);

/* ─── useInView ──────────────────────────────────────────────────────── */
const useInView = (threshold = 0.12) => {
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

/* ─── FadeUp ─────────────────────────────────────────────────────────── */
const FadeUp = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const FadeLeft = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const FadeRight = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ─── Animated Counter ───────────────────────────────────────────────── */
const Counter = ({ to, suffix = "" }) => {
  const [val, setVal] = useState(0);
  const [ref, visible] = useInView(0.5);
  const started = useRef(false);
  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const steps = 60;
    const inc = to / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur += inc;
      if (cur >= to) {
        setVal(to);
        clearInterval(id);
      } else setVal(Math.floor(cur));
    }, 1400 / steps);
  }, [visible, to]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
};

/* ─── SVG Illustrations ──────────────────────────────────────────────── */
const GrowthIllustration = () => (
  <svg
    viewBox="0 0 320 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <radialGradient id="rg1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#5eead4" stopOpacity=".22" />
        <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="rg2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#c9a86c" stopOpacity=".18" />
        <stop offset="100%" stopColor="#c9a86c" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="stem" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5eead4" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
      <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#5eead4" stopOpacity=".9" />
        <stop offset="100%" stopColor="#22c55e" stopOpacity=".5" />
      </linearGradient>
      <filter id="soft">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
    <ellipse
      cx="160"
      cy="155"
      rx="130"
      ry="110"
      fill="url(#rg1)"
      filter="url(#soft)"
    />
    <ellipse
      cx="225"
      cy="90"
      rx="65"
      ry="55"
      fill="url(#rg2)"
      filter="url(#soft)"
    />
    <ellipse cx="160" cy="265" rx="72" ry="11" fill="#22c55e" opacity=".1" />
    <path
      d="M160 265 C160 205 156 158 160 108"
      stroke="url(#stem)"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M158 175 C134 154 104 150 94 133 C109 129 146 141 158 168"
      fill="url(#leaf)"
      opacity=".88"
    />
    <path
      d="M158 175 C140 159 118 145 94 133"
      stroke="#5eead4"
      strokeWidth=".8"
      opacity=".45"
    />
    <path
      d="M162 143 C186 122 218 116 229 100 C214 96 180 108 162 138"
      fill="url(#leaf)"
      opacity=".88"
    />
    <path
      d="M162 143 C183 127 204 110 229 100"
      stroke="#5eead4"
      strokeWidth=".8"
      opacity=".45"
    />
    <path
      d="M157 208 C138 193 115 191 107 178 C119 175 146 185 157 201"
      fill="url(#leaf)"
      opacity=".6"
    />
    <path
      d="M163 192 C180 179 198 177 205 165 C194 163 177 172 163 185"
      fill="url(#leaf)"
      opacity=".6"
    />
    <circle cx="160" cy="100" r="22" fill="#c9a86c" opacity=".13" />
    <circle cx="160" cy="100" r="13" fill="#c9a86c" opacity=".2" />
    <circle cx="160" cy="100" r="6" fill="#c9a86c" opacity=".65" />
    <circle cx="160" cy="100" r="2.5" fill="#fff8ef" opacity=".95" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((d, i) => {
      const x = 160 + 13 * Math.cos((d * Math.PI) / 180),
        y = 100 + 13 * Math.sin((d * Math.PI) / 180);
      return (
        <circle key={i} cx={x} cy={y} r="2.8" fill="#c9a86c" opacity=".5" />
      );
    })}
    {[
      [118, 78, 3.5],
      [248, 132, 2.8],
      [102, 192, 2],
      [238, 184, 3],
      [138, 246, 2.2],
    ].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#c9a86c" opacity=".38" />
    ))}
    <circle
      cx="160"
      cy="160"
      r="120"
      stroke="#5eead4"
      strokeWidth=".4"
      opacity=".07"
    />
    <circle
      cx="160"
      cy="160"
      r="85"
      stroke="#5eead4"
      strokeWidth=".4"
      opacity=".1"
    />
    <circle
      cx="160"
      cy="160"
      r="52"
      stroke="#c9a86c"
      strokeWidth=".4"
      opacity=".12"
    />
  </svg>
);

const BrainIllustration = () => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <defs>
      <radialGradient id="brg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#c9a86c" stopOpacity=".25" />
        <stop offset="100%" stopColor="#c9a86c" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="80" cy="80" rx="72" ry="65" fill="url(#brg)" />
    {[14, 26, 38, 50, 62].map((r, i) => (
      <circle
        key={i}
        cx="80"
        cy="80"
        r={r}
        stroke="#c9a86c"
        strokeWidth="1"
        fill="none"
        opacity={0.1 + i * 0.1}
        strokeDasharray={i % 2 === 0 ? "3 4" : "none"}
      />
    ))}
    <circle cx="80" cy="80" r="8" fill="#c9a86c" opacity=".65" />
    <circle cx="80" cy="80" r="3.2" fill="#fff8ef" opacity=".95" />
    {[
      [40, 48],
      [120, 48],
      [48, 104],
      [112, 104],
      [64, 64],
      [96, 64],
      [64, 96],
      [96, 96],
    ].map(([x, y], i) => (
      <g key={i}>
        <line
          x1="80"
          y1="80"
          x2={x}
          y2={y}
          stroke="#5eead4"
          strokeWidth=".7"
          opacity=".28"
        />
        <circle cx={x} cy={y} r="2.8" fill="#5eead4" opacity=".48" />
      </g>
    ))}
  </svg>
);

const ConstellationIllustration = () => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    {[
      [80, 32],
      [128, 64],
      [112, 120],
      [48, 120],
      [32, 64],
      [80, 88],
      [56, 52],
      [104, 52],
    ].map(([x, y], i) => (
      <g key={i}>
        <circle
          cx={x}
          cy={y}
          r={i < 5 ? 3.5 : 2}
          fill="#c9a86c"
          opacity={i < 5 ? 0.8 : 0.5}
        />
        <circle cx={x} cy={y} r={i < 5 ? 7 : 4} fill="#c9a86c" opacity=".08" />
      </g>
    ))}
    {[
      [80, 32, 128, 64],
      [128, 64, 112, 120],
      [112, 120, 48, 120],
      [48, 120, 32, 64],
      [32, 64, 80, 32],
      [80, 88, 56, 52],
      [80, 88, 104, 52],
      [80, 88, 80, 32],
      [80, 88, 128, 64],
      [80, 88, 32, 64],
    ].map(([x1, y1, x2, y2], i) => (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#5eead4"
        strokeWidth=".8"
        opacity=".22"
      />
    ))}
  </svg>
);

const StarIllustration = () => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
  >
    <circle
      cx="80"
      cy="80"
      r="52"
      stroke="#5eead4"
      strokeWidth=".8"
      opacity=".14"
    />
    <circle
      cx="80"
      cy="80"
      r="36"
      stroke="#5eead4"
      strokeWidth=".8"
      opacity=".2"
    />
    <circle
      cx="80"
      cy="80"
      r="20"
      stroke="#c9a86c"
      strokeWidth=".8"
      opacity=".3"
    />
    <path
      d="M80 44 L87 68 H112 L92 84 L99 108 L80 94 L61 108 L68 84 L48 68 H73 Z"
      fill="#c9a86c"
      opacity=".68"
    />
    <circle cx="80" cy="80" r="5" fill="#fff8ef" opacity=".7" />
  </svg>
);

/* ─── Data ───────────────────────────────────────────────────────────── */
const stats = [
  { value: 7200, suffix: "+", label: "Lives Transformed" },
  { value: 13, suffix: "+", label: "Years of Research" },
  { value: 100, suffix: "%", label: "Client Satisfaction" },
  { value: 50, suffix: "+", label: "Expert Consultants" },
];

const pillars = [
  {
    num: "01",
    title: "Self Discovery",
    Icon: BrainIllustration,
    body: "We help you gain clarity about self — uncovering your core truth that the world has failed to recognise. By analysing strengths, weaknesses, and behavioural patterns, we illuminate your grasping speed, thought process, and love languages.",
    indent: "",
  },
  {
    num: "02",
    title: "Child Development",
    Icon: ConstellationIllustration,
    body: "A child's growth begins in the womb. Unique Truth provides guidance to nurture development from the earliest stages — forming intelligence, personality, and potential throughout every chapter of the developmental journey.",
    indent: "sm:ml-8 lg:ml-16",
  },
  {
    num: "03",
    title: "Life Transformation",
    Icon: StarIllustration,
    body: "Our team educates individuals in life skills and teaches how to transform themselves. Mental blocks are gently dissolved and hearts opened — under the dignified, compassionate guidance of Unique Truth.",
    indent: "sm:ml-16 lg:ml-32",
  },
];

/* ─── Main ───────────────────────────────────────────────────────────── */
export default function Aboutus() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <GlobalStyles />

      <section
        id="about"
        className="font-body relative overflow-hidden bg-[#0F2E15]"
      >
        <div className="pointer-events-none absolute inset-0 z-0 opacity-70">
          <FirefliesBackground />
        </div>
        {/* ── Ambient glows ── */}
        <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden">
          <div className="absolute -left-40 top-16 h-96 w-96 rounded-full bg-teal-400/5 blur-[110px]" />
          <div className="absolute -right-24 top-72 h-[28rem] w-[28rem] rounded-full bg-[#c9a86c]/5 blur-[130px]" />
          <div className="absolute bottom-48 left-1/3 h-80 w-80 rounded-full bg-emerald-500/4 blur-[100px]" />
          {/* Noise */}
          <div className="noise-bg absolute inset-0 opacity-[0.022]" />
          {/* Vertical rules — desktop only */}
          <div className="absolute inset-y-0 left-[6%] hidden lg:block w-px bg-gradient-to-b from-transparent via-[#c9a86c]/10 to-transparent" />
          <div className="absolute inset-y-0 right-[6%] hidden lg:block w-px bg-gradient-to-b from-transparent via-teal-400/7 to-transparent" />
          {/* Floating orbs */}
          {[
            [
              "12%",
              "18%",
              "h-2 w-2",
              "bg-[#c9a86c]/40",
              "animate-float-a",
              "0s",
            ],
            [
              "85%",
              "35%",
              "h-1.5 w-1.5",
              "bg-teal-400/38",
              "animate-float-b",
              "1.2s",
            ],
            [
              "22%",
              "72%",
              "h-1 w-1",
              "bg-[#c9a86c]/28",
              "animate-float-a",
              "2s",
            ],
            [
              "75%",
              "78%",
              "h-2 w-2",
              "bg-teal-400/28",
              "animate-float-b",
              "0.7s",
            ],
            [
              "55%",
              "55%",
              "h-1.5 w-1.5",
              "bg-[#c9a86c]/22",
              "animate-float-a",
              "3s",
            ],
          ].map(([left, top, size, color, anim, delay], i) => (
            <div
              key={i}
              className={`absolute ${size} rounded-full ${color} ${anim}`}
              style={{ left, top, animationDelay: delay }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-14 py-20 sm:py-28 lg:py-36 xl:max-w-[110rem] xl:py-40">
          {/* ══════════════════════════════
              HERO HEADER
          ══════════════════════════════ */}
          <div className="mb-20 sm:mb-28 text-center relative">
            {/* Ghost watermark */}
            <div
              className="font-display pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[clamp(3rem,11vw,9rem)] font-light leading-none text-white/[0.024]"
              aria-hidden="true"
            >
              <BrandText text="Unique TRUTH" />
            </div>

            <FadeUp>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.55em] text-[#c9a86c] mb-5">
                STORY OF <BrandText text="Unique TRUTH" />
              </p>
            </FadeUp>

            <FadeUp delay={80}>
              <h2 className="font-display text-[clamp(2.1rem,5.5vw,3.8rem)] font-light leading-[1.18] text-[#fff8ef] 2xl:text-[clamp(2.6rem,4.6vw,4.4rem)]">
                Unleashing your true potential and uncovering your{" "}
                <em className="italic text-[#c9a86c]">Uniqueness.</em>
              </h2>
            </FadeUp>

            <FadeUp delay={150}>
              <div className="mx-auto mt-7 h-px w-28 bg-gradient-to-r from-transparent via-[#c9a86c]/65 to-transparent" />
            </FadeUp>

            <FadeUp delay={210}>
              <p className="mx-auto mt-7 max-w-2xl text-[1.04rem] leading-[1.9] text-[rgba(255,248,236,0.84)] sm:text-[1.08rem] xl:max-w-4xl xl:text-[1.14rem]">
                <BrandText text="Unique Truth" /> was established as a step
                forward in helping an
                individual whether it be a man, woman, or child into finding
                their unique self. Analysing brain mechanisms and utilising
                research backed methods we work to bring out your true
                potential. Our team provides you with a one-stop accurate
                solution to assess your day-to-day problems.
              </p>
            </FadeUp>
          </div>

          {/* ══════════════════════════════
              STATS
          ══════════════════════════════ */}
          <div className="mb-20 sm:mb-28 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
            {stats.map((s, i) => (
              <FadeUp key={i} delay={i * 65}>
                <div className="stat-card relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-7 sm:px-6 sm:py-8 text-center backdrop-blur-sm cursor-default xl:px-7 xl:py-9">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#c9a86c]/5 to-transparent" />
                  <p className="font-display text-[clamp(1.9rem,5vw,2.8rem)] font-light leading-none text-[#c9a86c]">
                    <Counter to={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[rgba(255,248,236,0.42)]">
                    {s.label}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* ══════════════════════════════
              VISION & MISSION
          ══════════════════════════════ */}
          <div className="mb-20 sm:mb-28 grid gap-4 sm:gap-5 md:grid-cols-2 xl:gap-6">
            {[
              {
                tag: "UNIQUE TRUTH VISION",
                heading: "Helping everyone to realise their unique natures",
                body: "Helping everyone to realise their unique natures through Fingerprint Analysis to dispel all upsets, confusions, myths, doubts, stress, worries, fears and insecurities.",
                accent: "#c9a86c",
                icon: (
                  <svg
                    viewBox="0 0 56 56"
                    fill="none"
                    className="w-11 h-11 shrink-0"
                  >
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="#c9a86c"
                      strokeWidth="1"
                      opacity=".28"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="10"
                      stroke="#c9a86c"
                      strokeWidth="1.4"
                    />
                    <circle cx="28" cy="28" r="3.5" fill="#c9a86c" />
                    {[0, 60, 120, 180, 240, 300].map((d, i) => {
                      const x = 28 + 18 * Math.cos((d * Math.PI) / 180),
                        y = 28 + 18 * Math.sin((d * Math.PI) / 180);
                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="1.8"
                          fill="#c9a86c"
                          opacity=".5"
                        />
                      );
                    })}
                    {[
                      ["28", "8", "28", "14"],
                      ["28", "42", "28", "48"],
                      ["8", "28", "14", "28"],
                      ["42", "28", "48", "28"],
                    ].map(([x1, y1, x2, y2], i) => (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#c9a86c"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        opacity=".55"
                      />
                    ))}
                  </svg>
                ),
              },
              {
                tag: "UNIQUE TRUTH MISSION",
                heading:
                  "Revealing hidden inborn personality and strengths",
                body: "Analysing individual's unique fingerprints to reveal their hidden inborn Personality, Skills, Intelligence, Core Qualities, Passions, and Strengths to live happily and confidently.",
                accent: "#5eead4",
                icon: (
                  <svg
                    viewBox="0 0 56 56"
                    fill="none"
                    className="w-11 h-11 shrink-0"
                  >
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      stroke="#5eead4"
                      strokeWidth="1"
                      opacity=".28"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="14"
                      stroke="#5eead4"
                      strokeWidth="1.2"
                      opacity=".55"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="6"
                      stroke="#5eead4"
                      strokeWidth="1.5"
                    />
                    <circle cx="28" cy="28" r="2.5" fill="#5eead4" />
                    <path
                      d="M38 18 L41 23 L28 28 L22 15 L27 13 L28 20 L37 16 Z"
                      fill="#5eead4"
                      opacity=".7"
                    />
                  </svg>
                ),
              },
            ].map((card, i) => (
              <FadeUp key={i} delay={i * 90}>
                <div className="vm-card group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-7 sm:p-9 backdrop-blur-sm cursor-default xl:p-10">
                  <div
                    className="absolute top-0 left-10 right-10 h-px"
                    style={{
                      background: `linear-gradient(90deg,transparent,${card.accent}52,transparent)`,
                    }}
                  />
                  <div
                    className="corner-glow pointer-events-none absolute -bottom-14 -right-14 h-40 w-40 rounded-full opacity-0 transition-opacity duration-700"
                    style={{
                      background: `radial-gradient(circle,${card.accent}14 0%,transparent 70%)`,
                    }}
                  />
                  <div className="flex items-start gap-5">
                    {card.icon}
                    <div>
                      <p
                        className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] mb-2"
                        style={{ color: card.accent }}
                      >
                        {card.tag}
                      </p>
                      <h3 className="font-display text-[1.2rem] sm:text-[1.35rem] font-light leading-snug text-[#fff8ef] mb-3 xl:text-[1.55rem]">
                        {card.heading}
                      </h3>
                      <p className="text-[0.86rem] leading-[1.84] text-[rgba(255,248,236,0.67)] xl:text-[0.95rem]">
                        {card.body}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* ══════════════════════════════
              CTA STRIP
          ══════════════════════════════ */}
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-[#1a4528]/80 to-[#0a2410]/80 px-7 py-11 sm:px-14 sm:py-16 text-center backdrop-blur-sm">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 75% at 50% 55%,rgba(201,168,108,.07) 0%,transparent 65%)",
                }}
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-44 bg-gradient-to-r from-transparent via-[#c9a86c]/52 to-transparent" />

              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.5em] text-[#c9a86c]/78 mb-4">
                Begin Your Journey
              </p>
              <h4 className="font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-light text-[#fff8ef] mb-7">
                Ready to meet your truest self?
              </h4>
              <button className="cta-btn inline-flex items-center gap-3 rounded-full border border-[#c9a86c]/36 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[#c9a86c]">
                Discover Your <BrandText text="Unique Truth" />
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </FadeUp>
        </div>

        {/* ── Back to top ── */}
        <button
          type="button"
          onClick={scrollTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-5 z-50 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[#c9a86c]/30 bg-[#0F2E15]/90 text-[#c9a86c] shadow-[0_10px_36px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 hover:border-[#c9a86c]/60 hover:bg-[#14381f] hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a86c]/45"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 19V5M5 12l7-7 7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </section>
    </>
  );
}
