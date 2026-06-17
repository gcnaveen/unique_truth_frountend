import { useEffect, useState } from "react";
import { getEnquiryById } from "../../../../api/enquire";
import UserAvatar from "../../../../components/profile/UserAvatar";
import { pickUserProfilePhotoUrl } from "../../../../utils/profilePhoto";

const text = (value) => {
  const v = String(value ?? "").trim();
  return v || "—";
};

const formatService = (value) =>
  text(value).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const unwrapEnquiry = (response, fallback = null) => {
  const payload = response?.data ?? response;
  if (payload?.enquiry) return payload.enquiry;
  if (payload?._id || payload?.id) return payload;
  return fallback;
};

const pickFranchiseLabel = (enquiry) =>
  enquiry?.franchise?.name ||
  enquiry?.franchiseName ||
  enquiry?.nearestFranchiseName ||
  enquiry?.preferredBranchName ||
  enquiry?.nearestFranchise?.name ||
  "";

const pickAssignee = (enquiry, role) => {
  if (role === "sales") {
    return (
      enquiry?.assignedSales ||
      enquiry?.assignedTo ||
      enquiry?.sales ||
      null
    );
  }
  return enquiry?.assignedCounsellor || enquiry?.counsellor || null;
};

const pickAssigneeLabel = (person) => {
  if (!person || typeof person !== "object") return "";
  return person?.name || person?.email || "";
};

function DetailRow({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-1 break-words font-medium text-white">{value}</p>
    </div>
  );
}

function TrackPersonCard({ title, person, accentClass }) {
  const label = pickAssigneeLabel(person);
  const email = person?.email || "";
  const phone = person?.phoneNumber || person?.phone || "";

  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.05] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{title}</p>
      {label ? (
        <div className="mt-3 flex items-center gap-3">
          <UserAvatar
            name={label}
            photoUrl={pickUserProfilePhotoUrl(person)}
            size={44}
          />
          <div className="min-w-0">
            <p className="font-semibold text-white">{label}</p>
            {email ? (
              <p className="mt-0.5 break-all text-sm text-white/75">{email}</p>
            ) : null}
            {phone ? <p className="text-sm text-white/60">{phone}</p> : null}
          </div>
        </div>
      ) : (
        <p className={`mt-3 text-sm font-medium ${accentClass}`}>Not assigned yet</p>
      )}
    </div>
  );
}

export default function EnquiryDetailsDrawer({
  enquiryId,
  initialEnquiry = null,
  accessToken,
  open,
  onClose,
}) {
  const [enquiry, setEnquiry] = useState(initialEnquiry);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setEnquiry(initialEnquiry);
  }, [open, initialEnquiry]);

  useEffect(() => {
    if (!open || !enquiryId || !accessToken) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getEnquiryById(accessToken, enquiryId);
        setEnquiry(unwrapEnquiry(response, initialEnquiry));
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load enquiry details.");
        if (initialEnquiry) setEnquiry(initialEnquiry);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, enquiryId, accessToken]);

  if (!open) return null;

  const franchiseLabel = pickFranchiseLabel(enquiry);
  const salesPerson = pickAssignee(enquiry, "sales");
  const counsellor = pickAssignee(enquiry, "counsellor");

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-white/15 bg-[#0f2e1a]/98 p-5 backdrop-blur-xl transition-transform duration-300 ease-out md:p-6 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-white">User track</h2>
            <p className="mt-1 text-sm text-white/75">
              {loading && !enquiry
                ? "Loading…"
                : `${text(enquiry?.name)} · ${formatService(enquiry?.service)}`}
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
          <div className="mb-4 rounded-xl border border-amber-300/40 bg-amber-500/15 px-3 py-2 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        {loading && !enquiry ? (
          <p className="text-sm text-white/80">Loading user track…</p>
        ) : enquiry ? (
          <div className="space-y-5">
            <section className="rounded-2xl border border-white/15 bg-white/8 p-4 md:p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5eead4]">
                Contact information
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <DetailRow label="Full name" value={text(enquiry?.name)} />
                <DetailRow label="Phone" value={text(enquiry?.phoneNumber)} />
                <DetailRow label="Email" value={text(enquiry?.email)} />
                <DetailRow label="Gender" value={text(enquiry?.gender)} />
                <DetailRow
                  label="Age"
                  value={
                    Number.isFinite(Number(enquiry?.age)) ? String(Number(enquiry.age)) : "—"
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/15 bg-white/8 p-4 md:p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#c9a86c]">
                Assigned franchise
              </h3>
              {franchiseLabel ? (
                <p className="mt-4 text-lg font-semibold text-white">{franchiseLabel}</p>
              ) : (
                <p className="mt-4 text-sm font-medium text-white/55">Not assigned yet</p>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Team assignment
              </h3>
              <TrackPersonCard
                title="Sales person"
                person={salesPerson}
                accentClass="text-white/55"
              />
              <TrackPersonCard
                title="Counsellor"
                person={counsellor}
                accentClass="text-white/55"
              />
            </section>
          </div>
        ) : (
          <p className="text-sm text-white/70">Enquiry not found.</p>
        )}
      </aside>
    </div>
  );
}
