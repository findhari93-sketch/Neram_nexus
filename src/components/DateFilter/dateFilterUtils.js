// Date filter utility helpers
export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const today = () => startOfDay(new Date());
export const yesterday = () => startOfDay(new Date(Date.now() - 86400000));

export function addDays(base, days) {
  return startOfDay(new Date(base.getTime() + days * 86400000));
}
export function subDays(base, days) {
  return addDays(base, -days);
}

export function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function endOfMonth(d) {
  return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function formatInput(date) {
  return date.toISOString().slice(0, 10);
}
export function formatLabel(date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function quarterLabel(d) {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `FY${String(d.getFullYear()).slice(-2)}-Q${q}`; // Simple fiscal = calendar
}

// Generators + aliases matching DateFilter usage keys
export const presetGenerators = {
  custom: () => null,
  today: () => ({ start: today(), end: endOfDay(today()) }),
  yesterday: () => {
    const y = yesterday();
    return { start: y, end: endOfDay(y) };
  },
  last7: () => ({ start: subDays(today(), 6), end: endOfDay(today()) }),
  last7days: () => ({ start: subDays(today(), 6), end: endOfDay(today()) }), // alias
  last14: () => ({ start: subDays(today(), 13), end: endOfDay(today()) }),
  last30: () => ({ start: subDays(today(), 29), end: endOfDay(today()) }),
  last30days: () => ({ start: subDays(today(), 29), end: endOfDay(today()) }), // alias
  last90days: () => ({ start: subDays(today(), 89), end: endOfDay(today()) }),
  thisMonth: () => {
    const now = new Date();
    return { start: startOfMonth(now), end: endOfMonth(now) };
  },
  lastMonth: () => {
    const now = new Date();
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { start: startOfMonth(lm), end: endOfMonth(lm) };
  },
  thisYear: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return { start, end: endOfDay(today()) };
  },
  allTime: () => ({ start: new Date(2000, 0, 1), end: endOfDay(today()) }),
};

export const presetList = [
  { key: "custom", label: "Custom" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 days" },
  { key: "last7days", label: "Last 7 days" },
  { key: "last14", label: "Last 14 days" },
  { key: "last30", label: "Last 30 days" },
  { key: "last30days", label: "Last 30 days" },
  { key: "last90days", label: "Last 90 days" },
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "thisYear", label: "This year" },
  { key: "allTime", label: "All time" },
];

export function resolvePreset(key) {
  const found = presetList.find((p) => p.key === key);
  if (!found) return null;
  if (found.key === "custom") return null;
  if (found.compute) return found.compute();
  const gen = presetGenerators[key];
  return gen ? gen() : null;
}

export function clampRange(start, end) {
  if (start > end) return { start: end, end: start };
  return { start, end };
}

export function previousPeriod(start, end) {
  const diff = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 86400000);
  const prevStart = new Date(prevEnd.getTime() - diff);
  return { start: startOfDay(prevStart), end: endOfDay(prevEnd) };
}

export function getPreviousPeriod(range) {
  if (!range?.start || !range?.end) return null;
  return previousPeriod(range.start, range.end);
}

export function rangeLabel(argStart, argEnd) {
  let start = argStart;
  let end = argEnd;
  if (argEnd === undefined && argStart && argStart.start && argStart.end) {
    start = argStart.start;
    end = argStart.end;
  }
  if (!start || !end) return "";
  if (isSameDay(start, end)) return formatLabel(start);
  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();
  if (sameMonth) {
    const monthShort = start.toLocaleDateString(undefined, { month: "short" });
    const yearFull = start.getFullYear();
    return `${monthShort} ${start.getDate()} – ${end.getDate()}, ${yearFull}`;
  }
  return `${formatLabel(start)} – ${formatLabel(end)}`;
}

export function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}
export function inRange(day, start, end) {
  return day >= start && day <= end;
}
