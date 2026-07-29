"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ScheduleItem } from "@/lib/types";

function startOfDay(d: Date): Date {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

function formatClock(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCountdown(unix: number): string {
  const diff = unix - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "Now";
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

type DayGroup = {
  key: string;
  date: Date;
  label: string;
  sub: string;
  isToday: boolean;
  items: ScheduleItem[];
};

export default function ScheduleSection({
  schedule,
}: {
  schedule: ScheduleItem[];
}) {
  const [mounted, setMounted] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>("");

  useEffect(() => setMounted(true), []);

  const days = useMemo<DayGroup[]>(() => {
    if (!mounted) return [];
    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const groups: DayGroup[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      groups.push({
        key: dayKey(d),
        date: d,
        label: sameDay(d, today)
          ? "Today"
          : sameDay(d, tomorrow)
            ? "Tomorrow"
            : d.toLocaleDateString(undefined, { weekday: "short" }),
        sub: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        isToday: sameDay(d, today),
        items: [],
      });
    }

    const indexByKey = new Map(groups.map((g) => [g.key, g]));
    for (const s of schedule) {
      const g = indexByKey.get(dayKey(new Date(s.airingAt * 1000)));
      if (g) g.items.push(s);
    }
    for (const g of groups) g.items.sort((a, b) => a.airingAt - b.airingAt);
    return groups;
  }, [schedule, mounted]);

  useEffect(() => {
    if (days.length && !days.some((d) => d.key === selectedKey)) {
      setSelectedKey(days[0].key);
    }
  }, [days, selectedKey]);

  if (!schedule.length) return null;

  const selected =
    days.find((d) => d.key === selectedKey) ?? days[0] ?? null;
  const isTodaySelected = selected?.isToday ?? false;

  return (
    <section
      id="schedule"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-1 to-brand-2" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Airing Schedule
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Upcoming episodes in the next 7 days
          </p>
        </div>
      </div>

      {mounted && days.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const active = d.key === selectedKey;
            return (
              <button
                key={d.key}
                onClick={() => setSelectedKey(d.key)}
                className={`flex min-w-[4.5rem] flex-col items-center rounded-xl border px-3 py-2 transition-colors ${
                  active
                    ? "border-transparent bg-gradient-to-br from-brand-1 to-brand-2 text-white shadow-sm"
                    : "border-border bg-surface text-muted hover:bg-surface-hover"
                }`}
              >
                <span className="text-[11px] font-semibold">{d.label}</span>
                <span className="text-xs font-bold tabular-nums">{d.sub}</span>
                <span
                  className={`mt-0.5 text-[10px] font-medium ${
                    active ? "text-white/80" : "text-subtle"
                  }`}
                >
                  {d.items.length} {d.items.length === 1 ? "ep" : "eps"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {selected && selected.items.length > 0 ? (
          selected.items.map((s, i) => (
            <motion.a
              key={s.id}
              href="#"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: (i % 10) * 0.03 }}
              className="group grid grid-cols-[3.25rem_2.25rem_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-hover sm:grid-cols-[4.5rem_2.5rem_1fr_auto] sm:gap-4 md:px-5"
            >
              <div className="text-right">
                <div className="text-sm font-bold tabular-nums text-foreground">
                  {mounted ? formatClock(s.airingAt) : "\u00A0"}
                </div>
                <div
                  className={`text-[11px] ${
                    isTodaySelected ? "font-medium text-accent" : "text-subtle"
                  }`}
                >
                  {mounted && isTodaySelected
                    ? formatCountdown(s.airingAt)
                    : s.format}
                </div>
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.cover}
                alt={s.title}
                loading="lazy"
                className="h-14 w-10 flex-shrink-0 rounded object-cover"
              />

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-accent-strong">
                  {s.title}
                </h3>
                <p className="mt-0.5 text-[11px] text-subtle">
                  Episode {s.episode}
                </p>
              </div>

              <span className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                EP {s.episode}
              </span>
            </motion.a>
          ))
        ) : (
          <div className="flex items-center justify-center px-4 py-12 text-sm text-subtle">
            {mounted ? "No episodes scheduled for this day" : "\u00A0"}
          </div>
        )}
      </div>
    </section>
  );
}
