import { Link } from "react-router-dom";
import { PORTAL_ANNOUNCEMENTS_PATH } from "../../utils/announcements";

export default function PortalAnnouncementNotice({ unreadCount, className = "" }) {
  if (!unreadCount || unreadCount <= 0) return null;

  const label =
    unreadCount === 1
      ? "You have 1 unread announcement from admin."
      : `You have ${unreadCount} unread announcements from admin.`;

  return (
    <Link
      to={PORTAL_ANNOUNCEMENTS_PATH}
      className={[
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#5eead4]/35 bg-[#5eead4]/10 px-4 py-3 text-sm transition hover:border-[#5eead4]/55 hover:bg-[#5eead4]/15",
        className,
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#5eead4]/40 bg-[#5eead4]/20 text-base"
          aria-hidden
        >
          📣
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-[#a7f3d0]">New announcement</p>
          <p className="text-white/75">{label}</p>
        </div>
      </div>
      <span className="shrink-0 font-semibold text-[#5eead4]">View →</span>
    </Link>
  );
}
