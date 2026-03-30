import React from "react";

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function IconPhone() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-teal-400/80"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.59 2.64a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.44-1.16a2 2 0 0 1 2.11-.45c.86.27 1.74.47 2.64.59a2 2 0 0 1 1.72 2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-teal-400/80"
    >
      <path
        d="M4.5 6.5h15c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5V8c0-.83.67-1.5 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5.2 7.2 12 12.2l6.8-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[#c9a86c]"
    >
      <path
        d="M12 22s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 19V5M5 12l7-7 7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const exploreLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Growth", href: "#growth" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="font-body relative overflow-hidden border-t border-white/[0.06] bg-[#0a2210]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.024]"
        style={{
          backgroundImage: NOISE_BG,
          backgroundSize: "256px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-teal-400/5 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-[#c9a86c]/6 blur-[90px]"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#c9a86c]/45 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:py-20">
          {/* Brand */}
          <div className="lg:col-span-4">
            <a href="/" className="inline-flex items-center no-underline">
              <img
                src="/assets/utlogo.png"
                alt="Unique Truth"
                className="h-11 w-auto object-contain opacity-95 sm:h-12"
              />
            </a>
            <p
              className="mt-5 max-w-sm text-[0.9rem] leading-[1.85] text-[rgba(255,248,236,0.52)]"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Fingerprint intelligence for self-discovery — clarity, truth, and
              growth in one dignified journey.
            </p>
            <a
              href="#contact"
              className="mt-7 inline-flex items-center justify-center rounded-full border border-[#c9a86c]/45 bg-[#c9a86c] px-6 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#1a120c] no-underline shadow-[0_10px_32px_rgba(201,168,108,0.2)] transition-all duration-300 hover:border-[#d4b57e] hover:shadow-[0_14px_40px_rgba(201,168,108,0.28)]"
            >
              Start your journey
            </a>
          </div>

          {/* Explore */}
          <div className="lg:col-span-3 lg:pl-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.42em] text-[#c9a86c]/90">
              Explore
            </p>
            <nav
              className="mt-5 flex flex-col gap-2.5"
              aria-label="Footer navigation"
            >
              {exploreLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="w-fit text-[0.88rem] text-[rgba(255,248,236,0.72)] no-underline transition-colors duration-300 hover:text-[#c9a86c]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="lg:col-span-5">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.42em] text-teal-400/75">
              Reach us
            </p>
            <ul className="mt-5 space-y-4">
              <li>
                <a
                  href="tel:+916363786869"
                  className="group flex items-start gap-3 no-underline"
                >
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors duration-300 group-hover:border-[#c9a86c]/25">
                    <IconPhone />
                  </span>
                  <span>
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[rgba(255,248,236,0.38)]">
                      Phone
                    </span>
                    <span className="mt-0.5 block text-[0.92rem] text-[#fff8ef] transition-colors group-hover:text-[#c9a86c]">
                      +91 63637 86869
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:uniquetruthlife@gmail.com"
                  className="group flex items-start gap-3 no-underline"
                >
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors duration-300 group-hover:border-[#c9a86c]/25">
                    <IconMail />
                  </span>
                  <span>
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[rgba(255,248,236,0.38)]">
                      Email
                    </span>
                    <span className="mt-0.5 block break-all text-[0.92rem] text-[#fff8ef] transition-colors group-hover:text-[#c9a86c]">
                      uniquetruthlife@gmail.com
                    </span>
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <IconMapPin />
                </span>
                <span>
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[rgba(255,248,236,0.38)]">
                    Studio
                  </span>
                  <span className="mt-1 block max-w-xs text-[0.82rem] leading-[1.65] text-[rgba(255,248,236,0.55)]">
                    5820/37th Main Road, Manand Main Rd, Bharath Nagar, 2nd
                    Stage, Bengaluru, Karnataka 560091
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.06] py-7 sm:flex-row sm:items-center sm:justify-between sm:py-8">
          <p className="text-center text-[0.72rem] text-[rgba(255,248,236,0.38)] sm:text-left">
            © {year} Unique Truth. All rights reserved.
          </p>
          <button
            type="button"
            onClick={scrollTop}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[rgba(255,248,236,0.65)] backdrop-blur-sm transition-colors duration-300 hover:border-[#c9a86c]/35 hover:text-[#c9a86c] sm:mx-0"
          >
            <IconArrowUp />
            Top
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
