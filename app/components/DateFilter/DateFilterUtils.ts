export type Range = { start: Date; end: Date } | null;

export const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
export const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const today = () => startOfDay(new Date());
export const yesterday = () => startOfDay(new Date(Date.now() - 86400000));

export function addDays(base: Date, days: number) {
  return startOfDay(new Date(base.getTime() + days * 86400000));
}
export function subDays(base: Date, days: number) {
  return addDays(base, -days);
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function endOfMonth(d: Date) {
  return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function formatInput(date: Date) {
  return date.toISOString().slice(0, 10);
}
export function formatLabel(date: Date) {
  // Force a stable, locale-independent label to avoid SSR/CSR hydration mismatches
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC", // normalize to a consistent zone for SSR/CSR
  });
}

export function quarterLabel(d: Date) {
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `FY${String(d.getFullYear()).slice(-2)}-Q${q}`; // Simple fiscal = calendar
}

// Generators + aliases matching DateFilter usage keys
export const presetGenerators: Record<string, (() => Range) | undefined> = {
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

export function resolvePreset(key: string): Range {
  const found = presetList.find((p) => p.key === key);
  if (!found) return null;
  if (found.key === "custom") return null;
  // @ts-ignore - some presets may provide compute
  if ((found as any).compute) return (found as any).compute();
  const gen = presetGenerators[key];
  return gen ? gen() : null;
}

export function clampRange(start: Date, end: Date) {
  if (start > end) return { start: end, end: start };
  return { start, end };
}

export function previousPeriod(start: Date, end: Date) {
  const diff = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 86400000);
  const prevStart = new Date(prevEnd.getTime() - diff);
  return { start: startOfDay(prevStart), end: endOfDay(prevEnd) };
}

export function getPreviousPeriod(range: { start: Date; end: Date } | null) {
  if (!range?.start || !range?.end) return null;
  return previousPeriod(range.start, range.end);
}

export function rangeLabel(argStart: any, argEnd?: any) {
  let start: Date | undefined;
  let end: Date | undefined;
  if (argEnd === undefined && argStart && argStart.start && argStart.end) {
    start = argStart.start;
    end = argStart.end;
  } else {
    start = argStart as Date;
    end = argEnd as Date;
  }
  if (!start || !end) return "";
  if (isSameDay(start, end)) return formatLabel(start);
  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();
  if (sameMonth) {
    const monthShort = start.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const yearFull = start.getFullYear();
    return `${monthShort} ${start.getDate()} – ${end.getDate()}, ${yearFull}`;
  }
  return `${formatLabel(start)} – ${formatLabel(end)}`;
}

export function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
export function inRange(day: Date, start: Date, end: Date) {
  return day >= start && day <= end;
}
