import { useEffect, useMemo, useState } from "react";
import { getCounselingLevels } from "../../api/publicPortal";
import { getPortalMe, initiatePortalAdvancePayment } from "../../api/portal";
import { getAdvancePaymentStatus } from "../utils/access";
import {
  COUNSELING_LEVEL_META,
  formatRupees,
  getCounselingLevelLabel,
} from "../utils/format";

const DEFAULT_MIN = 500;
const DEFAULT_MAX = 50000;

const normalizeLevels = (response) => {
  const payload = response?.data ?? response ?? {};
  const raw = payload?.levels ?? payload?.items ?? payload;
  if (Array.isArray(raw)) {
    return raw.map((item) =>
      typeof item === "string"
        ? { id: item, label: getCounselingLevelLabel(item) }
        : {
            id: item?.id || item?.value || item?.level,
            label: item?.label || getCounselingLevelLabel(item?.id),
            description: item?.description || item?.tagline,
            suggestedAmountRupees: item?.suggestedAmountRupees ?? item?.amountRupees,
          },
    );
  }
  return Object.keys(COUNSELING_LEVEL_META).map((id) => ({
    id,
    label: COUNSELING_LEVEL_META[id].label,
    description: COUNSELING_LEVEL_META[id].tagline,
  }));
};

export default function PaymentGate({ accessToken, profile, onAccessGranted }) {
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [amountRupees, setAmountRupees] = useState("");
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const paymentStatus = getAdvancePaymentStatus(profile);
  const minRupees =
    profile?.advancePayment?.minRupees ??
    profile?.paymentBounds?.minRupees ??
    DEFAULT_MIN;
  const maxRupees =
    profile?.advancePayment?.maxRupees ??
    profile?.paymentBounds?.maxRupees ??
    DEFAULT_MAX;

  const enquiries = profile?.enquiries ?? profile?.enquirySummary ?? [];
  const defaultEnquiryId = enquiries[0]?._id || enquiries[0]?.id || profile?.enquiryId || "";

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingLevels(true);
        const response = await getCounselingLevels();
        const list = normalizeLevels(response);
        setLevels(list);
        if (list[0]?.id) setSelectedLevel(list[0].id);
        const suggested = list[0]?.suggestedAmountRupees;
        if (suggested) setAmountRupees(String(suggested));
      } catch {
        const fallback = normalizeLevels(null);
        setLevels(fallback);
        if (fallback[0]?.id) setSelectedLevel(fallback[0].id);
      } finally {
        setLoadingLevels(false);
      }
    };
    load();
  }, []);

  const selectedMeta = useMemo(
    () => levels.find((l) => l.id === selectedLevel),
    [levels, selectedLevel],
  );

  const handleLevelSelect = (level) => {
    setSelectedLevel(level.id);
    if (level.suggestedAmountRupees) {
      setAmountRupees(String(level.suggestedAmountRupees));
    }
  };

  const handleRefreshAccess = async () => {
    try {
      setChecking(true);
      setError("");
      const me = await getPortalMe(accessToken);
      if (getAdvancePaymentStatus(me) === "completed") {
        onAccessGranted?.(me);
      } else {
        setError("Payment not confirmed yet. Complete payment on PhonePe, then try again.");
      }
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Could not verify payment status.");
    } finally {
      setChecking(false);
    }
  };

  const handlePay = async (event) => {
    event.preventDefault();
    const amount = Number(amountRupees);
    if (!selectedLevel) {
      setError("Choose a counseling level.");
      return;
    }
    if (!Number.isFinite(amount) || amount < minRupees || amount > maxRupees) {
      setError(`Enter an amount between ${formatRupees(minRupees)} and ${formatRupees(maxRupees)}.`);
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const payload = {
        amountRupees: amount,
        counselingLevel: selectedLevel,
      };
      if (defaultEnquiryId) payload.enquiryId = defaultEnquiryId;
      const response = await initiatePortalAdvancePayment(accessToken, payload);
      const data = response?.data ?? response;
      const checkoutUrl =
        data?.checkoutPageUrl || data?.checkoutUrl || data?.redirectUrl || data?.url;
      if (!checkoutUrl) {
        throw new Error("Checkout URL not returned. Contact support.");
      }
      window.location.href = checkoutUrl;
    } catch (payError) {
      setError(payError?.response?.data?.message || payError?.message || "Payment could not start.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="overflow-hidden rounded-3xl border border-[#c9a86c]/25 bg-linear-to-br from-[#0f2e1a]/95 via-[#133726]/90 to-[#0a1f14]/95 p-6 shadow-2xl shadow-black/30 md:p-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a86c]">
            Welcome to your portal
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Complete your advance payment
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/75">
            Your enquiry has been converted. Pay the advance and choose your counseling level to
            unlock your dashboard, sessions, recordings, and personal data tools.
          </p>
          {paymentStatus === "pending" ? (
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-1.5 text-xs font-semibold text-amber-100">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
              Payment pending
            </span>
          ) : null}
        </div>

        <ol className="mb-8 grid gap-3 sm:grid-cols-3">
          {[
            { step: "1", title: "Choose level", desc: "Pick the program that fits you" },
            { step: "2", title: "Pay advance", desc: "Secure checkout via PhonePe" },
            { step: "3", title: "Access portal", desc: "Journey, sessions & audio" },
          ].map((item) => (
            <li
              key={item.step}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#c9a86c]/20 text-xs font-bold text-[#fde68a]">
                {item.step}
              </span>
              <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
              <p className="text-xs text-white/55">{item.desc}</p>
            </li>
          ))}
        </ol>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <form onSubmit={handlePay} className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-semibold text-white">Counseling level</p>
            {loadingLevels ? (
              <p className="text-sm text-white/60">Loading options…</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {levels.map((level) => {
                  const meta = COUNSELING_LEVEL_META[level.id] || {};
                  const active = selectedLevel === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleLevelSelect(level)}
                      className={[
                        "rounded-2xl border p-4 text-left transition-all",
                        active
                          ? "border-[#5eead4]/60 bg-[#5eead4]/10 ring-2 ring-[#5eead4]/30"
                          : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "inline-block rounded-lg bg-linear-to-r px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0f2e1a]",
                          meta.accent || "from-[#c9a86c] to-[#d4a574]",
                        ].join(" ")}
                      >
                        {level.label || getCounselingLevelLabel(level.id)}
                      </span>
                      <p className="mt-2 text-sm font-medium text-white">
                        {level.description || meta.tagline}
                      </p>
                      {level.suggestedAmountRupees ? (
                        <p className="mt-1 text-xs text-[#a7f3d0]">
                          Suggested {formatRupees(level.suggestedAmountRupees)}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Advance amount (₹)
            </label>
            <input
              type="number"
              min={minRupees}
              max={maxRupees}
              step={100}
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              required
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-lg font-semibold text-white outline-none focus:border-[#5eead4]"
              placeholder={`${minRupees} – ${maxRupees}`}
            />
            <p className="mt-2 text-xs text-white/55">
              {selectedMeta?.label ? `${selectedMeta.label} · ` : ""}
              Allowed range {formatRupees(minRupees)} – {formatRupees(maxRupees)}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || loadingLevels}
            className="w-full rounded-2xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] py-3.5 text-base font-bold text-[#0f2e1a] shadow-lg shadow-[#5eead4]/20 transition hover:opacity-95 disabled:opacity-50"
          >
            {submitting ? "Redirecting to PhonePe…" : "Continue to secure payment"}
          </button>

          <button
            type="button"
            onClick={handleRefreshAccess}
            disabled={checking}
            className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 disabled:opacity-50"
          >
            {checking ? "Checking…" : "I already paid — refresh access"}
          </button>
        </form>
      </div>
    </div>
  );
}
