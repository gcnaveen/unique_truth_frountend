import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { getPortalSessions } from "../../../api/portal";
import { normalizePagedItems } from "../../utils/format";
import PortalAmbient from "../../components/PortalAmbient";
import SessionsCalendar from "./components/SessionsCalendar";

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
        const response = await getPortalSessions(access_token, { limit: 100, skip: 0 });
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
    <div className="relative space-y-6">
      <PortalAmbient />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5eead4]">
          Your calendar
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-white md:text-4xl">
          Sessions
        </h1>
        <p className="mt-2 max-w-lg text-sm text-white/70">
          Scheduled days are highlighted on the calendar. Select any date to see your booked
          sessions.
        </p>
      </motion.div>

      {error ? (
        <div className="relative rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading && sessions.length === 0 ? (
        <div className="relative flex min-h-[320px] items-center justify-center rounded-3xl border border-white/10 bg-white/5">
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm text-white/60"
          >
            Loading your schedule…
          </motion.p>
        </div>
      ) : sessions.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/60"
        >
          No sessions booked yet. Your counsellor will schedule your first slot — it will appear on
          the calendar automatically.
        </motion.p>
      ) : (
        <SessionsCalendar sessions={sessions} loading={loading} />
      )}
    </div>
  );
}
