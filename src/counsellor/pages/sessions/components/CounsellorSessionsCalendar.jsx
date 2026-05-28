import { useMemo, useState } from "react";
import {
  buildMonthGrid,
  dateKeyFromParts,
  formatMonthLabel,
  groupSessionsByDate,
  parseDateKey,
  toDateKey,
} from "../../../../portal/utils/sessionCalendar";
import { getAssignedUserName, getId, getSessionTypeDisplay } from "../../../utils/format";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CounsellorSessionsCalendar({ sessions, loading, onOpenSession }) {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const byDate = useMemo(() => groupSessionsByDate(sessions), [sessions]);
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const selectedSessions = selectedKey ? byDate.get(selectedKey) || [] : [];
  const selectedLabel = selectedKey
    ? parseDateKey(selectedKey)?.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const shiftMonth = (delta) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-white/20 bg-white/8 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{formatMonthLabel(viewYear, viewMonth)}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg border border-white/25 bg-white/10 px-2 py-1 text-xs text-white"
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
              className="rounded-lg border border-[#c9a86c]/40 bg-[#c9a86c]/15 px-3 py-1 text-xs font-semibold text-[#fde68a]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="rounded-lg border border-white/25 bg-white/10 px-2 py-1 text-xs text-white"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-white/55">
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-1.5">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {grid.map((day, idx) => {
            if (day === null) return <div key={`pad-${idx}`} className="aspect-square" />;
            const key = dateKeyFromParts(viewYear, viewMonth, day);
            const hasSession = byDate.has(key);
            const isSelected = selectedKey === key;
            const isToday = todayKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={[
                  "relative aspect-square rounded-lg border text-sm font-semibold",
                  isSelected
                    ? "border-[#5eead4]/70 bg-[#5eead4]/25 text-white"
                    : hasSession
                      ? "border-[#c9a86c]/45 bg-[#c9a86c]/12 text-[#fde68a]"
                      : "border-white/10 bg-white/5 text-white/75",
                  isToday && !isSelected ? "ring-1 ring-[#5eead4]/50" : "",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-white/20 bg-white/8 p-4">
        <h3 className="text-base font-semibold text-white">{selectedLabel || "Pick a day"}</h3>
        {loading ? (
          <p className="mt-4 text-sm text-white/60">Loading schedule…</p>
        ) : selectedSessions.length === 0 ? (
          <p className="mt-4 text-sm text-white/60">No sessions on this date.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {selectedSessions.map((session) => {
              const id = getId(session);
              return (
                <li key={id} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5">
                  <p className="text-sm font-semibold text-white">{getSessionTypeDisplay(session)}</p>
                  <p className="text-xs text-white/60">{getAssignedUserName(session)}</p>
                  <button
                    type="button"
                    onClick={() => onOpenSession?.(session)}
                    className="mt-2 rounded-lg border border-[#5eead4]/50 bg-[#5eead4]/15 px-2.5 py-1 text-xs font-semibold text-[#a7f3d0]"
                  >
                    Open
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

