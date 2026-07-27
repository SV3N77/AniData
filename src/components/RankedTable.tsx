"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AnimeItem } from "@/lib/types";

const tabs = ["Top Rated", "Most Popular", "Currently Airing"] as const;
type Tab = (typeof tabs)[number];

export default function RankedTable({ anime }: { anime: AnimeItem[] }) {
  const [tab, setTab] = useState<Tab>("Top Rated");

  const sorted = (() => {
    if (tab === "Most Popular") {
      return [...anime].sort((a, b) => b.popularity - a.popularity);
    }
    if (tab === "Currently Airing") {
      return anime
        .filter((a) => a.status === "Airing")
        .sort((a, b) => b.score - a.score);
    }
    return [...anime].sort((a, b) => b.score - a.score);
  })().slice(0, 10);

  return (
    <section id="top-anime" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-1 to-brand-2" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Top Anime</h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Community rankings updated daily
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface-2 p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === t ? "text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-md bg-gradient-to-r from-brand-1 to-brand-2"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="hidden grid-cols-[3rem_1fr_5rem_5rem_6rem_7rem] gap-4 border-b border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-subtle md:grid">
          <div>Rank</div>
          <div>Title</div>
          <div className="text-right">Score</div>
          <div className="text-right">Type</div>
          <div className="text-right">Eps</div>
          <div className="text-right">Members</div>
        </div>

        <AnimatePresence mode="popLayout">
          {sorted.map((a, i) => (
            <motion.a
              key={a.id}
              href="#"
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-surface-hover md:grid-cols-[3rem_1fr_5rem_5rem_6rem_7rem] md:gap-4 md:px-5"
            >
              <div className="flex items-center justify-center">
                <span
                  className={`text-lg font-black tabular-nums ${
                    i < 3
                      ? "bg-gradient-to-r from-brand-1 to-brand-2 bg-clip-text text-transparent"
                      : "text-subtle"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.cover}
                  alt={a.title}
                  loading="lazy"
                  className="hidden h-14 w-10 flex-shrink-0 rounded object-cover sm:block"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-accent-strong">
                      {a.title}
                    </h3>
                    <span
                      className={`hidden flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium sm:inline ${
                        a.status === "Airing"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : a.status === "Upcoming"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "bg-surface-2 text-muted"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-subtle">
                    <span>{a.studio}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{a.year}</span>
                    <span className="hidden md:inline">·</span>
                    <span className="hidden truncate md:inline">
                      {a.genres.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden items-center justify-end gap-1 text-right md:flex">
                <svg className="h-3 w-3 text-amber-500 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.42 4.36a1 1 0 00.95.69h4.59c.97 0 1.37 1.24.59 1.81l-3.72 2.7a1 1 0 00-.36 1.12l1.42 4.36c.3.92-.75 1.68-1.54 1.12l-3.72-2.7a1 1 0 00-1.17 0l-3.72 2.7c-.79.56-1.84-.2-1.54-1.12l1.42-4.36a1 1 0 00-.36-1.12l-3.72-2.7c-.78-.57-.38-1.81.59-1.81h4.59a1 1 0 00.95-.69L9.05 2.93z" />
                </svg>
                <span className="text-sm font-semibold tabular-nums text-foreground">{a.score}</span>
              </div>

              <div className="hidden text-right md:block">
                <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted">
                  {a.format}
                </span>
              </div>

              <div className="hidden text-right text-sm tabular-nums text-muted md:block">
                {a.episodes ?? "—"}
              </div>

              <div className="hidden text-right text-sm tabular-nums text-muted md:block">
                {a.members}
              </div>

              <div className="flex items-center justify-end md:hidden">
                <div className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1">
                  <svg className="h-3 w-3 text-amber-500 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.42 4.36a1 1 0 00.95.69h4.59c.97 0 1.37 1.24.59 1.81l-3.72 2.7a1 1 0 00-.36 1.12l1.42 4.36c.3.92-.75 1.68-1.54 1.12l-3.72-2.7a1 1 0 00-1.17 0l-3.72 2.7c-.79.56-1.84-.2-1.54-1.12l1.42-4.36a1 1 0 00-.36-1.12l-3.72-2.7c-.78-.57-.38-1.81.59-1.81h4.59a1 1 0 00.95-.69L9.05 2.93z" />
                  </svg>
                  <span className="text-xs font-semibold text-foreground">{a.score}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 text-center">
        <a
          href="#"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-strong"
        >
          View all rankings
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
