import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import PortalFingerprintPanel from "../../components/PortalFingerprintPanel";
import PortalLoader from "../../components/PortalLoader";
import {
  FINGERPRINT_SECTION_ID,
  isFingerprintFocus,
  loadPortalEnquiryList,
  resolvePrimaryEnquiryId,
} from "../../utils/fingerprint";
import { formatDateTime, formatLabel, getId } from "../../utils/format";

const cardClass =
  "block rounded-2xl border border-white/15 bg-white/8 p-5 transition hover:border-[#5eead4]/40 hover:bg-white/10";

const scrollToFingerprint = () => {
  requestAnimationFrame(() => {
    document.getElementById(FINGERPRINT_SECTION_ID)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
};

export default function PortalEnquiriesHome() {
  const { access_token } = useSelector((state) => state.user.value);
  const { profile, refreshFingerprintReminder } = useOutletContext() ?? {};
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fingerprintRefreshKey, setFingerprintRefreshKey] = useState(0);

  const primaryEnquiryId = resolvePrimaryEnquiryId(items, profile);
  const focusFingerprint = isFingerprintFocus(searchParams);

  const loadEnquiries = useCallback(async () => {
    if (!access_token) return;
    try {
      setLoading(true);
      setError("");
      const list = await loadPortalEnquiryList(access_token);
      setItems(list);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load enquiries.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [access_token]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  useEffect(() => {
    if (!focusFingerprint || loading) return;
    scrollToFingerprint();
  }, [focusFingerprint, loading, fingerprintRefreshKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-white">My journey</h1>
        <p className="mt-2 text-sm text-white/70">
          Upload your fingerprint and track enquiry progress through conversion and counseling.
        </p>
      </div>

      {primaryEnquiryId ? (
        <PortalFingerprintPanel
          key={`${primaryEnquiryId}-${fingerprintRefreshKey}`}
          enquiryId={primaryEnquiryId}
          accessToken={access_token}
          highlight={focusFingerprint}
          onUploaded={() => {
            setFingerprintRefreshKey((value) => value + 1);
            refreshFingerprintReminder?.();
          }}
        />
      ) : !loading ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          No enquiry found yet. Fingerprint upload will appear once your enquiry is linked to your
          account.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-white">Your enquiries</h2>
        {loading ? (
          <PortalLoader label="Loading your journey…" minHeight="min-h-[24vh]" compact />
        ) : items.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/60">
            No enquiries found on your account yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {items.map((row) => {
              const enquiry = row?.enquiry ?? row;
              const id = getId(enquiry) || getId(row);
              const isPrimary = id && id === primaryEnquiryId;
              return (
                <li key={id}>
                  <Link to={`/portal/dashboard/enquiries/${id}`} className={cardClass}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-lg font-semibold text-white">
                        {enquiry?.service ? formatLabel(enquiry.service) : "Enquiry"}
                      </p>
                      <span className="shrink-0 rounded-full border border-[#5eead4]/40 bg-[#5eead4]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#a7f3d0]">
                        {formatLabel(enquiry?.status || row?.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      {formatDateTime(enquiry?.convertedAt || enquiry?.updatedAt || enquiry?.createdAt)}
                    </p>
                    {isPrimary ? (
                      <p className="mt-2 text-xs font-semibold text-[#fde68a]">
                        Primary journey · upload fingerprint above
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs font-semibold text-[#c9a86c]">View details →</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
