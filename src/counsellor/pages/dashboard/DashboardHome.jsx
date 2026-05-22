import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCounsellorDashboardSummary } from "../../../api/counsellor";
import { formatDateTime, formatLabel } from "../../utils/format";

const DashboardHome = () => {
  const { access_token } = useSelector((state) => state.user.value);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!access_token) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getCounsellorDashboardSummary(access_token);
        setSummary(response?.data ?? response);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token]);

  const assignedTotal = summary?.assignedUsers?.total ?? 0;
  const upcomingCount = summary?.sessions?.upcoming ?? 0;
  const todayCount = summary?.sessions?.today ?? 0;
  const upcomingList = summary?.sessions?.upcomingList ?? [];
  const fingerprintActive = summary?.fingerprint?.active ?? summary?.media?.fingerprintActive ?? 0;
  const audioCount = summary?.audio?.total ?? summary?.media?.audioCount ?? 0;

  const linkClass =
    "inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 text-sm font-semibold text-[#0f2e1a] hover:opacity-90";

  return (
    <section className="mx-auto w-full max-w-[min(100%,96rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Counsellor dashboard
        </h1>
        <p className="mt-1 text-sm text-white/90 md:text-base">
          Assigned users, sessions, fingerprint uploads, and audio recordings.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-300/50 bg-red-500/25 px-3 py-2 text-sm text-white">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-white/20 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            Assigned users
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">{loading ? "…" : assignedTotal}</p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Upcoming</p>
          <p className="mt-1 text-2xl font-semibold text-white">{loading ? "…" : upcomingCount}</p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Today</p>
          <p className="mt-1 text-2xl font-semibold text-white">{loading ? "…" : todayCount}</p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            Fingerprints
          </p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {loading ? "…" : fingerprintActive}
          </p>
          <p className="mt-1 text-xs text-white/55">Active (48h)</p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Audio</p>
          <p className="mt-1 text-2xl font-semibold text-white">{loading ? "…" : audioCount}</p>
          <p className="mt-1 text-xs text-white/55">Recordings</p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link to="/counsellor/dashboard/assigned-users" className={linkClass}>
          View assigned users
        </Link>
        <Link
          to="/counsellor/dashboard/sessions"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-white/30 bg-white/15 px-4 text-sm font-semibold text-white hover:bg-white/25"
        >
          All sessions
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white">Upcoming sessions</h2>
        {loading ? (
          <p className="mt-3 text-sm text-white/70">Loading…</p>
        ) : upcomingList.length === 0 ? (
          <p className="mt-3 text-sm text-white/70">No upcoming sessions scheduled.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcomingList.map((session) => (
              <li
                key={session._id || session.id}
                className="rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white/90"
              >
                <span className="font-medium text-white">{formatLabel(session.sessionType)}</span>
                <span className="text-white/60"> · </span>
                {formatDateTime(session.scheduledAt)}
                <span className="ml-2 text-xs text-[#a7f3d0]">{formatLabel(session.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default DashboardHome;
