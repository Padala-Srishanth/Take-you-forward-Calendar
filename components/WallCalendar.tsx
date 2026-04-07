"use client";

import { useEffect, useMemo, useState } from "react";
import Notes from "./Notes";

/* ----------------------------- Date utilities ---------------------------- */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS_MON = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Convert Sunday=0..Saturday=6 to Monday=0..Sunday=6
  const firstDayMon = (first.getDay() + 6) % 7;

  const cells: { date: Date; inMonth: boolean }[] = [];

  // leading days from prev month
  const prevDays = new Date(year, month, 0).getDate();
  for (let i = firstDayMon - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, prevDays - i),
      inMonth: false,
    });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  // trailing days
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }
  // Always render 6 rows for layout stability
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }
  return cells;
}

/* ------------------------------- Hero images ----------------------------- */
/* One image per month — palette restricted to soft blues / teals / slates. */
const HERO_IMAGES: { url: string; tone: string; toneSoft: string }[] = [
  { url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&q=70", tone: "#1e88e5", toneSoft: "#64b5f6" }, // Jan
  { url: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&q=70", tone: "#3949ab", toneSoft: "#7986cb" }, // Feb
  { url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=70", tone: "#0288d1", toneSoft: "#4fc3f7" }, // Mar
  { url: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&q=70", tone: "#039be5", toneSoft: "#4fc3f7" }, // Apr
  { url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=70", tone: "#00838f", toneSoft: "#4dd0e1" }, // May
  { url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=70", tone: "#1976d2", toneSoft: "#64b5f6" }, // Jun
  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=70", tone: "#0277bd", toneSoft: "#4fc3f7" }, // Jul
  { url: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&q=70", tone: "#1565c0", toneSoft: "#5c9ce6" }, // Aug
  { url: "https://images.unsplash.com/photo-1507371341162-763b5e419408?w=1200&q=70", tone: "#00796b", toneSoft: "#4db6ac" }, // Sep
  { url: "https://images.unsplash.com/photo-1507783548227-544c3b8fc065?w=1200&q=70", tone: "#37474f", toneSoft: "#78909c" }, // Oct
  { url: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=70", tone: "#455a64", toneSoft: "#90a4ae" }, // Nov
  { url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=70", tone: "#1a237e", toneSoft: "#5c6bc0" }, // Dec
];

/* US-style holidays — simple fixed-date markers */
const HOLIDAYS: Record<string, string> = {
  "01-01": "New Year's Day",
  "02-14": "Valentine's Day",
  "03-17": "St. Patrick's Day",
  "07-04": "Independence Day",
  "10-31": "Halloween",
  "11-11": "Veterans Day",
  "12-25": "Christmas Day",
  "12-31": "New Year's Eve",
};

/* --------------------------------- Types --------------------------------- */

type Range = { start: Date | null; end: Date | null };

/* -------------------------------- Component ------------------------------ */

export default function WallCalendar() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [range, setRange] = useState<Range>({ start: null, end: null });
  const [hover, setHover] = useState<Date | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const hero = HERO_IMAGES[month];

  // Trigger flip animation on month change
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [year, month]);

  const goPrev = () => setCursor(new Date(year, month - 1, 1));
  const goNext = () => setCursor(new Date(year, month + 1, 1));
  const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

  const handlePick = (d: Date) => {
    const day = startOfDay(d);
    if (!range.start || (range.start && range.end)) {
      setRange({ start: day, end: null });
    } else if (range.start && !range.end) {
      if (day < range.start) {
        setRange({ start: day, end: range.start });
      } else {
        setRange({ start: range.start, end: day });
      }
    }
  };

  const inRange = (d: Date) => {
    if (!range.start) return false;
    const end = range.end ?? hover;
    if (!end) return sameDay(d, range.start);
    const [lo, hi] = range.start <= end ? [range.start, end] : [end, range.start];
    return d >= startOfDay(lo) && d <= startOfDay(hi);
  };

  const isStart = (d: Date) => range.start && sameDay(d, range.start);
  const isEnd = (d: Date) => range.end && sameDay(d, range.end);

  const clearRange = () => {
    setRange({ start: null, end: null });
    setHover(null);
  };

  const fmt = (d: Date | null) =>
    d
      ? d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—";

  return (
    <div className="flex items-center justify-center w-full">
      {/* Portrait wall-calendar card */}
      <div
        className="relative w-[92vw] max-w-[420px] aspect-[420/590] bg-white rounded-2xl"
        style={{
          ["--brand" as any]: hero.tone,
          boxShadow:
            "0 40px 80px -30px rgba(15,23,42,0.35), 0 20px 40px -25px rgba(15,23,42,0.25), 0 1px 0 rgba(255,255,255,0.6) inset",
        }}
      >
        {/* Spiral binding — SVG so the wire rings + central hanger match the reference */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[26px] w-[88%] z-20 pointer-events-none">
          <svg
            viewBox="0 0 380 40"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-[42px]"
          >
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dfe3ea" />
                <stop offset="45%" stopColor="#8a93a0" />
                <stop offset="100%" stopColor="#2f343c" />
              </linearGradient>
            </defs>

            {/* Rings — skip the middle 4 to leave room for the hanger */}
            {Array.from({ length: 32 }).map((_, i) => {
              if (i >= 14 && i <= 17) return null;
              const x = 10 + i * 11.6;
              return (
                <ellipse
                  key={i}
                  cx={x}
                  cy={26}
                  rx={2.2}
                  ry={10}
                  fill="url(#ringGrad)"
                  stroke="#2f343c"
                  strokeWidth="0.6"
                />
              );
            })}

            {/* Central hanger hook */}
            <path
              d="M 170 28 L 190 8 L 210 28"
              stroke="#3d434c"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="190"
              cy="6"
              r="2"
              fill="none"
              stroke="#3d434c"
              strokeWidth="1.4"
            />
          </svg>
        </div>

        {/* Inner page */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col">
          {/* Hero image — top ~60% */}
          <section
            key={`hero-${animKey}`}
            className="relative h-[58%] animate-fade overflow-hidden group"
          >
            <img
              src={hero.url}
              alt={`${MONTHS[month]} hero`}
              className="absolute inset-0 w-full h-full object-cover scale-[1.02] transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              loading="lazy"
            />

            {/* Top → bottom blend gradient — softens the photo edges and lifts the wedge below */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/25 via-transparent to-black/15" />

            {/* Single clean clip-path V wedge with a brand → softer-brand gradient fill */}
            <div
              className="absolute inset-x-0 bottom-0 h-[60%]"
              style={{
                clipPath: "polygon(0% 38%, 48% 96%, 100% 18%, 100% 100%, 0% 100%)",
                background: `linear-gradient(135deg, ${hero.tone} 0%, ${hero.toneSoft} 100%)`,
                boxShadow: "0 -10px 30px -10px rgba(0,0,0,0.35)",
              }}
            />

            {/* Year + Month label — sits inside the deeper right side of the wedge */}
            <div className="absolute right-5 bottom-4 text-white text-right leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              <div className="text-[12px] tracking-[0.25em] font-light mb-1.5 opacity-90">
                {year}
              </div>
              <div className="text-[26px] font-extrabold tracking-[0.06em] uppercase">
                {MONTHS[month]}
              </div>
            </div>

            {/* Month nav arrows — fully transparent */}
            <div className="absolute top-2.5 right-2.5 flex gap-1.5 z-10">
              <button
                onClick={goPrev}
                aria-label="Previous month"
                className="h-12 w-12 rounded-full bg-transparent hover:bg-white/15 text-white flex items-center justify-center active:scale-95 transition drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="15 6 9 12 15 18" />
                </svg>
              </button>
              <button
                onClick={goNext}
                aria-label="Next month"
                className="h-12 w-12 rounded-full bg-transparent hover:bg-white/15 text-white flex items-center justify-center active:scale-95 transition drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </button>
            </div>
          </section>

          {/* Bottom section: Notes (left) + Dates (right) */}
          <section className="flex-1 flex px-4 pt-3 pb-3 gap-4 min-h-0">
            {/* Notes — left */}
            <div className="w-[38%] min-w-0 flex flex-col">
              <Notes
                monthKey={`${year}-${String(month + 1).padStart(2, "0")}`}
                range={range}
              />
            </div>

            {/* Vertical divider */}
            <div className="w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

            {/* Dates — right */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* "Go to Today" — only shown when the visible month isn't the current month */}
              {(year !== today.getFullYear() || month !== today.getMonth()) && (
                <button
                  onClick={() => {
                    goToday();
                    setRange({ start: today, end: null });
                  }}
                  className="self-end mb-1 text-[9px] font-bold uppercase tracking-wider text-[color:var(--brand)] hover:underline underline-offset-2 transition"
                >
                  Today
                </button>
              )}

              {/* Weekday header — bold, wide-tracked, uppercase */}
              <div className="grid grid-cols-7 text-[9px] font-bold tracking-[0.08em] text-slate-600 mb-1.5">
                {WEEKDAYS_MON.map((w, i) => (
                  <div
                    key={w}
                    className={`text-center ${
                      i >= 5 ? "text-[color:var(--brand)]" : ""
                    }`}
                  >
                    {w}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div
                key={`grid-${animKey}`}
                className="grid grid-cols-7 grid-rows-6 gap-[2px] animate-flip flex-1 min-h-0"
                style={{ transformOrigin: "top center" }}
              >
                {cells.map(({ date, inMonth }, idx) => {
                  const key = toKey(date);
                  const isToday = sameDay(date, today);
                  const within = inRange(date);
                  const start = isStart(date);
                  const end = isEnd(date);
                  const weekend =
                    date.getDay() === 0 || date.getDay() === 6;
                  const holidayKey = `${String(date.getMonth() + 1).padStart(
                    2,
                    "0"
                  )}-${String(date.getDate()).padStart(2, "0")}`;
                  const holiday = HOLIDAYS[holidayKey];

                  return (
                    <button
                      key={`${key}-${idx}`}
                      onClick={() => handlePick(date)}
                      onMouseEnter={() => setHover(date)}
                      onMouseLeave={() => setHover(null)}
                      title={holiday || undefined}
                      className={[
                        "relative w-full h-full min-h-0 rounded-md text-[11px] font-bold flex items-center justify-center select-none overflow-hidden",
                        "transition-colors duration-150 ease-out",
                        "focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[color:var(--brand)]",
                        // Base text color — weekends always brand-colored when in-month
                        !inMonth
                          ? "text-slate-300 font-semibold"
                          : weekend
                          ? "text-[color:var(--brand)]"
                          : "text-slate-800",
                        within && !start && !end
                          ? "bg-[color:var(--brand)]/15"
                          : "",
                        start || end
                          ? "!bg-[color:var(--brand)] !text-white"
                          : "hover:bg-slate-100",
                        isToday && !start && !end
                          ? "ring-1 ring-inset ring-[color:var(--brand)]"
                          : "",
                      ].join(" ")}
                    >
                      {date.getDate()}
                      {holiday && (
                        <span className="absolute top-[2px] right-[2px] h-[3px] w-[3px] rounded-full bg-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Soft drop shadow under the card (already via shadow-wall) */}
      </div>
    </div>
  );
}
