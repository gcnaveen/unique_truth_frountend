import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPortalDashboard } from "../../../api/portal";
import { unwrapPortalPayload } from "../../utils/access";
import { formatDateTime, formatLabel } from "../../utils/format";

const cardClass =
  "rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-sm transition hover:border-white/25";

export default function PortalDashboardHome() {
  const { access_token } = useSelector((state) => state.user.value);
  const { profile } = useOutletContext() ?? {};
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!access_token) return;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPortalDashboard(access_token);
        setDashboard(unwrapPortalPayload(response));
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [access_token]);

  const enquiries = dashboard?.enquiries ?? profile?.enquiries ?? [];
  const upcoming = dashboard?.sessions?.upcomingList ?? dashboard?.upcomingSessions ?? [];
  const stats = dashboard?.stats ?? dashboard ?? {};

  const linkClass =
    "inline-flex h-10 items-center justify-center rounded-xl bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-4 text-sm font-semibold text-[#0f2e1a] hover:opacity-90";

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-[#c9a86c]/20 bg-linear-to-br from-[#133726]/80 to-[#0f2e1a]/90 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9a86c]">
          Your space
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-white md:text-4xl">
          Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
          Track your enquiry journey, upcoming sessions, and counsellor recordings — all in one
          place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/portal/dashboard/enquiries" className={linkClass}>
            View my journey
          </Link>
          <Link
            to="/portal/dashboard/sessions"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
          >
            Sessions
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Enquiries", value: stats?.enquiries?.total ?? enquiries.length },
          { label: "Upcoming", value: stats?.sessions?.upcoming ?? upcoming.length },
          { label: "Completed", value: stats?.sessions?.completed ?? "—" },
          { label: "Recordings", value: stats?.audio?.total ?? "—" },
        ].map((stat) => (
          <div key={stat.label} className={cardClass}>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">
              {loading ? "…" : stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className={cardClass}>
        <h2 className="text-lg font-semibold text-white">Upcoming sessions</h2>
        {loading ? (
          <p className="mt-3 text-sm text-white/60">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-white/60">No upcoming sessions scheduled yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {upcoming.slice(0, 5).map((session) => (
              <li
                key={session._id || session.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="font-medium text-white">{formatLabel(session.sessionType)}</span>
                <span className="text-white/70">{formatDateTime(session.scheduledAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
