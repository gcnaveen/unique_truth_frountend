import { useEffect, useState } from "react";
import {
  getCounsellorSessionById,
  patchCounsellorSessionNotes,
  patchCounsellorSessionStatus,
} from "../../../../api/counsellor";
import {
  SESSION_STATUS_OPTIONS,
  formatDateTime,
  formatLabel,
} from "../../../utils/format";
import { useAppAlert } from "../../../../context/AppAlertContext";

export default function SessionDrawer({ sessionId, accessToken, open, onClose, onUpdated }) {
  const { confirm } = useAppAlert();
  const [session, setSession] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSession = async () => {
    const response = await getCounsellorSessionById(accessToken, sessionId);
    const data = response?.session ?? response?.data ?? response;
    setSession(data);
    return data;
  };

  useEffect(() => {
    if (!open || !sessionId || !accessToken) {
      setSession(null);
      setNote("");
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        await loadSession();
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load session.");
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, sessionId, accessToken]);

  const handleAddNote = async (event) => {
    event.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) {
      setError("Enter a note.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await patchCounsellorSessionNotes(accessToken, sessionId, { note: trimmed });
      setNote("");
      setSuccess("Note added.");
      await loadSession();
      onUpdated?.();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Failed to add note.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (status) => {
    const trimmed = note.trim();
    const labels = {
      completed: "Mark session as completed?",
      cancelled: "Cancel this session?",
      no_show: "Mark as no show?",
    };
    const isConfirmed = await confirm({
      title: "Update session",
      message: labels[status] || "Update status?",
      confirmLabel: "Update",
    });
    if (!isConfirmed) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const payload = { status };
      if (trimmed) payload.note = trimmed;
      const response = await patchCounsellorSessionStatus(accessToken, sessionId, payload);
      const updated = response?.session ?? null;
      if (updated) setSession(updated);
      else await loadSession();
      setNote("");
      setSuccess(response?.message || `Status: ${formatLabel(status)}`);
      onUpdated?.();
    } catch (statusError) {
      setError(statusError?.response?.data?.message || "Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const enquiry = session?.enquiry;
  const status = String(session?.status || "scheduled").toLowerCase();
  const canUpdateStatus = status === "scheduled";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-white/15 bg-[#0f2e1a]/98 p-5 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Session detail</h2>
            <p className="mt-1 text-sm text-white/80">
              {session ? `${formatLabel(session.sessionType)} · ${formatLabel(status)}` : "Loading…"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Close
          </button>
        </div>

        {error ? (
          <div className="mb-3 rounded-xl border border-red-300/50 bg-red-500/20 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-3 rounded-xl border border-emerald-300/40 bg-emerald-500/20 px-3 py-2 text-sm text-emerald-100">
            {success}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-white/70">Loading…</p>
        ) : session ? (
          <>
            <div className="grid gap-3 rounded-xl border border-white/15 bg-white/8 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-white/70">Scheduled</p>
                <p className="mt-1 text-white">{formatDateTime(session.scheduledAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-white/70">Duration</p>
                <p className="mt-1 text-white">
                  {session.durationMinutes ? `${session.durationMinutes} min` : "—"}
                </p>
              </div>
              {enquiry ? (
                <>
                  <div>
                    <p className="text-xs uppercase text-white/70">User</p>
                    <p className="mt-1 text-white">{enquiry.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/70">Contact</p>
                    <p className="mt-1 text-white">{enquiry.email || enquiry.phoneNumber || "—"}</p>
                  </div>
                </>
              ) : null}
            </div>

            <form onSubmit={handleAddNote} className="mt-6 space-y-3">
              <h3 className="text-base font-semibold text-white">Session notes</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Add remarks or follow-up notes…"
                className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#5eead4]"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg border border-[#5eead4]/50 bg-[#5eead4]/15 px-3 py-2 text-xs font-semibold text-[#a7f3d0] disabled:opacity-50"
                >
                  Add note
                </button>
                {canUpdateStatus
                  ? SESSION_STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={submitting}
                        onClick={() => handleStatus(opt.value)}
                        className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {opt.label}
                      </button>
                    ))
                  : null}
              </div>
            </form>

            <div className="mt-6">
              <h3 className="text-base font-semibold text-white">Notes timeline</h3>
              <div className="mt-3 space-y-2">
                {(session.notes || []).length === 0 ? (
                  <p className="text-sm text-white/70">No notes yet.</p>
                ) : (
                  [...(session.notes || [])]
                    .reverse()
                    .map((item, idx) => (
                      <div
                        key={`${item?.at || idx}-${idx}`}
                        className="rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm"
                      >
                        <p className="text-white/90">{item.note || "—"}</p>
                        <p className="mt-1 text-xs text-white/55">{formatDateTime(item.at)}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-white/70">Session not found.</p>
        )}
      </aside>
    </div>
  );
}
