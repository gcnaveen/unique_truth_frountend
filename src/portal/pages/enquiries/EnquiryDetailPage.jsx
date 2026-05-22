import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getPortalAudioDownload,
  getPortalEnquiryAudio,
  getPortalEnquiryById,
} from "../../../api/portal";
import { pickDownloadUrl, normalizeMediaList } from "../../../counsellor/utils/upload";
import { unwrapPortalPayload } from "../../utils/access";
import { formatDateTime, formatLabel, getId } from "../../utils/format";

export default function PortalEnquiryDetailPage() {
  const { enquiryId } = useParams();
  const { access_token } = useSelector((state) => state.user.value);
  const [detail, setDetail] = useState(null);
  const [audioItems, setAudioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    if (!access_token || !enquiryId) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [detailRes, audioRes] = await Promise.all([
          getPortalEnquiryById(access_token, enquiryId),
          getPortalEnquiryAudio(access_token, enquiryId).catch(() => ({ items: [] })),
        ]);
        setDetail(unwrapPortalPayload(detailRes));
        setAudioItems(normalizeMediaList(audioRes));
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load enquiry.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token, enquiryId]);

  const enquiry = detail?.enquiry ?? detail;
  const sales = detail?.assignedSales ?? detail?.sales;
  const counsellor = detail?.assignedCounsellor ?? detail?.counsellor;

  const handleDownload = async (audioId) => {
    try {
      setMediaError("");
      const response = await getPortalAudioDownload(access_token, enquiryId, audioId);
      const url = pickDownloadUrl(response);
      if (!url) throw new Error("Download link unavailable.");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (downloadError) {
      setMediaError(
        downloadError?.response?.data?.message ||
          downloadError?.message ||
          "Could not download recording.",
      );
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

      <div className="rounded-2xl border border-white/15 bg-white/8 p-5">
        <h2 className="text-base font-semibold text-white">Counsellor recordings</h2>
        <p className="mt-1 text-xs text-white/55">Audio shared for this enquiry</p>
        {mediaError ? (
          <p className="mt-3 text-xs text-red-200">{mediaError}</p>
        ) : null}
        {audioItems.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No recordings available yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {audioItems.map((item, index) => {
              const audioId = getId(item);
              return (
                <li
                  key={audioId || `a-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item?.label || item?.filename || `Recording ${index + 1}`}
                    </p>
                    <p className="text-xs text-white/55">
                      {formatDateTime(item?.createdAt || item?.uploadedAt)}
                    </p>
                  </div>
                  {audioId ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(audioId)}
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
    </div>
  );
}
