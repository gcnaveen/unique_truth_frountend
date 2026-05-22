import { useEffect, useState } from "react";
import {
  createCounsellorSession,
  getCounsellorAssignedUserDetail,
} from "../../../../api/counsellor";
import {
  SESSION_TYPES,
  formatDateTime,
  formatLabel,
  getId,
} from "../../../utils/format";
import AssignedUserMediaPanel from "./AssignedUserMediaPanel";

const initialBookForm = {
  sessionType: "initial_consultation",
  date: "",
  time: "",
  durationMinutes: "60",
  notifyUser: true,
};

export default function AssignedUserDrawer({
  enquiryId,
  accessToken,
  open,
  onClose,
  onUpdated,
}) {
  const [detail, setDetail] = useState(null);
  const [bookForm, setBookForm] = useState(initialBookForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDetail = async () => {
    const response = await getCounsellorAssignedUserDetail(accessToken, enquiryId);
    const data = response?.data ?? response;
    setDetail(data);
    return data;
  };

  useEffect(() => {
    if (!open || !enquiryId || !accessToken) {
      setDetail(null);
      setBookForm(initialBookForm);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        await loadDetail();
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load user.");
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, enquiryId, accessToken]);

  const enquiry = detail?.enquiry ?? detail;
  const sessions = detail?.sessions ?? [];
  const resolvedEnquiryId = enquiry?._id || enquiry?.id || enquiryId;

  const handleBookChange = (event) => {
    const { name, value, type, checked } = event.target;
    setBookForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBookSession = async (event) => {
    event.preventDefault();
    if (!bookForm.date || !bookForm.time) {
      setError("Date and time are required to book a session.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const payload = {
        enquiryId: resolvedEnquiryId,
        sessionType: bookForm.sessionType,
        date: bookForm.date,
        time: bookForm.time,
        notifyUser: Boolean(bookForm.notifyUser),
      };
      const duration = Number(bookForm.durationMinutes);
      if (Number.isFinite(duration) && duration >= 15) {
        payload.durationMinutes = duration;
      }
      const response = await createCounsellorSession(accessToken, payload);
      setSuccess(response?.message || "Session booked. User will be notified.");
      setBookForm(initialBookForm);
      await loadDetail();
      onUpdated?.();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Failed to book session.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-white/15 bg-[#0f2e1a]/98 p-5 backdrop-blur-xl md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Assigned user</h2>
            <p className="mt-1 text-sm text-white/80">{enquiry?.name || "Loading…"}</p>
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
        ) : enquiry ? (
          <>
            <div className="grid gap-3 rounded-xl border border-white/15 bg-white/8 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-white/70">Email</p>
                <p className="mt-1 text-white">{enquiry.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-white/70">Phone</p>
                <p className="mt-1 text-white">{enquiry.phoneNumber || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-white/70">Service</p>
                <p className="mt-1 text-white">{formatLabel(enquiry.service)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-white/70">Converted</p>
                <p className="mt-1 text-white">{formatDateTime(enquiry.updatedAt)}</p>
              </div>
            </div>

            <form
              onSubmit={handleBookSession}
              className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4"
            >
              <h3 className="text-base font-semibold text-white">Book session</h3>
              <p className="mt-1 text-xs text-white/70">Set date, time, and session type.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <select
                  name="sessionType"
                  value={bookForm.sessionType}
                  onChange={handleBookChange}
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
                  value={bookForm.durationMinutes}
                  onChange={handleBookChange}
                  className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white"
                />
                <input
                  type="date"
                  name="date"
                  value={bookForm.date}
                  onChange={handleBookChange}
                  required
                  className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white"
                />
                <input
                  type="time"
                  name="time"
                  value={bookForm.time}
                  onChange={handleBookChange}
                  required
                  className="rounded-lg border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white"
                />
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-white/90">
                <input
                  type="checkbox"
                  name="notifyUser"
                  checked={bookForm.notifyUser}
                  onChange={handleBookChange}
                />
                Notify user when slot is confirmed
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-2 text-sm font-semibold text-[#0f2e1a] disabled:opacity-60"
              >
                {submitting ? "Booking…" : "Confirm booking"}
              </button>
            </form>

            <div className="mt-6">
              <h3 className="text-base font-semibold text-white">Session history</h3>
              {sessions.length === 0 ? (
                <p className="mt-2 text-sm text-white/70">No sessions yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {sessions.map((session) => (
                    <li
                      key={getId(session)}
                      className="rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm"
                    >
                      <span className="font-medium text-white">
                        {formatLabel(session.sessionType)}
                      </span>
                      <span className="text-white/60"> · </span>
                      {formatDateTime(session.scheduledAt)}
                      <span className="ml-2 text-xs text-[#a7f3d0]">
                        {formatLabel(session.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {resolvedEnquiryId ? (
              <AssignedUserMediaPanel
                enquiryId={resolvedEnquiryId}
                accessToken={accessToken}
              />
            ) : null}
          </>
        ) : (
          <p className="text-sm text-white/70">User not found.</p>
        )}
      </aside>
    </div>
  );
}
