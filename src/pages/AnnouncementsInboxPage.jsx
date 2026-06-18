import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import UserAvatar from "../components/profile/UserAvatar";
import AnnouncementReactionBar from "../components/announcements/AnnouncementReactionBar";
import {
  AnnouncementAttachmentBadge,
  AnnouncementAttachments,
} from "../components/announcements/AnnouncementAttachments";
import {
  deletePortalAnnouncementArchive,
  getPortalAnnouncementById,
  getPortalAnnouncements,
  postPortalAnnouncementArchive,
  postPortalAnnouncementReply,
} from "../api/portal";
import { formatDateTime } from "../portal/utils/format";
import {
  formatAnnouncementPreview,
  getAnnouncementId,
  getReplyId,
  isAnnouncementArchived,
  isAnnouncementUnread,
  normalizeAnnouncementList,
  pickAnnouncement,
  pickAnnouncementThread,
} from "../utils/announcements";
import PortalLoader from "../portal/components/PortalLoader";

const panelClass = "rounded-2xl border border-white/15 bg-white/[0.07]";
const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#5eead4]/50";
const tabClass = (active) =>
  [
    "rounded-xl px-4 py-2 text-sm font-semibold transition",
    active
      ? "bg-[#5eead4]/20 text-[#a7f3d0] border border-[#5eead4]/40"
      : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10",
  ].join(" ");

