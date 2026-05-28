/** Local calendar date key YYYY-MM-DD */
export const toDateKey = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseDateKey = (key) => {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export const groupSessionsByDate = (sessions) => {
  const map = new Map();
  for (const session of sessions || []) {
    const key = toDateKey(session?.scheduledAt);
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(session);
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }
  return map;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const formatMonthLabel = (year, monthIndex) =>
  `${MONTH_NAMES[monthIndex]} ${year}`;

/** Build grid cells: null = padding, number = day of month */
export const buildMonthGrid = (year, monthIndex) => {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  return cells;
};

export const dateKeyFromParts = (year, monthIndex, day) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
