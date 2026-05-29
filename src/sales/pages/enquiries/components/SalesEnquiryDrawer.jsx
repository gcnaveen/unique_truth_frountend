import { useEffect, useState } from "react";
import {
  addSalesEnquiryFollowUp,
  getSalesEnquiryById,
  updateSalesEnquiryStatus,
} from "../../../../api/sales";
import { useAppAlert } from "../../../../context/AppAlertContext";

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const formatService = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

const formatStatus = (value) =>
  String(value || "new")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const text = (value) => {
  const v = String(value ?? "").trim();
  return v || "—";
};

export default function SalesEnquiryDrawer({
  enquiryId,
  accessToken,
  open,
  onClose,
  onUpdated,
}) {
  const { confirm } = useAppAlert();
  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open || !enquiryId || !accessToken) {
      setEnquiry(null);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getSalesEnquiryById(accessToken, enquiryId);
        const data = response?.enquiry ?? response?.data ?? response;
        setEnquiry(data);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load enquiry.");
        setEnquiry(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, enquiryId, accessToken]);

  const refreshEnquiry = async () => {
    const response = await getSalesEnquiryById(accessToken, enquiryId);
    const data = response?.enquiry ?? response?.data ?? response;
    setEnquiry(data);
    return data;
  };

  const handleAddFollowUp = async (event) => {
    event.preventDefault();
    const trimmed = note.trim();
    if (!trimmed) {
      setError("Enter a follow-up note.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await addSalesEnquiryFollowUp(accessToken, enquiryId, { note: trimmed });
      setNote("");
      setSuccess("Follow-up added.");
      await refreshEnquiry();
      onUpdated?.();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Failed to add follow-up.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (status) => {
    const trimmedNote = note.trim();
    const confirmMessages = {
      in_progress: "Mark this enquiry as in progress?",
      converted:
        "Mark as converted? The user will be auto-assigned to a counsellor in your franchise.",
      closed: "Mark this enquiry as closed?",
    };
    const isConfirmed = await confirm({
      title: "Update enquiry",
      message: confirmMessages[status] || "Update status?",
      confirmLabel: "Update",
      variant: status === "closed" ? "danger" : "default",
    });
    if (!isConfirmed) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const payload = { status };
      if (trimmedNote) payload.note = trimmedNote;
      const response = await updateSalesEnquiryStatus(accessToken, enquiryId, payload);
      const updated = response?.enquiry ?? response?.data?.enquiry ?? null;
      if (updated) setEnquiry(updated);
      else await refreshEnquiry();
      setNote("");
      setSuccess(
        status === "converted"
          ? "Enquiry converted. Counsellor assignment is handled by the system."
          : `Status updated to ${formatStatus(status)}.`,
      );
      onUpdated?.();
      if (status === "closed" || status === "converted") {
        setTimeout(() => onClose?.(), 600);
      }
    } catch (statusError) {
      setError(statusError?.response?.data?.message || "Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const status = String(enquiry?.status || "new").toLowerCase();
  const canProgress = status === "new" || status === "in_progress";
  const canConvert = status === "new" || status === "in_progress";
  const canClose = status === "new" || status === "in_progress";

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-full overflow-y-auto border-l border-white/15 bg-[#0f2e1a]/98 p-5 backdrop-blur-xl transition-transform duration-300 ease-out sm:w-[85%] sm:max-w-2xl md:p-6 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-white">Enquiry details</h2>
            <p className="mt-1 text-sm text-white/80">
              {enquiry ? `${formatService(enquiry.service)} · ${formatStatus(status)}` : "Loading…"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
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
          <p className="text-sm text-white/80">Loading enquiry…</p>
        ) : enquiry ? (
          <>
            <div className="grid gap-3 rounded-2xl border border-white/15 bg-white/8 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-white/70">Name</p>
                <p className="mt-1 font-medium text-white">{text(enquiry.name)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-white/70">Contact</p>
                <p className="mt-1 text-white">{text(enquiry.phoneNumber)}</p>
                <p className="text-white/80">{text(enquiry.email)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-white/70">Service / query</p>
                <p className="mt-1 text-white">{formatService(enquiry.service)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-white/70">Date</p>
                <p className="mt-1 text-white">{formatDateTime(enquiry.createdAt)}</p>
              </div>
              {enquiry.preferredBranchName ? (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase text-white/70">Preferred branch</p>
                  <p className="mt-1 text-white">{text(enquiry.preferredBranchName)}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-5">
              <h3 className="text-base font-semibold text-white">Follow-up with user</h3>
              <form onSubmit={handleAddFollowUp} className="mt-3 space-y-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Add a follow-up note…"
                  className="w-full rounded-xl border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#5eead4]"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg border border-[#5eead4]/50 bg-[#5eead4]/15 px-3 py-2 text-xs font-semibold text-[#a7f3d0] hover:bg-[#5eead4]/25 disabled:opacity-50"
                  >
                    Add follow-up
                  </button>
                  {canProgress && status === "new" ? (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleStatus("in_progress")}
                      className="rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      Mark in progress
                    </button>
                  ) : null}
                  {canConvert ? (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleStatus("converted")}
                      className="rounded-lg border border-[#c9a86c]/50 bg-[#c9a86c]/20 px-3 py-2 text-xs font-semibold text-[#fde68a] hover:bg-[#c9a86c]/30 disabled:opacity-50"
                    >
                      Mark converted
                    </button>
                  ) : null}
                  {canClose ? (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleStatus("closed")}
                      className="rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/25 disabled:opacity-50"
                    >
                      Mark closed
                    </button>
                  ) : null}
                </div>
              </form>
              <p className="mt-2 text-xs text-white/60">
                Optional: include a note above when changing status — it is saved on the timeline.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-base font-semibold text-white">Timeline</h3>
              <div className="mt-3 space-y-2">
                {(enquiry.followUps || []).length === 0 ? (
                  <p className="text-sm text-white/70">No follow-ups yet.</p>
                ) : (
                  [...(enquiry.followUps || [])]
                    .reverse()
                    .map((item, idx) => (
                      <div
                        key={`${item?.at || idx}-${idx}`}
                        className="rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm"
                      >
                        <p className="text-white/90">{text(item?.note)}</p>
                        <p className="mt-1 text-xs text-white/55">{formatDateTime(item?.at)}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-white/70">Enquiry not found.</p>
        )}
      </aside>
    </div>
  );
}
