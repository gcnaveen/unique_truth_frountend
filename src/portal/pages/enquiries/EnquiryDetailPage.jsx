import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getPortalAudioDownload,
  getPortalEnquiryAudio,
  getPortalEnquiryById,
  getPortalEnquiryReports,
  getPortalReportDownload,
} from "../../../api/portal";
import { pickDownloadUrl } from "../../../counsellor/utils/upload";
import {
  getPortalMediaDownloadBlockMessage,
  getPortalMediaDownloadErrorMessage,
  isPortalMediaItemLocked,
  unwrapPortalPayload,
} from "../../utils/access";
import {
  getPortalMediaItemLabel,
  parsePortalMediaList,
} from "../../utils/media";
import PortalFingerprintPanel from "../../components/PortalFingerprintPanel";
import {
  FINGERPRINT_SECTION_ID,
  isFingerprintFocus,
} from "../../utils/fingerprint";
import { formatDateTime, formatLabel, getId } from "../../utils/format";

const scrollToFingerprint = () => {
  requestAnimationFrame(() => {
    document.getElementById(FINGERPRINT_SECTION_ID)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
};

function MediaSection({
  title,
  description,
  items,
  canDownload,
  mediaError,
  emptyMessage,
  itemPrefix,
  onDownload,
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs text-white/55">{description}</p>
      </div>
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
                      Unavailable
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
  const [searchParams] = useSearchParams();
  const { refreshFingerprintReminder } = useOutletContext() ?? {};
  const { access_token } = useSelector((state) => state.user.value);
  const [detail, setDetail] = useState(null);
  const [audio, setAudio] = useState({ items: [], canDownload: true, paymentRequired: false });
  const [reports, setReports] = useState({ items: [], canDownload: true, paymentRequired: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [reportError, setReportError] = useState("");

  const loadEnquiryMedia = useCallback(async () => {
    if (!access_token || !enquiryId) return;
    try {
      setLoading(true);
      setError("");
      const [detailRes, audioRes, reportsRes] = await Promise.all([
        getPortalEnquiryById(access_token, enquiryId),
        getPortalEnquiryAudio(access_token, enquiryId).catch(() => ({ items: [] })),
        getPortalEnquiryReports(access_token, enquiryId).catch(() => ({ items: [] })),
      ]);
      const enquiryDetail = unwrapPortalPayload(detailRes);
      setDetail(enquiryDetail);
      const audioParsed = parsePortalMediaList(audioRes);
      const reportsParsed = parsePortalMediaList(reportsRes);
      const withLock = (items) =>
        items.map((item) => ({
          ...item,
          _portalLocked: isPortalMediaItemLocked(item),
        }));
      setAudio({ ...audioParsed, items: withLock(audioParsed.items) });
      setReports({ ...reportsParsed, items: withLock(reportsParsed.items) });
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load enquiry.");
    } finally {
      setLoading(false);
    }
  }, [access_token, enquiryId]);

  useEffect(() => {
    loadEnquiryMedia();
  }, [loadEnquiryMedia]);

  useEffect(() => {
    if (!isFingerprintFocus(searchParams) || loading) return;
    scrollToFingerprint();
  }, [searchParams, loading]);

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
      setAudioError(getPortalMediaDownloadErrorMessage(downloadError));
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
      setReportError(getPortalMediaDownloadErrorMessage(downloadError));
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

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <PortalFingerprintPanel
        enquiryId={enquiryId}
        accessToken={access_token}
        highlight={isFingerprintFocus(searchParams)}
        onUploaded={refreshFingerprintReminder}
      />

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
        mediaError={audioError}
        emptyMessage="No recordings available yet."
        itemPrefix="Recording"
        onDownload={handleAudioDownload}
      />

      <MediaSection
        title="Counsellor reports"
        description="Reports shared for this enquiry"
        items={reports.items}
        canDownload={reports.canDownload}
        mediaError={reportError}
        emptyMessage="No reports available yet."
        itemPrefix="Report"
        onDownload={handleReportDownload}
      />
    </div>
  );
}
