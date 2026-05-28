import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getPortalAudioDownload,
  getPortalEnquiryAudio,
  getPortalEnquiryById,
  getPortalEnquiryReports,
  getPortalFullPaymentStatus,
  getPortalReportDownload,
} from "../../../api/portal";
import { pickDownloadUrl } from "../../../counsellor/utils/upload";
import {
  buildPortalPaymentContext,
  getPortalMediaDownloadBlockMessage,
  getPortalMediaDownloadErrorMessage,
  isFullPaymentCompleted,
  isPortalMediaItemLocked,
  unwrapPortalPayload,
} from "../../utils/access";
import {
  getPortalMediaItemLabel,
  parsePortalMediaList,
} from "../../utils/media";
import { formatDateTime, formatLabel, getId } from "../../utils/format";

function buildUnlockPath(enquiryId) {
  const returnTo = `/portal/dashboard/enquiries/${enquiryId}`;
  return `/portal/dashboard/payment/full?enquiryId=${encodeURIComponent(enquiryId)}&returnTo=${encodeURIComponent(returnTo)}`;
}

function MediaSection({
  title,
  description,
  items,
  canDownload,
  paymentRequired,
  mediaError,
  emptyMessage,
  itemPrefix,
  onDownload,
  onUnlock,
  enquiryId,
}) {
  const showPaymentNotice = paymentRequired || !canDownload;
  const hasLockedItems = items.some((item) => item._portalLocked);

  return (
    <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-white/55">{description}</p>
        </div>
        {showPaymentNotice && hasLockedItems && enquiryId ? (
          <button
            type="button"
            onClick={onUnlock}
            className="shrink-0 rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 py-2 text-xs font-bold text-[#0f2e1a] shadow-md"
          >
            Unlock
          </button>
        ) : null}
      </div>

      {showPaymentNotice ? (
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
          {getPortalMediaDownloadBlockMessage()}
        </p>
      ) : null}
      {mediaError ? <p className="mt-3 text-xs text-red-200">{mediaError}</p> : null}
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-white/60">{emptyMessage}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item, index) => {
            const mediaId = getId(item);
            const locked = item._portalLocked;
            const downloadAllowed = canDownload && !locked && mediaId;
            return (
              <li
                key={mediaId || `${itemPrefix}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {getPortalMediaItemLabel(item, index, itemPrefix)}
                  </p>
                  <p className="text-xs text-white/55">
                    {formatDateTime(item?.createdAt || item?.uploadedAt)}
                  </p>
                  {locked ? (
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
                      Locked — pay balance to unlock
                    </p>
                  ) : null}
                </div>
                {downloadAllowed ? (
                  <button
                    type="button"
                    onClick={() => onDownload(mediaId)}
                    className="rounded-lg border border-[#5eead4]/50 bg-[#5eead4]/15 px-3 py-1.5 text-xs font-semibold text-[#a7f3d0]"
                  >
                    Download
                  </button>
                ) : locked && mediaId ? (
                  <button
                    type="button"
                    onClick={onUnlock}
                    className="rounded-lg border border-[#c9a86c]/50 bg-[#c9a86c]/20 px-3 py-1.5 text-xs font-semibold text-[#fde68a]"
                  >
                    Unlock
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function PortalEnquiryDetailPage() {
  const { enquiryId } = useParams();
  const navigate = useNavigate();
  const { profile } = useOutletContext() ?? {};
  const { access_token, advancePayment, fullPayment } = useSelector((state) => state.user.value);
  const [detail, setDetail] = useState(null);
  const [audio, setAudio] = useState({ items: [], canDownload: false, paymentRequired: true });
  const [reports, setReports] = useState({ items: [], canDownload: false, paymentRequired: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [reportError, setReportError] = useState("");

  const loadEnquiryMedia = useCallback(async () => {
    if (!access_token || !enquiryId) return;
    try {
      setLoading(true);
      setError("");
      const [detailRes, fullStatusRes, audioRes, reportsRes] = await Promise.all([
        getPortalEnquiryById(access_token, enquiryId),
        getPortalFullPaymentStatus(access_token, enquiryId).catch(() => null),
        getPortalEnquiryAudio(access_token, enquiryId).catch(() => ({ items: [] })),
        getPortalEnquiryReports(access_token, enquiryId).catch(() => ({ items: [] })),
      ]);
      const enquiryDetail = unwrapPortalPayload(detailRes);
      const fullStatus = unwrapPortalPayload(fullStatusRes);
      setDetail(enquiryDetail);
      const ctx = buildPortalPaymentContext(
        fullStatus,
        profile,
        { advancePayment, fullPayment },
        enquiryDetail,
        { enquiry: enquiryDetail?.enquiry ?? enquiryDetail, enquiryId },
      );
      const audioParsed = parsePortalMediaList(audioRes, ctx);
      const reportsParsed = parsePortalMediaList(reportsRes, ctx);
      const withLock = (items) =>
        items.map((item) => ({
          ...item,
          _portalLocked: isPortalMediaItemLocked(item, ctx),
        }));
      setAudio({ ...audioParsed, items: withLock(audioParsed.items) });
      setReports({ ...reportsParsed, items: withLock(reportsParsed.items) });
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load enquiry.");
    } finally {
      setLoading(false);
    }
  }, [access_token, enquiryId, profile, advancePayment, fullPayment]);

  useEffect(() => {
    loadEnquiryMedia();
  }, [loadEnquiryMedia]);

  const goToUnlockPayment = () => {
    navigate(buildUnlockPath(enquiryId));
  };

  const enquiry = detail?.enquiry ?? detail;
  const sales = detail?.assignedSales ?? detail?.sales;
  const counsellor = detail?.assignedCounsellor ?? detail?.counsellor;

  const handleAudioDownload = async (audioId) => {
    if (!audio.canDownload) {
      setAudioError(getPortalMediaDownloadBlockMessage());
      return;
    }
    try {
      setAudioError("");
      const response = await getPortalAudioDownload(access_token, enquiryId, audioId);
      const url = pickDownloadUrl(response);
      if (!url) throw new Error("Download link unavailable.");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (downloadError) {
      const msg = getPortalMediaDownloadErrorMessage(downloadError);
      setAudioError(msg);
      if (downloadError?.response?.status === 402) goToUnlockPayment();
    }
  };

  const handleReportDownload = async (reportId) => {
    if (!reports.canDownload) {
      setReportError(getPortalMediaDownloadBlockMessage());
      return;
    }
    try {
      setReportError("");
      const response = await getPortalReportDownload(access_token, enquiryId, reportId);
      const url = pickDownloadUrl(response);
      if (!url) throw new Error("Download link unavailable.");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (downloadError) {
      const msg = getPortalMediaDownloadErrorMessage(downloadError);
      setReportError(msg);
      if (downloadError?.response?.status === 402) goToUnlockPayment();
    }
  };

  if (loading) {
    return <p className="text-sm text-white/70">Loading enquiry…</p>;
  }

  if (!enquiry) {
    return (
      <div className="space-y-4">
        <Link to="/portal/dashboard/enquiries" className="text-sm text-[#a7f3d0] hover:underline">
          ← Back to journey
        </Link>
        <p className="text-white/70">Enquiry not found.</p>
      </div>
    );
  }

  const paymentCtx = buildPortalPaymentContext(profile, { advancePayment, fullPayment }, detail, {
    enquiry,
  });
  const showUnlockBanner =
    !isFullPaymentCompleted(paymentCtx) &&
    (audio.items.length > 0 || reports.items.length > 0);

  return (
    <div className="space-y-6">
      <Link
        to="/portal/dashboard/enquiries"
        className="inline-flex text-sm font-semibold text-[#a7f3d0] hover:underline"
      >
        ← Back to journey
      </Link>

      <header className="rounded-3xl border border-white/15 bg-white/8 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#c9a86c]">Enquiry</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-white">
          {formatLabel(enquiry.service)}
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Status: <span className="text-[#a7f3d0]">{formatLabel(enquiry.status)}</span>
        </p>
      </header>

      {showUnlockBanner ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#c9a86c]/35 bg-linear-to-r from-[#c9a86c]/15 to-[#5eead4]/10 p-5">
          <div>
            <p className="font-semibold text-white">Unlock recordings & reports</p>
            <p className="mt-1 text-sm text-white/70">
              Complete your program payment to download audio and documents from your counsellor.
            </p>
          </div>
          <button
            type="button"
            onClick={goToUnlockPayment}
            className="rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-5 py-2.5 text-sm font-bold text-[#0f2e1a]"
          >
            Unlock
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/55">Sales</h2>
          {sales ? (
            <div className="mt-3 text-sm text-white/90">
              <p className="font-medium text-white">{sales.name || "—"}</p>
              <p>{sales.email || sales.phoneNumber || "—"}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/60">Not assigned yet</p>
          )}
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/55">
            Counsellor
          </h2>
          {counsellor ? (
            <div className="mt-3 text-sm text-white/90">
              <p className="font-medium text-white">{counsellor.name || "—"}</p>
              <p>{counsellor.speciality ? formatLabel(counsellor.speciality) : counsellor.email}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/60">Assigned after conversion</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
        <h2 className="text-base font-semibold text-white">Timeline</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-white/55">Created</dt>
            <dd className="text-white">{formatDateTime(enquiry.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-white/55">Converted</dt>
            <dd className="text-white">{formatDateTime(enquiry.convertedAt)}</dd>
          </div>
        </dl>
      </div>

      <MediaSection
        title="Counsellor recordings"
        description="Audio shared for this enquiry"
        items={audio.items}
        canDownload={audio.canDownload}
        paymentRequired={audio.paymentRequired}
        mediaError={audioError}
        emptyMessage="No recordings available yet."
        itemPrefix="Recording"
        onDownload={handleAudioDownload}
        onUnlock={goToUnlockPayment}
        enquiryId={enquiryId}
      />

      <MediaSection
        title="Counsellor reports"
        description="Reports shared for this enquiry"
        items={reports.items}
        canDownload={reports.canDownload}
        paymentRequired={reports.paymentRequired}
        mediaError={reportError}
        emptyMessage="No reports available yet."
        itemPrefix="Report"
        onDownload={handleReportDownload}
        onUnlock={goToUnlockPayment}
        enquiryId={enquiryId}
      />
    </div>
  );
}
