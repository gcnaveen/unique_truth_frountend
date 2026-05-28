import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "motion/react";
import PortalProfileMenu from "./PortalProfileMenu";

const navLinkClass = ({ isActive }) =>
  [
    "text-[0.84rem] font-medium tracking-[0.04em] no-underline transition-colors duration-300",
    isActive
      ? "text-[#c9a86c]"
      : "text-[rgba(255,248,236,0.72)] hover:text-[#c9a86c]",
  ].join(" ");

export default function PortalSiteHeader({
  navItems,
  hasAccess,
  profile,
  displayName,
  email,
  levelLabel,
  onLogout,
  showNav = true,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="relative z-30 border-b border-white/[0.08] bg-[#0F2E15]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:max-w-[110rem]">
        <motion.div
          className="flex h-[70px] min-w-0 flex-1 items-center justify-between md:h-[78px]"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/portal/dashboard" className="inline-flex shrink-0 items-center no-underline">
            <img
              src="/assets/utlogo.png"
              alt="Unique Truth"
              className="mt-2 h-[50px] w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:h-[58px] lg:h-[64px]"
            />
          </Link>

          {showNav && hasAccess ? (
            <nav
              className="mx-4 hidden flex-1 items-center justify-center gap-6 lg:flex xl:gap-8"
              aria-label="Member portal"
            >
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} end={item.end} className={navLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          ) : (
            <div className="hidden flex-1 lg:block" />
          )}

          <div className="flex shrink-0 items-center gap-2">
            {profile ? (
              <PortalProfileMenu
                profile={profile}
                displayName={displayName}
                email={email}
                levelLabel={levelLabel}
                onLogout={onLogout}
              />
            ) : null}

            {showNav && hasAccess ? (
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
            ) : null}
          </div>
        </motion.div>
      </div>

      {menuOpen && showNav && hasAccess ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#0a1f0e]/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute right-0 top-0 h-full w-[min(320px,85vw)] border-l border-white/10 bg-[#0F2E15]/97 px-5 pb-8 pt-24 shadow-[-18px_0_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-3.5 py-3 font-medium no-underline transition-colors",
                      isActive
                        ? "bg-white/[0.08] text-[#c9a86c]"
                        : "text-[rgba(255,248,236,0.88)] hover:bg-white/[0.06] hover:text-[#c9a86c]",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
