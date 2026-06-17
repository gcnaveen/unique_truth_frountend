import {
  deletePortalAnnouncementReaction,
  putPortalAnnouncementReaction,
} from "../../api/portal";
import { DEFAULT_ALLOWED_REACTIONS } from "../../utils/announcements";

const barBtnClass =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition disabled:opacity-50";

export default function AnnouncementReactionBar({
  announcementId,
  accessToken,
  allowedReactions = DEFAULT_ALLOWED_REACTIONS,
  reactions,
  onUpdated,
  disabled = false,
}) {
  const mine = reactions?.mine?.emoji || "";
  const byEmoji = Array.isArray(reactions?.byEmoji) ? reactions.byEmoji : [];

  const countFor = (emoji) =>
    byEmoji.find((item) => item.emoji === emoji)?.count || 0;

  const handleReact = async (emoji) => {
    if (!announcementId || !accessToken || disabled) return;
    try {
      let response;
      if (mine === emoji) {
        response = await deletePortalAnnouncementReaction(accessToken, announcementId);
      } else {
        response = await putPortalAnnouncementReaction(accessToken, announcementId, { emoji });
      }
      onUpdated?.(response);
    } catch (error) {
      onUpdated?.(null, error);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/55">React</p>
      <div className="flex flex-wrap gap-2">
        {allowedReactions.map((emoji) => {
          const active = mine === emoji;
          const count = countFor(emoji);
          return (
            <button
              key={emoji}
              type="button"
              disabled={disabled}
              onClick={() => handleReact(emoji)}
              className={[
                barBtnClass,
                active
                  ? "border-[#5eead4]/60 bg-[#5eead4]/20 text-[#a7f3d0]"
                  : "border-white/20 bg-white/5 text-white/85 hover:bg-white/10",
              ].join(" ")}
            >
              <span>{emoji}</span>
              {count > 0 ? <span className="text-xs font-semibold">{count}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
