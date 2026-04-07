"use client";

import { useEffect, useMemo, useState } from "react";

type Range = { start: Date | null; end: Date | null };

type Props = {
  monthKey: string; // e.g. "2026-04"
  range: Range;
};

const STORAGE_KEY = "wall-calendar-notes-v1";

type Store = {
  monthly: Record<string, string>; // monthKey -> note
  ranges: Record<string, string>;  // "YYYY-MM-DD_YYYY-MM-DD" -> note
};

const empty: Store = { monthly: {}, ranges: {} };

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const prettyDate = (d: Date) =>
  d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

function loadStore(): Store {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return { monthly: parsed.monthly ?? {}, ranges: parsed.ranges ?? {} };
  } catch {
    return empty;
  }
}

function saveStore(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export default function Notes({ monthKey, range }: Props) {
  const [store, setStore] = useState<Store>(empty);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(loadStore());
    setHydrated(true);
  }, []);

  const rangeKey = useMemo(() => {
    if (!range.start) return null;
    const end = range.end ?? range.start;
    return `${fmtDate(range.start)}_${fmtDate(end)}`;
  }, [range.start, range.end]);

  const monthValue = store.monthly[monthKey] ?? "";
  const rangeValue = rangeKey ? store.ranges[rangeKey] ?? "" : "";

  const updateMonth = (text: string) => {
    const next = { ...store, monthly: { ...store.monthly, [monthKey]: text } };
    setStore(next);
    saveStore(next);
  };
  const updateRange = (text: string) => {
    if (!rangeKey) return;
    const next = { ...store, ranges: { ...store.ranges, [rangeKey]: text } };
    setStore(next);
    saveStore(next);
  };

  const rangeLabel = useMemo(() => {
    if (!range.start) return "Select a date range to add notes";
    if (!range.end) return `${prettyDate(range.start)}`;
    return `${prettyDate(range.start)} → ${prettyDate(range.end)}`;
  }, [range]);

  // active mode: if a range is set, notes attach to the range, otherwise the month
  const activeKey = rangeKey ?? monthKey;
  const activeValue = rangeKey ? rangeValue : monthValue;
  const setActive = (text: string) =>
    rangeKey ? updateRange(text) : updateMonth(text);

  const label = rangeKey ? (range.end ? "Range" : "Day") : "Notes";
  const subLabel = rangeKey ? rangeLabel : "";

  return (
    <div className="group flex h-full flex-col min-h-0">
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-[11px] font-semibold tracking-wide text-slate-700 uppercase">
          {label}
        </div>
        {subLabel && (
          <div className="text-[8px] text-slate-400 truncate ml-1">
            {subLabel}
          </div>
        )}
      </div>

      {/* Underline divider beneath the label — animates on hover/focus */}
      <div className="relative h-px w-full bg-slate-200 mb-1.5">
        <div className="absolute inset-y-0 left-0 w-0 bg-[color:var(--brand)] transition-all duration-300 group-hover:w-full group-focus-within:w-full" />
      </div>

      {hydrated && (
        <textarea
          key={activeKey}
          value={activeValue}
          onChange={(e) => setActive(e.target.value)}
          placeholder=""
          aria-label="Notes"
          className="flex-1 w-full resize-none bg-transparent border-0 outline-none p-0 text-[10px] text-slate-700 placeholder:text-slate-300 transition-colors"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 13px, #e2e8f0 13px, #e2e8f0 14px)",
            backgroundSize: "100% 14px",
            lineHeight: "14px",
          }}
        />
      )}
    </div>
  );
}
