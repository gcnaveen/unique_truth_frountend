import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPortalSessions } from "../../../api/portal";
import {
  formatDateTime,
  formatLabel,
  getId,
  normalizePagedItems,
} from "../../utils/format";

const rowClass =
  "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/8 px-4 py-4 transition hover:border-[#5eead4]/35";

export default function PortalSessionsHome() {
  const { access_token } = useSelector((state) => state.user.value);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!access_token) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPortalSessions(access_token, { limit: 50, skip: 0 });
        const { items } = normalizePagedItems(response);
        setSessions(items);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load sessions.");
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-white">Sessions</h1>
        <p className="mt-2 text-sm text-white/70">Booked slots and your session history.</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : sessions.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/60">
          No sessions booked yet. Your counsellor will schedule your first slot.
        </p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => {
            const id = getId(session);
            return (
              <li key={id}>
                <Link to={`/portal/dashboard/sessions/${id}`} className={rowClass}>
                  <div>
                    <p className="font-semibold text-white">{formatLabel(session.sessionType)}</p>
                    <p className="text-sm text-white/65">{formatDateTime(session.scheduledAt)}</p>
                  </div>
                  <span className="rounded-full border border-[#5eead4]/40 bg-[#5eead4]/15 px-3 py-1 text-xs font-semibold text-[#a7f3d0]">
                    {formatLabel(session.status)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
