import { useEffect, useState } from "react";
import UserAvatar from "../../../../components/profile/UserAvatar";
import AppLoader from "../../../../components/AppLoader";
import AnnouncementAttachmentUploader from "../../../../components/announcements/AnnouncementAttachmentUploader";
import {
  AnnouncementAttachmentBadge,
} from "../../../../components/announcements/AnnouncementAttachments";
import {
  createAdminAnnouncement,
  getAdminAnnouncementById,
  patchAdminAnnouncement,
} from "../../../../api/announcements";
import { formatDateTime } from "../../../../portal/utils/format";
import { formatAccountRole } from "../../../../utils/accountProfile";
import {
  buildAttachmentInput,
  getAnnouncementAttachments,
} from "../../../../utils/announcementAttachments";
import {
  formatAnnouncementPreview,
  formatTargetRoles,
  getAnnouncementId,
  getReplyId,
  pickAnnouncement,
  pickAnnouncementThread,
} from "../../../../utils/announcements";

const panelClass = "rounded-2xl border border-white/15 bg-white/[0.07]";
const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#5eead4]/50";
const primaryBtnClass =
  "rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-5 py-2.5 text-sm font-bold text-[#0f2e1a] disabled:opacity-50";

export default function AdminAnnouncementCompose({ accessToken, onCreated }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedBody = body.trim();
    if (!trimmedBody && attachments.length === 0) {
      setError("Add a message, at least one attachment, or both.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const payload = {
        body: trimmedBody,
        ...(title.trim() ? { title: title.trim() } : {}),
        ...(attachments.length ? { attachments } : {}),
        targetRoles: ["user"],
      };
      const response = await createAdminAnnouncement(accessToken, payload);
      setTitle("");
      setBody("");
      setAttachments([]);
      onCreated?.(response);
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Failed to broadcast announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${panelClass} space-y-4 p-5`}>
      <div>
        <h2 className="text-lg font-semibold text-white">Broadcast message</h2>
        <p className="mt-1 text-sm text-white/60">
          Send an update to all portal members with text, photos, videos, or documents. They can
          reply in the thread and react with emoji.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/55">
          Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
          placeholder="Payment reminder"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/55">
          Message (optional if you attach media)
        </label>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={5}
          maxLength={5000}
          className={`${inputClass} resize-y`}
          placeholder="Write your announcement…"
        />
        <p className="mt-1 text-xs text-white/45">{body.length}/5000</p>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/55">
          Attachments
        </label>
        <AnnouncementAttachmentUploader
          accessToken={accessToken}
          attachments={attachments}
          onChange={setAttachments}
          disabled={submitting}
        />
      </div>

      <p className="text-xs text-white/50">Audience: Portal members only</p>

      <button type="submit" disabled={submitting} className={primaryBtnClass}>
        {submitting ? "Sending…" : "Send broadcast"}
      </button>
    </form>
  );
}

export function AdminAnnouncementListItem({ item, onSelect, onDelete, deleting }) {
  const id = getAnnouncementId(item);
  const replyCount = item?.replyCount || 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <button type="button" onClick={() => onSelect(item)} className="min-w-0 flex-1 text-left">
        <p className="font-medium text-white">{formatAnnouncementPreview(item)}</p>
        <p className="mt-1 text-xs text-white/55">
          {formatDateTime(item?.createdAt)} · {formatTargetRoles(item?.targetRoles)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
            {replyCount} repl{replyCount === 1 ? "y" : "ies"} · {item?.reactions?.total || 0}{" "}
            reactions
          </p>
          <AnnouncementAttachmentBadge announcement={item} />
        </div>
      </button>
      <button
        type="button"
        disabled={deleting}
        onClick={() => onDelete(id)}
        className="rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-100 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

export function AdminAnnouncementDetailDrawer({
  open,
  item,
  accessToken,
  onClose,
  onUpdated,
}) {
  const [detail, setDetail] = useState(item);
  const [replies, setReplies] = useState([]);
  const [editBody, setEditBody] = useState(item?.body || "");
  const [editAttachments, setEditAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const announcementId = getAnnouncementId(item);

  useEffect(() => {
    if (!open || !announcementId || !accessToken) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getAdminAnnouncementById(accessToken, announcementId);
        const thread = pickAnnouncementThread(response);
        const record = thread.announcement;
        setDetail(record);
        setReplies(thread.replies);
        setEditBody(record?.body || "");
        setEditAttachments(
          getAnnouncementAttachments(record).map((attachment) => buildAttachmentInput(attachment)),
        );
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load announcement.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, announcementId, accessToken]);

  const handleSave = async () => {
    if (!announcementId) return;
    const trimmedBody = editBody.trim();
    if (!trimmedBody && editAttachments.length === 0) {
      setError("Add message text, at least one attachment, or both.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const response = await patchAdminAnnouncement(accessToken, announcementId, {
        body: trimmedBody,
        ...(detail?.title ? { title: detail.title } : {}),
        attachments: editAttachments,
      });
      const record = pickAnnouncement(response) || {
        ...detail,
        body: trimmedBody,
        attachments: editAttachments,
      };
      setDetail(record);
      setEditAttachments(
        getAnnouncementAttachments(record).map((attachment) => buildAttachmentInput(attachment)),
      );
      onUpdated?.(record);
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Failed to update announcement.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const recent = detail?.reactions?.recent || [];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-white/15 bg-[#0f2e1a]/98 p-5 backdrop-blur-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Announcement detail</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Close
          </button>
        </div>

        {error ? (
          <p className="mb-3 rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        {loading ? (
          <AppLoader label="Loading announcement…" minHeight="min-h-[32vh]" compact />
        ) : detail ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-white/55">{formatDateTime(detail.createdAt)}</p>
              <p className="mt-1 text-xs text-white/55">
                Audience: {formatTargetRoles(detail.targetRoles)}
              </p>
            </div>

            {detail.title ? (
              <h3 className="text-lg font-semibold text-white">{detail.title}</h3>
            ) : null}

            <textarea
              value={editBody}
              onChange={(event) => setEditBody(event.target.value)}
              rows={6}
              className={`${inputClass} resize-y`}
            />

            <div>
              <h4 className="text-sm font-semibold text-white">Attachments</h4>
              <div className="mt-3">
                <AnnouncementAttachmentUploader
                  accessToken={accessToken}
                  attachments={editAttachments}
                  onChange={setEditAttachments}
                  disabled={saving}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl border border-[#5eead4]/50 bg-[#5eead4]/15 px-4 py-2 text-sm font-semibold text-[#a7f3d0] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>

            <div className={`${panelClass} p-4`}>
              <h4 className="text-sm font-semibold text-white">Replies ({replies.length})</h4>
              {replies.length === 0 ? (
                <p className="mt-3 text-sm text-white/55">No replies yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {replies.map((reply) => (
                    <li
                      key={getReplyId(reply)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-3"
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
                          <p className="text-xs text-white/55">
                            {formatAccountRole(reply?.user?.role)} ·{" "}
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

            <div className={`${panelClass} p-4`}>
              <h4 className="text-sm font-semibold text-white">
                Reactions ({detail?.reactions?.total || 0})
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {(detail?.reactions?.byEmoji || []).map((entry) => (
                  <span
                    key={entry.emoji}
                    className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-white"
                  >
                    {entry.emoji} {entry.count}
                  </span>
                ))}
              </div>
              {recent.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {recent.map((entry, index) => (
                    <li
                      key={`${entry?.user?.id || index}-${entry.emoji}`}
                      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <UserAvatar
                        name={entry?.user?.name || "User"}
                        photoUrl={entry?.user?.profilePhotoUrl}
                        size={32}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">
                          {entry?.user?.name || "User"}{" "}
                          <span className="text-base">{entry.emoji}</span>
                        </p>
                        <p className="text-xs text-white/55">
                          {formatAccountRole(entry?.user?.role)} ·{" "}
                          {formatDateTime(entry?.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-white/55">No reactions yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
