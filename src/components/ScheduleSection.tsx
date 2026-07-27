"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ScheduleItem } from "@/lib/types";

function formatWeekday(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    weekday: "short",
  });
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

export default function ScheduleSection({
  schedule,
}: {
  schedule: ScheduleItem[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!schedule.length) return null;

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

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {schedule.map((s, i) => (
          <motion.a
            key={s.id}
            href="#"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: (i % 8) * 0.04 }}
            className="group grid grid-cols-[3.5rem_2.25rem_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-hover sm:grid-cols-[4rem_2.5rem_1fr_4rem_5rem] sm:gap-4 md:px-5"
          >
            <div className="text-right">
              <div className="text-xs font-semibold text-foreground">
                {mounted ? formatWeekday(s.airingAt) : "\u00A0"}
              </div>
              <div className="text-[11px] tabular-nums text-subtle">
                {mounted ? formatClock(s.airingAt) : "\u00A0"}
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
              <p className="mt-0.5 text-[11px] text-subtle">{s.format}</p>
            </div>

            <div className="hidden text-right sm:block">
              <span className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                EP {s.episode}
              </span>
            </div>

            <div className="hidden text-right text-[11px] font-medium text-accent sm:block">
              {mounted ? formatCountdown(s.airingAt) : "\u00A0"}
            </div>

            <div className="flex items-center justify-end sm:hidden">
              <span className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">
                EP {s.episode}
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
