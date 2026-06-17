import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteAccountUnavailability,
  getAccountUnavailability,
  postAccountUnavailability,
} from "../../api/account";
import {
  buildMonthGrid,
  dateKeyFromParts,
  formatMonthLabel,
} from "../../portal/utils/sessionCalendar";
import {
  formatUnavailabilityLabel,
  groupUnavailabilityByDate,
  isPastDateKey,
  monthRangeKeys,
  normalizeUnavailabilityItems,
  pickUnavailabilityErrorMessage,
  toLocalDateKey,
} from "../../utils/unavailability";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const panelClass = "rounded-2xl border border-white/15 bg-white/[0.07] shadow-lg backdrop-blur-sm";
const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[#5eead4]/50";
const primaryBtnClass =
  "rounded-xl border border-[#5eead4]/50 bg-[#5eead4]/15 px-4 py-2.5 text-sm font-semibold text-[#a7f3d0] disabled:opacity-50";
const dangerBtnClass =
  "rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-100 disabled:opacity-50";

export default function StaffUnavailabilityManager({ accessToken }) {
  const today = useMemo(() => new Date(), []);
  const todayKey = toLocalDateKey(today);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [items, setItems] = useState([]);
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [pendingKeys, setPendingKeys] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const byDate = useMemo(() => groupUnavailabilityByDate(items), [items]);
  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const selectedItem = selectedKey ? byDate.get(selectedKey) : null;
  const selectedIsPast = selectedKey ? isPastDateKey(selectedKey) : false;

  const loadItems = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setError("");
      const { from, to } = monthRangeKeys(viewYear, viewMonth);
      const response = await getAccountUnavailability(accessToken, { from, to });
      const { items: list } = normalizeUnavailabilityItems(response);
      setItems(list);
    } catch (fetchError) {
      setError(pickUnavailabilityErrorMessage(fetchError));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, viewMonth, viewYear]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const shiftMonth = (delta) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
    setPendingKeys([]);
  };

  const togglePendingDate = (key) => {
    if (isPastDateKey(key)) return;
    if (byDate.has(key)) {
      setSelectedKey(key);
      return;
    }
    setSelectedKey(key);
    setPendingKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleMarkSelected = async () => {
    const dates = pendingKeys.length
      ? pendingKeys
      : selectedKey && !byDate.has(selectedKey) && !isPastDateKey(selectedKey)
        ? [selectedKey]
        : [];

    if (dates.length === 0) {
      setError("Select at least one future date on the calendar.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const payload =
        dates.length === 1
          ? { date: dates[0], ...(note.trim() ? { note: note.trim() } : {}) }
          : { dates, ...(note.trim() ? { note: note.trim() } : {}) };
      const response = await postAccountUnavailability(accessToken, payload);
      setSuccess(response?.message || "Unavailable date saved.");
      setPendingKeys([]);
      setNote("");
      await loadItems();
    } catch (saveError) {
      setError(pickUnavailabilityErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (dateKey) => {
    if (!dateKey) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const response = await deleteAccountUnavailability(accessToken, dateKey);
      setSuccess(response?.message || "Unavailable date removed.");
      setPendingKeys((prev) => prev.filter((item) => item !== dateKey));
      await loadItems();
    } catch (removeError) {
      setError(pickUnavailabilityErrorMessage(removeError));
    } finally {
      setSaving(false);
    }
  };

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => String(a.date).localeCompare(String(b.date))),
    [items],
  );

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
          {success}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className={`${panelClass} p-4 md:p-5`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">
              {formatMonthLabel(viewYear, viewMonth)}
            </h2>
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
                  setPendingKeys([]);
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

          <p className="mb-3 text-xs text-white/55">
            Tap a date to select it. Unavailable days are highlighted in red. Past dates cannot be
            marked.
          </p>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-white/55">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1.5">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {grid.map((day, idx) => {
              if (day === null) return <div key={`pad-${idx}`} className="aspect-square" />;

              const key = dateKeyFromParts(viewYear, viewMonth, day);
              const isUnavailable = byDate.has(key);
              const isPending = pendingKeys.includes(key);
              const isSelected = selectedKey === key;
              const isPast = isPastDateKey(key);
              const isToday = todayKey === key;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isPast}
                  onClick={() => togglePendingDate(key)}
                  className={[
                    "relative aspect-square rounded-lg border text-sm font-semibold transition",
                    isUnavailable
                      ? "border-red-400/50 bg-red-500/20 text-red-100"
                      : isPending
                        ? "border-amber-400/50 bg-amber-500/20 text-amber-100"
                        : isSelected
                          ? "border-[#5eead4]/70 bg-[#5eead4]/25 text-white"
                          : "border-white/10 bg-white/5 text-white/75",
                    isPast ? "cursor-not-allowed opacity-40" : "hover:border-white/30",
                    isToday && !isSelected && !isUnavailable ? "ring-1 ring-[#5eead4]/50" : "",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-white/55">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-red-400/50 bg-red-500/20" />
              Unavailable
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-amber-400/50 bg-amber-500/20" />
              Selected to mark
            </span>
          </div>
        </section>

        <section className={`${panelClass} p-4 md:p-5`}>
          <h2 className="text-base font-semibold text-white">
            {selectedKey ? formatUnavailabilityLabel(selectedKey) : "Select a date"}
          </h2>

          {loading ? (
            <p className="mt-4 text-sm text-white/60">Loading availability…</p>
          ) : selectedItem ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-red-100">You marked this date as unavailable.</p>
              {selectedItem.note ? (
                <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">
                  {selectedItem.note}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => handleRemove(selectedKey)}
                disabled={saving}
                className={dangerBtnClass}
              >
                {saving ? "Removing…" : "Remove unavailability"}
              </button>
            </div>
          ) : selectedIsPast ? (
            <p className="mt-4 text-sm text-white/60">Past dates cannot be marked unavailable.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-white/70">
                Mark {pendingKeys.length > 1 ? `${pendingKeys.length} dates` : "this date"} as
                unavailable for bookings and assignments.
              </p>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/55">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="e.g. Personal leave"
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={handleMarkSelected}
                disabled={saving}
                className={primaryBtnClass}
              >
                {saving ? "Saving…" : "Mark unavailable"}
              </button>
            </div>
          )}
        </section>
      </div>

      <section className={`${panelClass} p-4 md:p-5`}>
        <h2 className="text-base font-semibold text-white">Unavailable dates this month</h2>
        {loading ? (
          <p className="mt-3 text-sm text-white/60">Loading…</p>
        ) : sortedItems.length === 0 ? (
          <p className="mt-3 text-sm text-white/60">No unavailable dates in this month.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {sortedItems.map((item) => (
              <li
                key={item._id || item.date}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {formatUnavailabilityLabel(item.date)}
                  </p>
                  {item.note ? (
                    <p className="mt-0.5 text-xs text-white/60">{item.note}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKey(item.date);
                    handleRemove(item.date);
                  }}
                  disabled={saving}
                  className="rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-100"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
