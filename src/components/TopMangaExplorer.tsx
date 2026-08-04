"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { MangaItem } from "@/lib/types";
import type { AnimePageInfo, MediaSortOption } from "@/lib/fetchers";
import { buildMangaSlug } from "@/lib/slug";

const ANILIST_MAX_ENTRIES = 5000;

const sortTabs: { label: string; value: MediaSortOption }[] = [
  { label: "Top Rated", value: "SCORE_DESC" },
  { label: "Most Popular", value: "POPULARITY_DESC" },
];

const statusOptions = [
  { value: "All", label: "All statuses" },
  { value: "RELEASING", label: "Publishing" },
  { value: "FINISHED", label: "Finished" },
  { value: "NOT_YET_RELEASED", label: "Upcoming" },
  { value: "HIATUS", label: "Hiatus" },
  { value: "CANCELLED", label: "Cancelled" },
];

const formatOptions = [
  { value: "All", label: "All formats" },
  { value: "MANGA", label: "Manga" },
  { value: "NOVEL", label: "Novel" },
  { value: "ONE_SHOT", label: "One Shot" },
  { value: "DOUJINSHI", label: "Doujinshi" },
];

function statusBadgeClass(status: MangaItem["status"]): string {
  switch (status) {
    case "Publishing":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "Upcoming":
    case "Hiatus":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    case "Cancelled":
      return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
    default:
      return "bg-surface-2 text-muted";
  }
}

