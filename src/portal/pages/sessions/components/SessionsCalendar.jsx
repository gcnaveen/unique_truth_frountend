import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  buildMonthGrid,
  dateKeyFromParts,
  formatMonthLabel,
  groupSessionsByDate,
  parseDateKey,
  toDateKey,
} from "../../../utils/sessionCalendar";
import { formatDateTime, formatLabel, getId } from "../../../utils/format";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const rowClass =
  "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/8 px-4 py-4 transition hover:border-[#5eead4]/35 hover:bg-white/10";

export default function SessionsCalendar({ sessions, loading }) {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const byDate = useMemo(() => groupSessionsByDate(sessions), [sessions]);
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const shiftMonth = (delta) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const selectedSessions = selectedKey ? byDate.get(selectedKey) || [] : [];
  const selectedLabel = selectedKey
    ? parseDateKey(selectedKey)?.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const scheduledCount = sessions?.length ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/6 p-5 backdrop-blur-md md:p-6"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5eead4]">
              Schedule
            </p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-white md:text-2xl">
              {formatMonthLabel(viewYear, viewMonth)}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:border-[#5eead4]/50 hover:bg-[#5eead4]/15"
              aria-label="Previous month"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth());
                setSelectedKey(todayKey);
              }}
              className="rounded-xl border border-[#c9a86c]/40 bg-[#c9a86c]/15 px-3 py-1.5 text-xs font-semibold text-[#fde68a] transition hover:bg-[#c9a86c]/25"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:border-[#5eead4]/50 hover:bg-[#5eead4]/15"
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-white/45 md:text-xs">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-2">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {grid.map((day, idx) => {
            if (day === null) {
              return <div key={`pad-${idx}`} className="aspect-square" />;
            }

            const key = dateKeyFromParts(viewYear, viewMonth, day);
            const hasSession = byDate.has(key);
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;
            const count = byDate.get(key)?.length ?? 0;

            return (
              <motion.button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                className={[
                  "relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-semibold transition",
                  isSelected
                    ? "border-[#5eead4]/70 bg-[#5eead4]/25 text-white shadow-[0_0_20px_rgba(94,234,212,0.25)]"
                    : hasSession
                      ? "border-[#c9a86c]/45 bg-[#c9a86c]/12 text-[#fde68a] hover:border-[#5eead4]/40"
                      : "border-white/10 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10",
                  isToday && !isSelected ? "ring-1 ring-[#5eead4]/50" : "",
                ].join(" ")}
              >
                {day}
                {hasSession ? (
                  <span
                    className={[
                      "absolute bottom-1.5 flex gap-0.5",
                      count > 1 ? "" : "",
                    ].join(" ")}
                  >
                    {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-1 w-1 rounded-full ${
                          isSelected ? "bg-white" : "bg-[#5eead4]"
                        }`}
                      />
                    ))}
                  </span>
                ) : null}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/55">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#5eead4]" />
            Scheduled day
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded ring-1 ring-[#5eead4]/60" />
            Today
          </span>
          <span>{scheduledCount} session{scheduledCount === 1 ? "" : "s"} total</span>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl border border-white/15 bg-white/6 p-5 backdrop-blur-md md:p-6"
      >
        <h3 className="font-serif text-lg font-semibold text-white">
          {selectedLabel || "Pick a day"}
        </h3>
        <p className="mt-1 text-sm text-white/60">
          {selectedSessions.length > 0
            ? `${selectedSessions.length} session${selectedSessions.length === 1 ? "" : "s"} on this day`
            : "No sessions on this date"}
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-white/50">Loading schedule…</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.ul
              key={selectedKey}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              className="mt-5 space-y-3"
            >
              {selectedSessions.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-white/50">
                  Choose a highlighted date to see your booked slots.
                </li>
              ) : (
                selectedSessions.map((session) => {
                  const id = getId(session);
                  return (
                    <li key={id}>
                      <Link to={`/portal/dashboard/sessions/${id}`} className={rowClass}>
                        <div>
                          <p className="font-semibold text-white">
                            {formatLabel(session.sessionType)}
                          </p>
                          <p className="text-sm text-white/65">
                            {formatDateTime(session.scheduledAt)}
                          </p>
                        </div>
                        <span className="rounded-full border border-[#5eead4]/40 bg-[#5eead4]/15 px-3 py-1 text-xs font-semibold text-[#a7f3d0]">
                          {formatLabel(session.status)}
                        </span>
                      </Link>
                    </li>
                  );
                })
              )}
            </motion.ul>
          </AnimatePresence>
        )}

        {!loading && sessions.length > 0 ? (
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
              All upcoming & past
            </p>
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {sessions.map((session) => {
                const id = getId(session);
                const key = toDateKey(session.scheduledAt);
                return (
                  <li key={id}>
                    <Link
                      to={`/portal/dashboard/sessions/${id}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:border-[#5eead4]/30"
                    >
                      <span className="truncate font-medium text-white/90">
                        {formatLabel(session.sessionType)}
                      </span>
                      <span className="shrink-0 text-xs text-white/50">{key}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </motion.section>
    </div>
  );
}
