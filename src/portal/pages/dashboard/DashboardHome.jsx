import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { getPortalDashboard } from "../../../api/portal";
import { unwrapPortalPayload } from "../../utils/access";
import PortalDashboardHero from "../../components/PortalDashboardHero";
import PortalAmbient from "../../components/PortalAmbient";
import {
  formatDateTime,
  formatLabel,
  getCounselingLevelLabel,
} from "../../utils/format";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const cardClass =
  "group relative overflow-hidden rounded-2xl border border-white/15 bg-white/8 p-5 backdrop-blur-sm transition hover:border-[#5eead4]/35 hover:shadow-[0_8px_32px_rgba(94,234,212,0.12)]";

const TILE_ICONS = {
  journey: "✦",
  sessions: "◷",
  privacy: "◇",
};

function StatCard({ label, value, loading, accent, index }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={cardClass}
    >
      <motion.div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-linear-to-br ${accent} opacity-20 blur-2xl`}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 4 + index * 0.5, repeat: Infinity }}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-white/55">{label}</p>
      <motion.p
        className="mt-2 text-3xl font-semibold text-white"
        key={String(value)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: loading ? 0.5 : 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {loading ? "…" : value}
      </motion.p>
    </motion.div>
  );
}

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
  const firstName = profile?.name?.split(" ")[0] || "";
  const levelLabel = profile?.counselingLevel;

  const heroStats = useMemo(
    () => [
      { value: loading ? "…" : (stats?.enquiries?.total ?? enquiries.length), label: "Enquiries" },
      { value: loading ? "…" : (stats?.sessions?.upcoming ?? upcoming.length), label: "Upcoming" },
      {
        value: loading ? "…" : (stats?.sessions?.completed ?? "—"),
        label: "Completed",
      },
    ],
    [loading, stats, enquiries.length, upcoming.length],
  );

  const nextSession = useMemo(() => {
    const list = [...(upcoming || [])].filter((s) => s?.scheduledAt);
    list.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    return list[0] || null;
  }, [upcoming]);

  const nextSessionDays = useMemo(() => {
    if (!nextSession?.scheduledAt) return null;
    const diff = new Date(nextSession.scheduledAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [nextSession]);

  const quickTiles = [
    {
      key: "journey",
      to: "/portal/dashboard/enquiries",
      title: "My journey",
      desc: "Track enquiry progress and counsellor updates",
    },
    {
      key: "sessions",
      to: "/portal/dashboard/sessions",
      title: "Sessions",
      desc: "Open your schedule calendar and session details",
    },
    {
      key: "privacy",
      to: "/portal/dashboard/settings",
      title: "Privacy",
      desc: "Password, data export, and account settings",
    },
  ];

  return (
    <div>
      <PortalDashboardHero
        firstName={firstName}
        levelLabel={levelLabel ? `Plan · ${getCounselingLevelLabel(levelLabel)}` : ""}
        stats={heroStats}
      />

      <div className="relative">
        <PortalAmbient />
        <motion.div
          className="relative mx-auto max-w-6xl space-y-8 px-4 py-10 md:px-8"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {error ? (
            <motion.div
              variants={fadeUp}
              className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100"
            >
              {error}
            </motion.div>
          ) : null}

          {nextSession ? (
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl border border-[#5eead4]/30 p-5 md:p-6"
            >
              <motion.div
                className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#5eead4]/15 via-transparent to-[#c9a86c]/10"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <motion.div
                className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#5eead4]/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5eead4]">
                  Next session
                </p>
                <p className="mt-2 font-serif text-2xl font-semibold text-white">
                  {formatLabel(nextSession.sessionType)}
                </p>
                <p className="mt-1 text-sm text-white/70">
                  {formatDateTime(nextSession.scheduledAt)}
                </p>
                {nextSessionDays !== null ? (
                  <motion.p
                    className="mt-3 inline-flex rounded-full border border-[#5eead4]/40 bg-[#5eead4]/15 px-3 py-1 text-sm font-medium text-[#a7f3d0]"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {nextSessionDays === 0
                      ? "Today"
                      : `In ${nextSessionDays} day${nextSessionDays === 1 ? "" : "s"}`}
                  </motion.p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={`/portal/dashboard/sessions/${nextSession._id || nextSession.id}`}
                    className="inline-flex rounded-full bg-linear-to-r from-[#c9a86c] to-[#5eead4] px-5 py-2 text-sm font-semibold text-[#0f2e1a] transition hover:opacity-90"
                  >
                    View details
                  </Link>
                  <Link
                    to="/portal/dashboard/sessions"
                    className="inline-flex rounded-full border border-white/25 px-5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    Full calendar
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-10 text-center"
            >
              <motion.p
                className="text-sm text-white/60"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                No upcoming sessions yet — your counsellor will schedule your first slot.
              </motion.p>
              <Link
                to="/portal/dashboard/sessions"
                className="mt-4 inline-flex text-sm font-semibold text-[#a7f3d0] hover:underline"
              >
                Go to sessions →
              </Link>
            </motion.div>
          )}

          <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Enquiries"
              value={stats?.enquiries?.total ?? enquiries.length}
              loading={loading}
              accent="from-[#c9a86c] to-[#d4a574]"
              index={0}
            />
            <StatCard
              label="Upcoming"
              value={stats?.sessions?.upcoming ?? upcoming.length}
              loading={loading}
              accent="from-[#5eead4] to-[#2dd4bf]"
              index={1}
            />
            <StatCard
              label="Completed"
              value={stats?.sessions?.completed ?? "—"}
              loading={loading}
              accent="from-[#94a3b8] to-[#64748b]"
              index={2}
            />
            <StatCard
              label="Recordings"
              value={stats?.audio?.total ?? "—"}
              loading={loading}
              accent="from-[#a78bfa] to-[#7c3aed]"
              index={3}
            />
          </motion.div>

          <motion.section variants={fadeUp} className={cardClass}>
            <h2 className="text-lg font-semibold text-white">Upcoming sessions</h2>
            {loading ? (
              <div className="mt-4 space-y-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-14 rounded-xl bg-white/5"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-white/60">No upcoming sessions scheduled yet.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {upcoming.slice(0, 5).map((session, index) => (
                  <motion.li
                    key={session._id || session.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * index, duration: 0.4 }}
                    whileHover={{ x: 4 }}
                  >
                    <Link
                      to={`/portal/dashboard/sessions/${session._id || session.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition hover:border-[#5eead4]/30 hover:bg-white/10"
                    >
                      <span className="font-medium text-white">
                        {formatLabel(session.sessionType)}
                      </span>
                      <span className="text-white/70">{formatDateTime(session.scheduledAt)}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
            <Link
              to="/portal/dashboard/sessions"
              className="mt-4 inline-flex text-sm font-semibold text-[#a7f3d0] hover:underline"
            >
              View all in calendar →
            </Link>
          </motion.section>

          <motion.div variants={fadeUp}>
            <h2 className="mb-4 text-lg font-semibold text-white">Quick access</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickTiles.map((tile, index) => (
                <motion.div
                  key={tile.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.45 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={tile.to}
                    className="relative block overflow-hidden rounded-2xl border border-white/12 bg-white/6 p-6 transition hover:border-[#c9a86c]/40"
                  >
                    <motion.span
                      className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a86c]/30 bg-[#c9a86c]/10 text-lg text-[#fde68a]"
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 6, repeat: Infinity, delay: index * 0.4 }}
                    >
                      {TILE_ICONS[tile.key]}
                    </motion.span>
                    <p className="font-semibold text-white">{tile.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{tile.desc}</p>
                    <span className="mt-5 inline-block text-xs font-bold uppercase tracking-wider text-[#5eead4]">
                      Open →
                    </span>
                    <motion.div
                      className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-[#5eead4]/10 blur-xl"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
