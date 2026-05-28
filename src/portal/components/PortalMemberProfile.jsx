import { Link } from "react-router-dom";
import { getCounselingLevelLabel } from "../utils/format";
import { getAdvancePaymentStatus } from "../utils/access";

const paymentStatusLabel = {
  completed: "Active member",
  pending: "Payment pending",
  failed: "Payment issue",
};

function MemberAvatar({ name, size = 40 }) {
  const initial = name ? String(name).trim().charAt(0).toUpperCase() : "M";
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-[#0f2e1a] shadow-md ring-2 ring-white/20"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: "linear-gradient(135deg, #c9a86c, #5eead4)",
      }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

/**
 * @param {"compact" | "card" | "strip"} variant
 */
export default function PortalMemberProfile({
  profile,
  displayName,
  email,
  levelLabel,
  variant = "compact",
}) {
  const name = profile?.name || displayName || "Member";
  const emailLine = profile?.email || email || "";
  const phone = profile?.phoneNumber || profile?.phone || "";
  const level = levelLabel || profile?.counselingLevel;
  const franchise =
    profile?.franchise?.name || profile?.franchiseName || profile?.nearestFranchise?.name || "";
  const paymentStatus = getAdvancePaymentStatus(profile);
  const statusText = paymentStatusLabel[paymentStatus] || formatLabelSafe(paymentStatus);

  if (variant === "card") {
    return (
      <section className="rounded-3xl border border-white/15 bg-white/8 p-5 backdrop-blur-md md:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <MemberAvatar name={name} size={56} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5eead4]">
              Your profile
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-white">{name}</h2>
            {emailLine ? (
              <p className="mt-1 truncate text-sm text-white/70">{emailLine}</p>
            ) : null}
            {phone ? <p className="text-sm text-white/60">{phone}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {level ? (
                <span className="rounded-full border border-[#c9a86c]/40 bg-[#c9a86c]/15 px-3 py-1 text-xs font-semibold text-[#fde68a]">
                  {getCounselingLevelLabel(level)}
                </span>
              ) : null}
              <span className="rounded-full border border-[#5eead4]/35 bg-[#5eead4]/10 px-3 py-1 text-xs font-semibold text-[#a7f3d0]">
                {statusText}
              </span>
            </div>
            {franchise ? (
              <p className="mt-3 text-sm text-white/55">
                Branch: <span className="font-medium text-white/85">{franchise}</span>
              </p>
            ) : null}
          </div>
          <Link
            to="/portal/dashboard/settings"
            className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#5eead4]/40 hover:bg-white/15"
          >
            Account settings
          </Link>
        </div>
      </section>
    );
  }

  if (variant === "strip") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/6 px-3 py-2.5 sm:hidden">
        <MemberAvatar name={name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          {emailLine ? (
            <p className="truncate text-xs text-white/55">{emailLine}</p>
          ) : null}
        </div>
        {level ? (
          <span className="shrink-0 rounded-full border border-[#c9a86c]/35 bg-[#c9a86c]/12 px-2 py-0.5 text-[10px] font-semibold text-[#fde68a]">
            {getCounselingLevelLabel(level)}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 rounded-2xl border border-white/12 bg-white/6 px-3 py-2 sm:flex md:px-4">
      <MemberAvatar name={name} size={40} />
      <div className="min-w-0 text-right">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        {emailLine ? (
          <p className="truncate text-xs text-white/55">{emailLine}</p>
        ) : null}
      </div>
      {level ? (
        <span className="hidden rounded-full border border-[#c9a86c]/40 bg-[#c9a86c]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#fde68a] lg:inline">
          {getCounselingLevelLabel(level)}
        </span>
      ) : null}
    </div>
  );
}

function formatLabelSafe(value) {
  if (!value) return "Member";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
