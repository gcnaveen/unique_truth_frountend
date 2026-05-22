import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import BrandText from "../components/BrandText";

const HeroStyles = () => (
  <style>{`
    html {
      scroll-behavior: smooth;
    }
    @keyframes heroFloatA {
      0%, 100% { transform: translateY(0px) scale(1); opacity: 0.35; }
      50% { transform: translateY(-14px) scale(1.1); opacity: 0.62; }
    }
    @keyframes heroFloatB {
      0%, 100% { transform: translateY(0px); opacity: 0.22; }
      50% { transform: translateY(10px); opacity: 0.48; }
    }
    @keyframes heroRotateSlow { to { transform: rotate(360deg); } }
    .hero-float-a { animation: heroFloatA 5s ease-in-out infinite; }
    .hero-float-b { animation: heroFloatB 7s ease-in-out infinite; }
    .hero-rotate-slow { animation: heroRotateSlow 22s linear infinite; }
    .hero-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 256px;
    }
    .hero-cta-primary {
      transition: background 0.25s, border-color 0.25s, box-shadow 0.35s, transform 0.25s;
    }
    .hero-cta-primary:hover {
      box-shadow: 0 12px 40px rgba(201, 168, 108, 0.22);
      transform: translateY(-1px);
    }
    .hero-login-btn {
      box-shadow: 0 10px 30px rgba(201, 168, 108, 0.35);
    }
    .hero-login-btn:hover {
      box-shadow: 0 14px 40px rgba(201, 168, 108, 0.5);
    }
    .hero-unique-script {
      font-family: var(--font-pacifico), "Pacifico", "Segoe Script", cursive;
      font-style: normal;
      letter-spacing: 0.01em;
    }
    .hero-cta-ghost {
      transition: background 0.25s, border-color 0.25s, color 0.25s;
    }
    .hero-cta-ghost:hover {
      border-color: rgba(201, 168, 108, 0.45);
      background: rgba(255, 255, 255, 0.07);
    }
  `}</style>
);

