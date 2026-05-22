import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPortalEnquiries } from "../../../api/portal";
import { unwrapPortalPayload } from "../../utils/access";
import { formatDateTime, formatLabel, getId, normalizePagedItems } from "../../utils/format";

const cardClass =
  "block rounded-2xl border border-white/15 bg-white/8 p-5 transition hover:border-[#5eead4]/40 hover:bg-white/10";

export default function PortalEnquiriesHome() {
  const { access_token } = useSelector((state) => state.user.value);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!access_token) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPortalEnquiries(access_token, { limit: 50, skip: 0 });
        const { items: list } = normalizePagedItems(response);
        setItems(list.length ? list : normalizePagedItems(unwrapPortalPayload(response)).items);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load enquiries.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-white">My journey</h1>
        <p className="mt-2 text-sm text-white/70">
          Full enquiry history from first contact through conversion and counseling.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/60">
          No enquiries found on your account yet.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((row) => {
            const enquiry = row?.enquiry ?? row;
            const id = getId(enquiry) || getId(row);
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
                  <p className="mt-3 text-xs font-semibold text-[#c9a86c]">View details →</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
