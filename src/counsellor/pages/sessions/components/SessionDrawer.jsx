import { useEffect, useState } from "react";
import {
  getCounsellorSessionById,
  patchCounsellorSession,
  patchCounsellorSessionNotes,
  patchCounsellorSessionStatus,
} from "../../../../api/counsellor";
import {
  SESSION_STATUS_OPTIONS,
  SESSION_TYPES,
  formatDateTime,
  formatLabel,
  getSessionStatusTone,
  isActiveSessionStatus,
} from "../../../utils/format";
import { useAppAlert } from "../../../../context/AppAlertContext";
import { formatRupees } from "../../../../portal/utils/format";

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toTimeInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toTimeString().slice(0, 5);
};

export default function SessionDrawer({ sessionId, accessToken, open, onClose, onUpdated }) {
  const { confirm } = useAppAlert();
  const [session, setSession] = useState(null);
  const [note, setNote] = useState("");
  const [rescheduleForm, setRescheduleForm] = useState({
    sessionType: "counselling",
    date: "",
    time: "",
    durationMinutes: "60",
    amountRupees: "",
    counsellorRemarks: "",
    notifyUser: true,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSession = async () => {
    const response = await getCounsellorSessionById(accessToken, sessionId);
    const data = response?.session ?? response?.data ?? response;
    setSession(data);
    setRescheduleForm({
      sessionType: data?.sessionType || "counselling",
      date: toDateInput(data?.scheduledAt),
      time: toTimeInput(data?.scheduledAt),
      durationMinutes: String(data?.durationMinutes || 60),
      amountRupees: data?.amountRupees != null ? String(data.amountRupees) : "",
      counsellorRemarks: data?.counsellorRemarks || "",
      notifyUser: true,
    });
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

  const handleRescheduleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setRescheduleForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReschedule = async (event) => {
    event.preventDefault();
    if (!rescheduleForm.date || !rescheduleForm.time) {
      setError("Date and time are required to reschedule.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const payload = {
        sessionType: rescheduleForm.sessionType,
        date: rescheduleForm.date,
        time: rescheduleForm.time,
        notifyUser: Boolean(rescheduleForm.notifyUser),
      };
      const duration = Number(rescheduleForm.durationMinutes);
      if (Number.isFinite(duration) && duration >= 15) payload.durationMinutes = duration;
      if (rescheduleForm.counsellorRemarks.trim()) {
        payload.counsellorRemarks = rescheduleForm.counsellorRemarks.trim();
      }
      if (status === "pending_payment") {
        const amount = Number(rescheduleForm.amountRupees);
        if (Number.isFinite(amount) && amount > 0) payload.amountRupees = amount;
      }
      const response = await patchCounsellorSession(accessToken, sessionId, payload);
      const updated = response?.session ?? null;
      if (updated) setSession(updated);
      else await loadSession();
      setSuccess(response?.message || "Session updated.");
      onUpdated?.();
    } catch (rescheduleError) {
      setError(rescheduleError?.response?.data?.message || "Failed to update session.");
    } finally {
      setSubmitting(false);
    }
  };

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

  const handleStatus = async (nextStatus) => {
    const labels = {
      completed: "Mark session as completed?",
      cancelled: "Cancel this session?",
      no_show: "Mark as no show?",
    };
    const isConfirmed = await confirm({
      title: "Update session",
      message: labels[nextStatus] || "Update status?",
      confirmLabel: "Update",
    });
    if (!isConfirmed) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const payload = { status: nextStatus };
      const trimmed = note.trim();
      if (trimmed) payload.note = trimmed;
      const response = await patchCounsellorSessionStatus(accessToken, sessionId, payload);
      const updated = response?.session ?? null;
      if (updated) setSession(updated);
      else await loadSession();
      setNote("");
      setSuccess(response?.message || `Status: ${formatLabel(nextStatus)}`);
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
  const isActive = isActiveSessionStatus(status);
  const canComplete = status === "scheduled";
  const canCancelOrNoShow = status === "pending_payment" || status === "scheduled";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-white/15 bg-[#0f2e1a]/98 p-5 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Session detail</h2>
            <p className="mt-1 text-sm text-white/80">
              {session ? `${formatLabel(session.sessionType)}` : "Loading…"}
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
            <div className="flex flex-wrap gap-2">
              <span
                className={[
                  "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                  getSessionStatusTone(status),
                ].join(" ")}
              >
                {formatLabel(status)}
              </span>
              {session.paymentStatus ? (
                <span className="rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/70">
                  Payment · {formatLabel(session.paymentStatus)}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 rounded-xl border border-white/15 bg-white/8 p-4 text-sm sm:grid-cols-2">
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
              {session.amountRupees != null ? (
                <div>
                  <p className="text-xs uppercase text-white/70">Session fee</p>
                  <p className="mt-1 text-white">{formatRupees(session.amountRupees)}</p>
                </div>
              ) : null}
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

            {session.counsellorRemarks ? (
              <div className="mt-4 rounded-xl border border-white/15 bg-white/8 p-4 text-sm text-white/85">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  Remarks for member
                </p>
                <p className="mt-2 whitespace-pre-wrap">{session.counsellorRemarks}</p>
                <p className="mt-2 text-xs text-white/50">
                  Visible to the member after session payment.
                </p>
              </div>
            ) : null}

            {isActive ? (
              <form onSubmit={handleReschedule} className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4">
                <h3 className="text-base font-semibold text-white">Reschedule slot</h3>
                <p className="mt-1 text-xs text-white/70">
                  Update time, remarks, or fee while awaiting payment.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <select
                    name="sessionType"
                    value={rescheduleForm.sessionType}
                    onChange={handleRescheduleChange}
                    className="rounded-lg border border-white/25 bg-[#133726] px-3 py-2.5 text-sm text-white"
                  >
                    {SESSION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="durationMinutes"
                    min={15}
                    max={480}
                    value={rescheduleForm.durationMinutes}
                    onChange={handleRescheduleChange}
                    className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white"
                  />
                  <input
                    type="date"
                    name="date"
                    value={rescheduleForm.date}
                    onChange={handleRescheduleChange}
                    required
                    className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white"
                  />
                  <input
                    type="time"
                    name="time"
                    value={rescheduleForm.time}
                    onChange={handleRescheduleChange}
                    required
                    className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white"
                  />
                  {status === "pending_payment" ? (
                    <input
                      type="number"
                      name="amountRupees"
                      min={1}
                      step={100}
                      value={rescheduleForm.amountRupees}
                      onChange={handleRescheduleChange}
                      placeholder="Session fee (INR)"
                      className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white sm:col-span-2"
                    />
                  ) : null}
                </div>
                <textarea
                  name="counsellorRemarks"
                  value={rescheduleForm.counsellorRemarks}
                  onChange={handleRescheduleChange}
                  rows={3}
                  placeholder="Remarks for the member (visible after they pay)"
                  className="mt-3 w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#5eead4]"
                />
                <label className="mt-3 flex items-center gap-2 text-sm text-white/90">
                  <input
                    type="checkbox"
                    name="notifyUser"
                    checked={rescheduleForm.notifyUser}
                    onChange={handleRescheduleChange}
                  />
                  Notify user about changes
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 rounded-xl border border-[#5eead4]/50 bg-[#5eead4]/15 px-4 py-2 text-sm font-semibold text-[#a7f3d0] disabled:opacity-50"
                >
                  {submitting ? "Saving…" : "Save changes"}
                </button>
              </form>
            ) : null}

            <form onSubmit={handleAddNote} className="mt-6 space-y-3">
              <h3 className="text-base font-semibold text-white">Internal notes</h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Add internal follow-up notes…"
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
                {canComplete ? (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleStatus("completed")}
                    className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Completed
                  </button>
                ) : null}
                {canCancelOrNoShow
                  ? SESSION_STATUS_OPTIONS.filter((opt) =>
                      canComplete ? opt.value !== "completed" : true,
                    ).map((opt) => (
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