function getPageList(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", total];
  }
  if (current >= total - 3) {
    return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

export default function TopMangaExplorer({
  manga,
  pageInfo,
  sort,
  status,
  genre,
  format,
  search,
  genres,
}: {
  manga: MangaItem[];
  pageInfo: AnimePageInfo;
  sort: MediaSortOption;
  status: string;
  genre: string;
  format: string;
  search: string;
  genres: string[];
}) {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams();
      const current: Record<string, string | null> = {
        status: status && status !== "All" ? status : null,
        genre: genre !== "All" ? genre : null,
        format: format !== "All" ? format : null,
        search: search.trim() || null,
      };
      if (sort !== "SCORE_DESC") current.sort = sort;
      const merged = { ...current, ...overrides };
      for (const [k, v] of Object.entries(merged)) {
        if (!v || v === "All") continue;
        if (k === "sort" && v === "SCORE_DESC") continue;
        params.set(k, v);
      }
      const qs = params.toString();
      return qs ? `/top-manga?${qs}` : "/top-manga";
    },
    [sort, status, genre, format, search],
  );

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search.trim()) return;
    const t = setTimeout(() => {
      router.push(buildUrl({ search: trimmed || null }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, search, buildUrl, router]);

  const { currentPage, total, perPage } = pageInfo;
  const maxPage = Math.max(1, Math.floor(ANILIST_MAX_ENTRIES / perPage));
  const totalPages = Math.max(1, Math.min(maxPage, Math.ceil(total / perPage)));
  const lastPage = pageInfo.hasNextPage
    ? totalPages
    : Math.min(totalPages, Math.max(1, currentPage));
  const rangeStart = manga.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const cappedTotal = Math.min(total, maxPage * perPage);
  const rangeEnd = Math.min(currentPage * perPage, cappedTotal);

  const hasFilters =
    status !== "All" ||
    genre !== "All" ||
    format !== "All" ||
    Boolean(search.trim());

  function resetFilters() {
    const params = new URLSearchParams();
    if (sort !== "SCORE_DESC") params.set("sort", sort);
    const qs = params.toString();
    router.push(qs ? `/top-manga?${qs}` : "/top-manga");
  }

  function goToPage(p: number) {
    const target = Math.min(Math.max(1, p), lastPage);
    router.push(buildUrl({ page: String(target) }));
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-1 to-brand-2" />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Top Manga
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Community rankings updated daily ·{" "}
            {total > 0 ? (
              <>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()}
                </span>{" "}
                of {cappedTotal.toLocaleString()}
              </>
            ) : (
              "No results"
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface-2 p-1">
          {sortTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => router.push(buildUrl({ sort: t.value }))}
              className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition ${
                sort === t.value ? "text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {sort === t.value && (
                <motion.span
                  layoutId="explorer-tab-pill"
                  className="absolute inset-0 rounded-md bg-gradient-to-r from-brand-1 to-brand-2"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 110-16 8 8 0 010 16z"
            />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title..."
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-subtle outline-none transition focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => router.push(buildUrl({ status: e.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-muted outline-none transition focus:border-accent"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value} className="bg-surface text-foreground">
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={format}
            onChange={(e) => router.push(buildUrl({ format: e.target.value }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-muted outline-none transition focus:border-accent"
          >
            {formatOptions.map((f) => (
              <option key={f.value} value={f.value} className="bg-surface text-foreground">
                {f.label}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-muted transition hover:text-accent"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {["All", ...genres].map((g) => (
          <button
            key={g}
            onClick={() => router.push(buildUrl({ genre: g }))}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              genre === g
                ? "border-accent bg-accent/10 text-accent-strong"
                : "border-border bg-surface text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div
        ref={tableRef}
        className="overflow-hidden rounded-2xl border border-border bg-surface"
      >
        <div className="hidden grid-cols-[3rem_1fr_5rem_5rem_4rem_4rem] gap-4 border-b border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-subtle md:grid">
          <div>Rank</div>
          <div>Title</div>
          <div className="text-right">Score</div>
          <div className="text-right">Type</div>
          <div className="text-right">Vol</div>
          <div className="text-right">Ch</div>
        </div>

        {manga.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No results</p>
            <p className="mt-1 text-xs text-subtle">
              Try adjusting your filters or search query.
            </p>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:text-accent"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {manga.map((a, i) => {
              const rank = (currentPage - 1) * perPage + i;
              return (
                <motion.a
                  key={a.id}
                  href={`/manga/${buildMangaSlug(a.title)}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.3) }}
                  className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-surface-hover md:grid-cols-[3rem_1fr_5rem_5rem_4rem_4rem] md:gap-4 md:px-5"
                >
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-lg font-black tabular-nums ${
                        rank < 3
                          ? "bg-gradient-to-r from-brand-1 to-brand-2 bg-clip-text text-transparent"
                          : "text-subtle"
                      }`}
                    >
                      {String(rank + 1).padStart(2, "0")}
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
                          className={`hidden flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium sm:inline ${statusBadgeClass(a.status)}`}
                        >
                          {a.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-subtle">
                        <span>{a.author}</span>
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
                    <svg
                      className="h-3 w-3 text-amber-500 dark:text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.42 4.36a1 1 0 00.95.69h4.59c.97 0 1.37 1.24.59 1.81l-3.72 2.7a1 1 0 00-.36 1.12l1.42 4.36c.3.92-.75 1.68-1.54 1.12l-3.72-2.7a1 1 0 00-1.17 0l-3.72 2.7c-.79.56-1.84-.2-1.54-1.12l1.42-4.36a1 1 0 00-.36-1.12l-3.72-2.7c-.78-.57-.38-1.81.59-1.81h4.59a1 1 0 00.95-.69L9.05 2.93z" />
                    </svg>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {a.score}
                    </span>
                  </div>

                  <div className="hidden text-right md:block">
                    <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      {a.format}
                    </span>
                  </div>

                  <div className="hidden text-right text-sm tabular-nums text-muted md:block">
                    {a.volumes ?? "—"}
                  </div>

                  <div className="hidden text-right text-sm tabular-nums text-muted md:block">
                    {a.chapters ?? "—"}
                  </div>

                  <div className="flex items-center justify-end md:hidden">
                    <div className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1">
                      <svg
                        className="h-3 w-3 text-amber-500 dark:text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.42 4.36a1 1 0 00.95.69h4.59c.97 0 1.37 1.24.59 1.81l-3.72 2.7a1 1 0 00-.36 1.12l1.42 4.36c.3.92-.75 1.68-1.54 1.12l-3.72-2.7a1 1 0 00-1.17 0l-3.72 2.7c-.79.56-1.84-.2-1.54-1.12l1.42-4.36a1 1 0 00-.36-1.12l-3.72-2.7c-.78-.57-.38-1.81.59-1.81h4.59a1 1 0 00.95-.69L9.05 2.93z" />
                      </svg>
                      <span className="text-xs font-semibold text-foreground">
                        {a.score}
                      </span>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {lastPage > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Prev</span>
          </button>

          <div className="flex items-center gap-1">
            {getPageList(currentPage, lastPage).map((p, idx) =>
              p === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-xs font-medium text-subtle"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`relative h-9 w-9 rounded-md text-xs font-semibold transition ${
                    currentPage === p
                      ? "bg-gradient-to-r from-brand-1 to-brand-2 text-white"
                      : "border border-border bg-surface text-muted hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="flex h-9 items-center gap-1 rounded-md border border-border bg-surface px-3 text-xs font-medium text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