function AnnouncementListItem({ item, active, onSelect }) {
  const id = getAnnouncementId(item);
  const unread = isAnnouncementUnread(item);
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={[
        "w-full rounded-xl border px-4 py-3 text-left transition",
        active
          ? "border-[#5eead4]/50 bg-[#5eead4]/10"
          : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <UserAvatar
          name={item?.createdBy?.name || "Admin"}
          photoUrl={item?.createdBy?.profilePhotoUrl}
          size={36}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">
              {formatAnnouncementPreview(item)}
            </p>
            {unread ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#5eead4]" aria-hidden />
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-white/55">
            {item?.createdBy?.name || "Admin"} · {formatDateTime(item?.createdAt)}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-white/45">
            {(item?.replyCount || 0) > 0
              ? `${item.replyCount} repl${item.replyCount === 1 ? "y" : "ies"}`
              : "No replies yet"}
            {item?.reactions?.total > 0 ? ` · ${item.reactions.total} reactions` : ""}
          </p>
          <div className="mt-1">
            <AnnouncementAttachmentBadge announcement={item} />
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AnnouncementsInboxPage() {
  const { access_token } = useSelector((state) => state.user.value);
  const { refreshAnnouncementUnreadCount } = useOutletContext() ?? {};
  const [view, setView] = useState("inbox");
  const [items, setItems] = useState([]);
  const [allowedReactions, setAllowedReactions] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [replies, setReplies] = useState([]);
  const [canReply, setCanReply] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInbox = useCallback(async () => {
    if (!access_token) return;
    try {
      setLoading(true);
      setError("");
      const params =
        view === "archived"
          ? { page: 1, limit: 50, archived: true }
          : { page: 1, limit: 50 };
      const response = await getPortalAnnouncements(access_token, params);
      const parsed = normalizeAnnouncementList(response);
      setItems(parsed.items);
      setUnreadCount(parsed.unreadCount);
      setAllowedReactions(parsed.allowedReactions);
      refreshAnnouncementUnreadCount?.();
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load announcements.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [access_token, view, refreshAnnouncementUnreadCount]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const loadDetail = useCallback(
    async (announcementId) => {
      if (!access_token || !announcementId) return;
      try {
        setDetailLoading(true);
        setError("");
        const response = await getPortalAnnouncementById(access_token, announcementId);
        const thread = pickAnnouncementThread(response);
        const record = thread.announcement;
        setDetail(record);
        setReplies(thread.replies);
        setCanReply(thread.canReply);
        setAllowedReactions(thread.allowedReactions);
        setItems((prev) =>
          prev.map((item) =>
            getAnnouncementId(item) === announcementId
              ? {
                  ...item,
                  ...record,
                  replyCount: thread.replies.length,
                  viewerState: {
                    ...item.viewerState,
                    ...record.viewerState,
                    isRead: true,
                  },
                }
              : item,
          ),
        );
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load announcement.");
        setDetail(null);
        setReplies([]);
      } finally {
        setDetailLoading(false);
      }
    },
    [access_token],
  );

  const handleSelect = (item) => {
    const id = getAnnouncementId(item);
    setSelectedId(id);
    setDetail(item);
    setReplyBody("");
    loadDetail(id);
  };

  const handleArchiveToggle = async () => {
    if (!selectedId || !access_token) return;
    const archived = isAnnouncementArchived(detail);
    try {
      setActionLoading(true);
      setError("");
      if (archived) {
        await deletePortalAnnouncementArchive(access_token, selectedId);
      } else {
        await postPortalAnnouncementArchive(access_token, selectedId);
      }
      setSelectedId("");
      setDetail(null);
      setReplies([]);
      await loadInbox();
    } catch (actionError) {
      setError(actionError?.response?.data?.message || "Could not update archive state.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();
    const body = replyBody.trim();
    if (!body || !selectedId || !access_token) return;
    try {
      setActionLoading(true);
      setError("");
      const response = await postPortalAnnouncementReply(access_token, selectedId, { body });
      const reply = response?.reply ?? pickAnnouncement(response);
      if (reply) {
        setReplies((prev) => [...prev, reply]);
        setReplyBody("");
        setDetail((prev) =>
          prev ? { ...prev, replyCount: (prev.replyCount || replies.length) + 1 } : prev,
        );
      }
      await loadDetail(selectedId);
      await loadInbox();
    } catch (replyError) {
      setError(replyError?.response?.data?.message || "Could not post reply.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactionUpdated = (response, reactionError) => {
    if (reactionError) {
      setError(reactionError?.response?.data?.message || "Could not save reaction.");
      return;
    }
    if (response?.reactions) {
      setDetail((prev) => (prev ? { ...prev, reactions: response.reactions } : prev));
      setItems((prev) =>
        prev.map((item) =>
          getAnnouncementId(item) === selectedId
            ? { ...item, reactions: response.reactions }
            : item,
        ),
      );
    }
    loadDetail(selectedId);
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Announcements
          </h1>
          <p className="mt-2 text-sm text-white/75">
            Messages from admin. Reply in the thread, react with emoji, view photos and videos, or
            archive for yourself.
          </p>
        </div>
        {view === "inbox" && unreadCount > 0 ? (
          <span className="rounded-full border border-[#5eead4]/40 bg-[#5eead4]/15 px-3 py-1 text-xs font-bold text-[#a7f3d0]">
            {unreadCount} unread
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setView("inbox")} className={tabClass(view === "inbox")}>
          Inbox
        </button>
        <button
          type="button"
          onClick={() => setView("archived")}
          className={tabClass(view === "archived")}
        >
          Archived
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className={`${panelClass} p-4`}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/55">
            {view === "archived" ? "Archived messages" : "Inbox"}
          </h2>
          {loading ? (
            <PortalLoader label="Loading announcements…" minHeight="min-h-[24vh]" compact />
          ) : items.length === 0 ? (
            <p className="mt-4 text-sm text-white/60">
              {view === "archived" ? "No archived announcements." : "No announcements yet."}
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {items.map((item) => {
                const id = getAnnouncementId(item);
                return (
                  <li key={id}>
                    <AnnouncementListItem
                      item={item}
                      active={id === selectedId}
                      onSelect={handleSelect}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={`${panelClass} p-5`}>
          {!selectedId ? (
            <p className="text-sm text-white/60">Select an announcement to open the thread.</p>
          ) : detailLoading && !detail ? (
            <PortalLoader label="Loading thread…" minHeight="min-h-[28vh]" compact />
          ) : detail ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <UserAvatar
                    name={detail?.createdBy?.name || "Admin"}
                    photoUrl={detail?.createdBy?.profilePhotoUrl}
                    size={44}
                  />
                  <div>
                    <p className="font-semibold text-white">{detail?.createdBy?.name || "Admin"}</p>
                    <p className="text-xs text-white/55">{formatDateTime(detail?.createdAt)}</p>
                  </div>
                </div>
                {detail?.title ? (
                  <h2 className="mt-4 text-xl font-semibold text-white">{detail.title}</h2>
                ) : null}
                {detail?.body ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
                    {detail.body}
                  </p>
                ) : null}
                <div className="mt-4">
                  <AnnouncementAttachments
                    announcement={detail}
                    announcementId={selectedId}
                    accessToken={access_token}
                  />
                </div>
              </div>

              <AnnouncementReactionBar
                announcementId={selectedId}
                accessToken={access_token}
                allowedReactions={allowedReactions}
                reactions={detail?.reactions}
                disabled={actionLoading}
                onUpdated={handleReactionUpdated}
              />

              <div>
                <h3 className="text-sm font-semibold text-white">
                  Replies ({replies.length})
                </h3>
                {replies.length === 0 ? (
                  <p className="mt-2 text-sm text-white/55">No replies yet. Be the first to respond.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {replies.map((reply) => (
                      <li
                        key={getReplyId(reply)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                      >
                        <div className="flex items-start gap-3">
                          <UserAvatar
                            name={reply?.user?.name || "Member"}
                            photoUrl={reply?.user?.profilePhotoUrl}
                            size={32}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">
                              {reply?.user?.name || "Member"}
                            </p>
                            <p className="text-[10px] text-white/50">
                              {formatDateTime(reply?.createdAt)}
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">
                              {reply?.body}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {canReply ? (
                <form onSubmit={handleReplySubmit} className="border-t border-white/10 pt-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/55">
                    Your reply
                  </label>
                  <textarea
                    value={replyBody}
                    onChange={(event) => setReplyBody(event.target.value)}
                    rows={3}
                    maxLength={2000}
                    className={`${inputClass} resize-y`}
                    placeholder="Write your reply…"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading || !replyBody.trim()}
                    className="mt-3 rounded-xl border border-[#5eead4]/50 bg-[#5eead4]/15 px-4 py-2 text-sm font-semibold text-[#a7f3d0] disabled:opacity-50"
                  >
                    {actionLoading ? "Sending…" : "Post reply"}
                  </button>
                </form>
              ) : null}

              <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={handleArchiveToggle}
                  disabled={actionLoading}
                  className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 disabled:opacity-50"
                >
                  {actionLoading
                    ? "Saving…"
                    : isAnnouncementArchived(detail)
                      ? "Restore to inbox"
                      : "Archive for me"}
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