const Hero = ({ onEnquireClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const stats = [
    { value: "100%", label: "Accuracy" },
    { value: "7K+", label: "Reports" },
    { value: "13 Years+", label: "Research" },
  ];
  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "About us", href: "#about" },
    { label: "Career", href: "#career" },
    { label: "Contact us", href: "#contact" },
  ];

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <HeroStyles />
      <section
        id="home"
        className="font-body relative min-h-screen overflow-hidden bg-[#0F2E15]"
      >
        {/* Plain base + premium accents; decorative layer stays under the corner art */}
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-teal-400/6 blur-[110px]" />
          <div className="absolute -right-28 top-32 h-[28rem] w-[28rem] rounded-full bg-[#c9a86c]/6 blur-[130px]" />
          <div className="absolute bottom-20 left-1/3 h-80 w-80 rounded-full bg-emerald-500/5 blur-[100px]" />
          <div className="hero-noise absolute inset-0 opacity-[0.028]" />
          <div className="absolute inset-y-0 left-[6%] hidden lg:block w-px bg-gradient-to-b from-transparent via-[#c9a86c]/12 to-transparent" />
          <div className="absolute inset-y-0 right-[6%] hidden lg:block w-px bg-gradient-to-b from-transparent via-teal-400/8 to-transparent" />
          {[
            ["12%", "22%", "h-2 w-2", "bg-[#c9a86c]/40", "hero-float-a", "0s"],
            [
              "86%",
              "38%",
              "h-1.5 w-1.5",
              "bg-teal-400/35",
              "hero-float-b",
              "1.1s",
            ],
            [
              "24%",
              "68%",
              "h-1 w-1",
              "bg-[#c9a86c]/30",
              "hero-float-a",
              "1.8s",
            ],
            ["78%", "74%", "h-2 w-2", "bg-teal-400/28", "hero-float-b", "0.6s"],
          ].map(([left, top, size, color, anim, delay], i) => (
            <div
              key={i}
              className={`absolute ${size} rounded-full ${color} ${anim}`}
              style={{ left, top, animationDelay: delay }}
            />
          ))}
          <div className="absolute right-[10%] top-[18%] hidden h-20 w-20 opacity-[0.14] lg:block">
            <svg viewBox="0 0 80 80" fill="none" className="hero-rotate-slow">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="#c9a86c"
                strokeWidth="0.7"
                strokeDasharray="4 8"
              />
              <circle
                cx="40"
                cy="40"
                r="26"
                stroke="#5eead4"
                strokeWidth="0.6"
                strokeDasharray="3 7"
              />
            </svg>
          </div>
        </div>

        <motion.img
          src="/assets/toprightfinal.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 z-[8] w-[clamp(220px,28vw,420px)] max-w-none select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8 xl:max-w-[110rem]">
          <motion.div
            className="flex h-[70px] items-center justify-between md:h-[78px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              href="/"
              className="inline-flex items-center no-underline"
              aria-label="Home"
            >
              <img
                src="/assets/utlogo.png"
                alt="Unique Truth"
                className="h-[50px] mt-2 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:h-[58px] lg:h-[68px] xl:h-[78px] 2xl:h-[88px]"
              />
            </a>

            <nav
              className="hidden items-center gap-8 lg:flex lg:-ml-10"
              aria-label="Primary"
            >
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-[0.84rem] font-medium tracking-[0.04em] text-[rgba(255,248,236,0.72)] no-underline transition-colors duration-300 hover:text-[#c9a86c]"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <a
                href="/login"
                className="hero-cta-primary hero-login-btn inline-flex items-center justify-center rounded-full border border-[#f6dfb3] bg-[#e7c387] px-4 py-2 text-[0.75rem] font-bold tracking-[0.12em] text-[#1a120c] no-underline ring-1 ring-[#fff3d7]/40 sm:px-5 sm:py-2.5 sm:text-[0.8rem]"
              >
                Login
              </a>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/14 bg-white/[0.06] backdrop-blur-sm lg:hidden"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <span className="relative h-3.5 w-4">
                  <span
                    className={[
                      "absolute left-0 top-0 h-[1.5px] w-4 rounded-full bg-[#fff8ef]/90 transition-all",
                      menuOpen ? "translate-y-[6px] rotate-45" : "",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 top-[6px] h-[1.5px] w-4 rounded-full bg-[#fff8ef]/90 transition-all",
                      menuOpen ? "opacity-0" : "",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 top-3 h-[1.5px] w-4 rounded-full bg-[#fff8ef]/90 transition-all",
                      menuOpen ? "-translate-y-[6px] -rotate-45" : "",
                    ].join(" ")}
                  />
                </span>
              </button>
            </div>
          </motion.div>

          {menuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-[#0a1f0e]/70 backdrop-blur-sm"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              />
              <div className="absolute right-0 top-0 h-full w-[min(320px,85vw)] border-l border-white/10 bg-[#0F2E15]/97 px-5 pb-8 pt-24 shadow-[-18px_0_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
                <div className="flex flex-col gap-1">
                  {navLinks.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl px-3.5 py-3 font-medium text-[rgba(255,248,236,0.88)] no-underline transition-colors hover:bg-white/[0.06] hover:text-[#c9a86c]"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex min-h-[calc(100vh-78px)] items-center justify-center pb-[72px] pt-[20px] lg:pt-[16px]">
            <motion.div
              className="relative w-[min(920px,calc(100%-8px))] text-center"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
                delay: 0,
              }}
            >
              <div
                className="font-display pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[42%] select-none whitespace-nowrap text-[clamp(2.5rem,10vw,7.5rem)] font-light leading-none text-white/[0.03]"
                aria-hidden="true"
              >
                <BrandText text="Unique TRUTH" />
              </div>

              <span className="relative inline-flex items-center rounded-full border border-[#c9a86c]/25 bg-[#14381f]/60 px-5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[#c9a86c] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-sm">
                Fingerprint Analysis
              </span>

              <h1 className="font-display relative mt-6 text-[clamp(2.75rem,6.2vw,5rem)] font-light leading-[1.05] tracking-[-0.02em] text-[#fff8ef] 2xl:text-[clamp(3.25rem,5.4vw,6rem)]">
                <span className="block sm:inline">Reveals Your</span>
                <span className="block sm:ml-2">
                  <span className="hero-unique-script text-[#c9a86c]">
                    <BrandText text="Unique" />
                  </span>{" "}
                  Nature
                </span>
              </h1>

              <div className="relative mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#c9a86c]/60 to-transparent" />

              <p className="relative mx-auto mt-6 max-w-[620px] text-[0.92rem] leading-[1.85] text-[rgba(255,248,236,0.55)] xl:max-w-[760px] xl:text-[1.02rem]">
                Discover your true self through the world’s first scientific
                methodology that uses 18 concepts and 92 parameters to provide a
                100% accurate assessment of innate nature, effectively resolving
                personal and professional misconceptions.
              </p>

              <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3 xl:gap-4">
                <button
                  type="button"
                  onClick={onEnquireClick}
                  className="cursor-pointer hero-cta-primary inline-flex items-center gap-2 rounded-full border border-[#c9a86c]/60 bg-[#c9a86c] px-7 py-3 text-[0.78rem] font-semibold tracking-[0.14em] text-[#1a120c] no-underline shadow-[0_10px_32px_rgba(201,168,108,0.25)] xl:px-8 xl:py-3.5 xl:text-[0.84rem]"
                >
                  Enquire Now
                </button>

                <a
                  href="#contact"
                  className="hero-cta-ghost inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.05] px-7 py-3 text-[0.78rem] font-medium tracking-[0.08em] text-[rgba(255,248,236,0.82)] no-underline backdrop-blur-sm xl:px-8 xl:py-3.5 xl:text-[0.84rem]"
                >
                  Contact Us
                </a>
              </div>

              <div className="relative mx-auto mt-12 grid max-w-xl grid-cols-3 gap-3 sm:gap-4 xl:max-w-2xl xl:gap-5">
                {stats.map((s) => (
                  <div
                    key={s.value}
                    className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-5 text-center backdrop-blur-sm sm:px-4 sm:py-6"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#c9a86c]/[0.07] to-transparent" />
                    <div className="font-display relative text-[clamp(1.45rem,4vw,1.85rem)] font-light leading-none text-[#c9a86c]">
                      {s.value}
                    </div>
                    <div className="relative mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[rgba(255,248,236,0.42)]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
