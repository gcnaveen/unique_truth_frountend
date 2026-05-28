import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getPortalFullPaymentStatus,
  getPortalMe,
  initiatePortalFullPayment,
} from "../../../api/portal";
import { updateUser } from "../../../reducers/user";
import {
  buildPortalPaymentContext,
  isFullPaymentCompleted,
  pickPortalAccessFromLogin,
  unwrapPortalPayload,
} from "../../utils/access";
import { formatRupees, getCounselingLevelLabel } from "../../utils/format";
import {
  getFullPaymentSummary,
  pickCheckoutUrl,
  pickFullPaymentFromStatus,
  stashPaymentReturn,
} from "../../utils/payment";
import { getPricingBreakdown } from "../../utils/pricing";

export default function FullPaymentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useOutletContext() ?? {};
  const { access_token, advancePayment, counselingLevel } = useSelector(
    (state) => state.user.value,
  );

  const enquiryId = searchParams.get("enquiryId") || "";
  const returnTo =
    searchParams.get("returnTo") ||
    (enquiryId ? `/portal/dashboard/enquiries/${enquiryId}` : "/portal/dashboard/enquiries");

  const [amountRupees, setAmountRupees] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullStatus, setFullStatus] = useState(null);
  const [me, setMe] = useState(null);

  const level = useMemo(
    () =>
      counselingLevel ||
      profile?.counselingLevel ||
      me?.counselingLevel ||
      fullStatus?.counselingLevel ||
      "standard",
    [counselingLevel, profile?.counselingLevel, me?.counselingLevel, fullStatus?.counselingLevel],
  );

  useEffect(() => {
    if (!access_token) return;
    if (!enquiryId) {
      setLoading(false);
      setError("Missing enquiry. Open unlock from your enquiry page.");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [meRes, statusRes] = await Promise.all([
          getPortalMe(access_token),
          getPortalFullPaymentStatus(access_token, enquiryId),
        ]);
        const meData = unwrapPortalPayload(meRes);
        const statusData = unwrapPortalPayload(statusRes);
        setMe(meData);
        setFullStatus(statusData);

        const access = pickPortalAccessFromLogin(meData);
        dispatch(
          updateUser({
            advancePayment: access.advancePayment,
            fullPayment: pickFullPaymentFromStatus(statusData),
            counselingLevel: access.counselingLevel || counselingLevel,
          }),
        );
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Could not load payment details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token, enquiryId, dispatch, counselingLevel]);

  const paymentContext = useMemo(
    () =>
      buildPortalPaymentContext(me, profile, fullStatus, { advancePayment, enquiryId }),
    [me, profile, fullStatus, advancePayment, enquiryId],
  );

  const summary = useMemo(() => getFullPaymentSummary(paymentContext), [paymentContext]);
  const alreadyPaid = isFullPaymentCompleted(paymentContext);
  const service = useMemo(
    () => me?.enquiry?.service || profile?.enquiry?.service || profile?.service || "",
    [me, profile],
  );
  const pricing = useMemo(
    () => getPricingBreakdown({ service, counselingLevel: level }),
    [service, level],
  );

  useEffect(() => {
    setAmountRupees(String(summary.remaining ?? pricing.remaining));
  }, [summary.remaining, pricing.remaining]);

  useEffect(() => {
    if (!loading && alreadyPaid) {
      navigate(returnTo, { replace: true });
    }
  }, [loading, alreadyPaid, navigate, returnTo]);

  const handlePay = async (event) => {
    event.preventDefault();
    if (!enquiryId) {
      setError("Enquiry is required to start full payment.");
      return;
    }
    const amount = Number(amountRupees);
    if (!Number.isFinite(amount) || amount !== (summary.remaining ?? pricing.remaining)) {
      setError(`Remaining amount is fixed at ${formatRupees(summary.remaining ?? pricing.remaining)}.`);
      return;
    }
    if (!level) {
      setError("Counseling level is required.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const response = await initiatePortalFullPayment(access_token, {
        amountRupees: amount,
        counselingLevel: level,
        enquiryId,
      });
      const checkoutUrl = pickCheckoutUrl(response);
      if (!checkoutUrl) throw new Error("Checkout URL not returned. Contact support.");

      stashPaymentReturn({ type: "full", returnTo, enquiryId });
      window.location.href = checkoutUrl;
    } catch (payError) {
      setError(
        payError?.response?.data?.message ||
          payError?.message ||
          "Could not start payment. Try again or contact support.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    if (!enquiryId) return;
    try {
      setChecking(true);
      setError("");
      const statusRes = await getPortalFullPaymentStatus(access_token, enquiryId);
      const statusData = unwrapPortalPayload(statusRes);
      setFullStatus(statusData);
      dispatch(
        updateUser({
          fullPayment: pickFullPaymentFromStatus(statusData),
        }),
      );
      if (isFullPaymentCompleted(statusData)) {
        navigate(returnTo, { replace: true });
      } else {
        setError("Full payment not confirmed yet. Complete PhonePe checkout, then try again.");
      }
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Could not verify payment.");
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-white/70">Loading payment details…</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        to={returnTo}
        className="inline-flex text-sm font-semibold text-[#a7f3d0] hover:underline"
      >
        ← Back
      </Link>

      <div className="overflow-hidden rounded-3xl border border-[#c9a86c]/25 bg-linear-to-br from-[#0f2e1a]/95 via-[#133726]/90 to-[#0a1f14]/95 p-6 shadow-2xl md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a86c]">
          Unlock downloads
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-white md:text-3xl">
          Complete your program payment
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/75">
          Pay the full program amount for this enquiry to download counsellor recordings and
          reports. Advance payment only unlocks your dashboard.
        </p>
        {level ? (
          <p className="mt-2 text-xs text-[#a7f3d0]">
            Plan · {getCounselingLevelLabel(level)}
          </p>
        ) : null}

        <dl className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
          {summary.total != null ? (
            <div className="flex justify-between gap-2">
              <dt className="text-white/55">Program total</dt>
              <dd className="font-medium text-white">{formatRupees(summary.total)}</dd>
            </div>
          ) : null}
          {summary.paid != null ? (
            <div className="flex justify-between gap-2">
              <dt className="text-white/55">Already paid</dt>
              <dd className="font-medium text-[#a7f3d0]">{formatRupees(summary.paid)}</dd>
            </div>
          ) : null}
          {summary.remaining != null ? (
            <div className="flex justify-between gap-2 border-t border-white/10 pt-3">
              <dt className="text-white/80">Balance due</dt>
              <dd className="text-lg font-semibold text-[#fde68a]">
                {formatRupees(summary.remaining)}
              </dd>
            </div>
          ) : (
            <p className="text-xs text-white/55">
              Enter the full program amount for this enquiry.
            </p>
          )}
        </dl>
        <p className="mt-3 text-xs text-white/60">
          Pricing rule: base total {service?.toLowerCase() === "complete package" ? "₹25,000" : "₹10,000"}.
          Each counselor level increases total by ₹2,500. Advance is always 20%.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <form onSubmit={handlePay} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Amount to pay (₹)
            </label>
            <input
              type="number"
              min={summary.minRupees}
              step={100}
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              required
              disabled={!enquiryId}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-lg font-semibold text-white outline-none focus:border-[#5eead4] disabled:opacity-50"
              placeholder={summary.remaining ? String(summary.remaining) : "Enter amount"}
              readOnly
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !enquiryId}
            className="w-full rounded-2xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] py-3.5 text-base font-bold text-[#0f2e1a] disabled:opacity-50"
          >
            {submitting ? "Redirecting to PhonePe…" : "Pay & unlock downloads"}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={checking || !enquiryId}
            className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 disabled:opacity-50"
          >
            {checking ? "Checking…" : "I already paid — refresh access"}
          </button>
        </form>
      </div>
    </div>
  );
}
