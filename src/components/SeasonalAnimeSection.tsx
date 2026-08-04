"use client";

import { motion } from "framer-motion";
import type { AnimeItem } from "@/lib/types";
import { buildMediaSlug } from "@/lib/slug";

export default function SeasonalAnimeSection({
  anime,
  seasonLabel,
}: {
  anime: AnimeItem[];
  seasonLabel: string;
}) {
  if (!anime.length) return null;

  return (
    <section
      id="seasonal-anime"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-1 to-brand-2" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              This Season
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Popular anime airing in {seasonLabel}
          </p>
        </div>

        <a
          href="/seasonal-anime"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-strong"
        >
          Browse all seasonal anime
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {anime.map((a, i) => (
          <motion.a
            key={a.id}
            href={`/anime/${buildMediaSlug(a.id, a.title)}`}
            layout
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: Math.min((i % 6) * 0.05, 0.3) }}
            whileHover={{ y: -3 }}
            className="group flex gap-4 overflow-hidden rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent hover:bg-surface-hover"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.cover}
              alt={a.title}
              loading="lazy"
              className="h-32 flex-shrink-0 rounded-lg object-cover"
              style={{ width: "5.5rem" }}
            />

            <div className="flex min-w-0 flex-col py-1">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    a.status === "Airing"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : a.status === "Upcoming"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      : "bg-surface-2 text-muted"
                  }`}
                >
                  {a.status}
                </span>
                <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted">
                  {a.format}
                </span>
              </div>

              <h3 className="mt-2 truncate text-sm font-semibold text-foreground group-hover:text-accent-strong">
                {a.title}
              </h3>
              <p className="mt-0.5 truncate text-xs text-subtle">{a.studio}</p>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                {a.synopsis}
              </p>

              <div className="mt-auto flex items-center gap-3 pt-2 text-[11px] text-subtle">
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-amber-500 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.42 4.36a1 1 0 00.95.69h4.59c.97 0 1.37 1.24.59 1.81l-3.72 2.7a1 1 0 00-.36 1.12l1.42 4.36c.3.92-.75 1.68-1.54 1.12l-3.72-2.7a1 1 0 00-1.17 0l-3.72 2.7c-.79.56-1.84-.2-1.54-1.12l1.42-4.36a1 1 0 00-.36-1.12l-3.72-2.7c-.78-.57-.38-1.81.59-1.81h4.59a1 1 0 00.95-.69L9.05 2.93z" />
                  </svg>
                  <span className="font-semibold text-muted">{a.score}</span>
                </span>
                <span className="ml-auto truncate">{a.genres[0]}</span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
