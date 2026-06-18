import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getPortalSessionById,
  getPortalSessionPaymentStatus,
  initiatePortalSessionPayment,
} from "../../../api/portal";
import { unwrapPortalPayload } from "../../utils/access";
import {
  pickCheckoutUrl,
  pickSessionPaymentFromStatus,
  stashPaymentReturn,
  withPortalPaymentRedirect,
} from "../../utils/payment";
import PortalLoader from "../../components/PortalLoader";
import { formatDateTime, formatLabel, formatRupees } from "../../utils/format";

export default function PortalSessionDetailPage() {
  const { sessionId } = useParams();
  const { access_token, counselingLevel } = useSelector((state) => state.user.value);
  const [session, setSession] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  const loadSession = useCallback(async () => {
    if (!access_token || !sessionId) return;
    const response = await getPortalSessionById(access_token, sessionId);
    const data = unwrapPortalPayload(response);
    const record = data?.session ?? data;
    setSession(record);
    setPaymentInfo(data?.payment ?? record?.payment ?? null);
    return record;
  }, [access_token, sessionId]);

  useEffect(() => {
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
  }, [loadSession]);

  const handlePay = async () => {
    if (!access_token || !sessionId) return;
    const level = counselingLevel || paymentInfo?.counselingLevel || "standard";
    try {
      setPaying(true);
      setError("");
      setPaymentMessage("");
      const returnTo = `/portal/dashboard/sessions/${sessionId}`;
      const response = await initiatePortalSessionPayment(
        access_token,
        sessionId,
        withPortalPaymentRedirect({ counselingLevel: level }, { type: "session", sessionId, returnTo }),
      );
      stashPaymentReturn({ type: "session", sessionId, returnTo });
      const checkoutUrl = pickCheckoutUrl(response);
      if (!checkoutUrl) throw new Error("Checkout URL not returned.");
      window.location.href = checkoutUrl;
    } catch (payError) {
      setError(payError?.response?.data?.message || payError?.message || "Could not start payment.");
    } finally {
      setPaying(false);
    }
  };

  const handleRefreshPayment = async () => {
    if (!access_token || !sessionId) return;
    try {
      setCheckingPayment(true);
      setError("");
      const response = await getPortalSessionPaymentStatus(access_token, sessionId);
      const payment = pickSessionPaymentFromStatus(response);
      setPaymentInfo(payment);
      if (payment?.canConfirmBooking || payment?.status === "completed") {
        setPaymentMessage("Payment confirmed. Your session is now scheduled.");
        await loadSession();
      } else {
        setPaymentMessage("Payment is still pending. Complete payment on PhonePe, then refresh.");
      }
    } catch (statusError) {
      setError(statusError?.response?.data?.message || "Could not verify payment.");
    } finally {
      setCheckingPayment(false);
    }
  };

  if (loading) {
    return <PortalLoader label="Loading session…" minHeight="min-h-[40vh]" />;
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <Link to="/portal/dashboard/sessions" className="text-sm text-[#a7f3d0] hover:underline">
          ← Sessions
        </Link>
        <p className="text-white/70">Session not found.</p>
      </div>
    );
  }

  const counsellor = session?.counsellor ?? session?.enquiry?.counsellor;
  const status = String(session?.status || "").toLowerCase();
  const paymentRequired = session?.paymentRequired === true || status === "pending_payment";
  const canViewRemarks = session?.canViewRemarks === true;
  const remarks =
    canViewRemarks && session?.counsellorRemarks
      ? session.counsellorRemarks
      : session?.remarksPreview || null;

  return (
    <div className="space-y-6">
      <Link
        to="/portal/dashboard/sessions"
        className="inline-flex text-sm font-semibold text-[#a7f3d0] hover:underline"
      >
        ← Sessions
      </Link>

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}
      {paymentMessage ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
          {paymentMessage}
        </div>
      ) : null}

      <header className="rounded-3xl border border-white/15 bg-white/8 p-6">
        <p className="text-xs uppercase tracking-wide text-[#c9a86c]">Session</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-white">
          {formatLabel(session.sessionType)}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex rounded-full border border-[#5eead4]/40 bg-[#5eead4]/15 px-3 py-1 text-xs font-semibold text-[#a7f3d0]">
            {formatLabel(session.status)}
          </span>
          {session.paymentStatus ? (
            <span className="inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
              Payment · {formatLabel(session.paymentStatus)}
            </span>
          ) : null}
        </div>
      </header>

      {paymentRequired ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-5">
          <div>
            <p className="font-semibold text-amber-100">Payment required to confirm</p>
            <p className="mt-1 text-sm text-white/75">
              Pay {formatRupees(session.amountRupees ?? paymentInfo?.amountRupees)} to confirm this
              counselling slot.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              className="rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-5 py-2.5 text-sm font-bold text-[#0f2e1a] disabled:opacity-50"
            >
              {paying ? "Redirecting…" : "Pay now"}
            </button>
            <button
              type="button"
              onClick={handleRefreshPayment}
              disabled={checkingPayment}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 disabled:opacity-50"
            >
              {checkingPayment ? "Checking…" : "I already paid"}
            </button>
          </div>
        </div>
      ) : null}

      <dl className="grid gap-4 rounded-2xl border border-white/15 bg-white/8 p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-white/55">Scheduled</dt>
          <dd className="mt-1 font-medium text-white">{formatDateTime(session.scheduledAt)}</dd>
        </div>
        <div>
          <dt className="text-white/55">Duration</dt>
          <dd className="mt-1 font-medium text-white">
            {session.durationMinutes ? `${session.durationMinutes} minutes` : "—"}
          </dd>
        </div>
        {session.amountRupees != null ? (
          <div>
            <dt className="text-white/55">Session fee</dt>
            <dd className="mt-1 font-medium text-white">{formatRupees(session.amountRupees)}</dd>
          </div>
        ) : null}
        {counsellor ? (
          <div className="sm:col-span-2">
            <dt className="text-white/55">Counsellor</dt>
            <dd className="mt-1 font-medium text-white">{counsellor.name || "—"}</dd>
          </div>
        ) : null}
      </dl>

      <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
        <h2 className="text-base font-semibold text-white">Counsellor remarks</h2>
        {canViewRemarks && session?.counsellorRemarks ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/85">
            {session.counsellorRemarks}
          </p>
        ) : remarks ? (
          <p className="mt-3 text-sm text-amber-100/90">{remarks}</p>
        ) : (
          <p className="mt-3 text-sm text-white/60">No remarks for this session yet.</p>
        )}
      </div>

      {(session.notes || []).length > 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
          <h2 className="text-base font-semibold text-white">Session updates</h2>
          <ul className="mt-4 space-y-3">
            {[...(session.notes || [])].reverse().map((note, idx) => (
              <li
                key={`${note?.at || idx}`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85"
              >
                {note.note || "—"}
                <p className="mt-1 text-xs text-white/50">{formatDateTime(note.at)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
