import React, { useEffect, useMemo, useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = useMemo(
    () => [
      { label: "Home", href: "#home" },
      { label: "Flow", href: "#flow" },
      { label: "Services", href: "#services" },
      { label: "Blog", href: "#blog" },
      { label: "Faq", href: "#faq" },
    ],
    []
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#f8f2e8]/85 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-[68px] md:h-[76px]">
              <a
                href="/"
                className="inline-flex items-center gap-2.5 no-underline text-[#2f2620] font-semibold tracking-[0.01em]"
                aria-label="Home"
                style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
              >
                <span className="w-[28px] h-[28px] rounded-[8px] overflow-hidden bg-white border border-[#e7dccd] shadow-sm">
                  <img src="/assets/utlogobg.png" alt="" className="w-full h-full object-cover" />
                </span>
                <span className="text-[1.08rem] leading-none whitespace-nowrap">PsychoIntrovy</span>
              </a>

              <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
                {navLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="text-[#3e322a] text-[0.8rem] font-medium no-underline tracking-[0.01em] transition-colors duration-200 hover:text-[#8f6444]"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>

              <div className="hidden lg:flex items-center">
                <a
                  href="#signin"
                  className="inline-flex items-center justify-center px-5 py-2 rounded-full border border-[#c49373]/70 bg-[#c98562] text-[#fff8ef] text-[0.75rem] font-semibold tracking-[0.04em] no-underline shadow-[0_8px_22px_rgba(164,106,73,0.28)] transition-colors duration-200 hover:bg-[#b97857]"
                  style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  Get a Site
                </a>
              </div>

              <div className="flex lg:hidden items-center gap-2">
                <a
                  href="#signin"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-[#c49373]/70 bg-[#c98562] text-[#fff8ef] text-[0.75rem] font-semibold tracking-[0.04em] no-underline"
                >
                  Get a Site
                </a>
                <button
                  className="w-10 h-10 inline-flex flex-col items-center justify-center gap-1.5 rounded-full border border-[#e5d8c6] bg-[#fffaf3] transition-colors duration-200 hover:bg-[#fff5ea]"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Toggle menu"
                  aria-expanded={menuOpen}
                >
                  <span
                    className={[
                      "w-[18px] h-[1.5px] rounded bg-[#544339] transition-all duration-200 origin-center",
                      menuOpen ? "translate-y-[7px] rotate-45" : "",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "w-[18px] h-[1.5px] rounded bg-[#544339] transition-all duration-200 origin-center",
                      menuOpen ? "opacity-0 scale-x-75" : "",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "w-[18px] h-[1.5px] rounded bg-[#544339] transition-all duration-200 origin-center",
                      menuOpen ? "-translate-y-[7px] -rotate-45" : "",
                    ].join(" ")}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#2f231d]/25 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <div
            className="absolute top-0 right-0 h-full w-[min(340px,86vw)] bg-[#fffaf3] border-l border-[#eadfce] px-[22px] pt-[92px] pb-7 shadow-[-18px_0_70px_rgba(44,30,21,0.18)] flex flex-col gap-2.5"
            role="dialog"
            aria-modal="true"
          >
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="px-3.5 py-3 rounded-xl no-underline text-[#4a3b31] border border-transparent font-semibold hover:bg-[#f7eee1] hover:text-[#8f6444] transition-colors duration-150"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
