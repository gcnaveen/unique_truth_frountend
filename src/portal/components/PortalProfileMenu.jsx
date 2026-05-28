import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { getCounselingLevelLabel } from "../utils/format";
import { getAdvancePaymentStatus } from "../utils/access";

function ProfileAvatar({ name, size = 40, active = false }) {
  const initial = name ? String(name).trim().charAt(0).toUpperCase() : "M";
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-full font-bold text-[#1a120c] transition ring-2",
        active ? "ring-[#c9a86c]/80 shadow-[0_0_20px_rgba(201,168,108,0.35)]" : "ring-white/25",
      ].join(" ")}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: "linear-gradient(135deg, #e7c387, #5eead4)",
      }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

export default function PortalProfileMenu({
  profile,
  displayName,
  email,
  levelLabel,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const name = profile?.name || displayName || "Member";
  const emailLine = profile?.email || email || "";
  const phone = profile?.phoneNumber || profile?.phone || "";
  const level = levelLabel || profile?.counselingLevel;
  const franchise =
    profile?.franchise?.name || profile?.franchiseName || profile?.nearestFranchise?.name || "";
  const paymentStatus = getAdvancePaymentStatus(profile);
  const statusLabel =
    paymentStatus === "completed"
      ? "Active member"
      : paymentStatus === "pending"
        ? "Payment pending"
        : "Member";

  useEffect(() => {
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.06] py-1 pl-1 pr-3 backdrop-blur-sm transition hover:border-[#c9a86c]/40 hover:bg-white/[0.1]"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open profile menu"
      >
        <ProfileAvatar name={name} size={36} active={open} />
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-[rgba(255,248,236,0.9)] sm:inline">
          {name.split(" ")[0]}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-white/60 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-50 mt-2 w-[min(300px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/12 bg-[#0F2E15]/98 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="border-b border-white/10 bg-white/[0.04] px-4 py-4">
              <div className="flex items-start gap-3">
                <ProfileAvatar name={name} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#fff8ef]">{name}</p>
                  {emailLine ? (
                    <p className="truncate text-xs text-[rgba(255,248,236,0.55)]">{emailLine}</p>
                  ) : null}
                  {phone ? (
                    <p className="mt-0.5 text-xs text-[rgba(255,248,236,0.45)]">{phone}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {level ? (
                      <span className="rounded-full border border-[#c9a86c]/35 bg-[#c9a86c]/12 px-2 py-0.5 text-[10px] font-semibold text-[#c9a86c]">
                        {getCounselingLevelLabel(level)}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-[#5eead4]/30 bg-[#5eead4]/10 px-2 py-0.5 text-[10px] font-semibold text-[#5eead4]">
                      {statusLabel}
                    </span>
                  </div>
                  {franchise ? (
                    <p className="mt-2 text-[11px] text-[rgba(255,248,236,0.45)]">
                      Branch: <span className="text-[rgba(255,248,236,0.75)]">{franchise}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="p-2">
              <Link
                to="/portal/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[rgba(255,248,236,0.88)] no-underline transition hover:bg-white/[0.06] hover:text-[#c9a86c]"
              >
                Account & privacy
              </Link>
              <Link
                to="/portal/dashboard"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[rgba(255,248,236,0.88)] no-underline transition hover:bg-white/[0.06] hover:text-[#c9a86c]"
              >
                Portal home
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout?.();
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
              >
                Sign out
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
