"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { MangaItem } from "@/lib/types";
import type { AnimePageInfo, MediaSortOption } from "@/lib/fetchers";
import { buildMediaSlug } from "@/lib/slug";

const sortTabs: { label: string; value: MediaSortOption }[] = [
  { label: "Most Popular", value: "POPULARITY_DESC" },
  { label: "Top Rated", value: "SCORE_DESC" },
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

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
        {label}
      </h3>
      {children}
    </div>
  );
}

export default function MangaExplorer({
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
  const [searchInput, setSearchInput] = useState(search);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [items, setItems] = useState<MangaItem[]>(manga);
  const [currentPage, setCurrentPage] = useState<number>(pageInfo.currentPage);
  const [hasMore, setHasMore] = useState<boolean>(pageInfo.hasNextPage);
  const [loading, setLoading] = useState<boolean>(false);

  const filtersKey = `${sort}|${status}|${genre}|${format}|${search}`;
  const lastFiltersKey = useRef(filtersKey);
  if (lastFiltersKey.current !== filtersKey) {
    lastFiltersKey.current = filtersKey;
    setItems(manga);
    setCurrentPage(pageInfo.currentPage);
    setHasMore(pageInfo.hasNextPage);
    setLoading(false);
  }

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams();
      const current: Record<string, string | null> = {
        status: status !== "All" ? status : null,
        genre: genre !== "All" ? genre : null,
        format: format !== "All" ? format : null,
        search: search.trim() || null,
      };
      if (sort !== "POPULARITY_DESC") current.sort = sort;
      const merged = { ...current, ...overrides };
      for (const [k, v] of Object.entries(merged)) {
        if (!v || v === "All") continue;
        if (k === "sort" && v === "POPULARITY_DESC") continue;
        params.set(k, v);
      }
      const qs = params.toString();
      return qs ? `/manga?${qs}` : "/manga";
    },
    [sort, status, genre, format, search],
  );

  const navigate = useCallback(
    (overrides: Record<string, string | null>) => {
      router.push(buildUrl(overrides));
    },
    [router, buildUrl],
  );

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search.trim()) return;
    const t = setTimeout(() => {
      router.push(buildUrl({ search: trimmed || null }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, search, buildUrl, router]);

  const hasFilters =
    status !== "All" ||
    genre !== "All" ||
    format !== "All" ||
    Boolean(search.trim());

  const activeCount = [
    status !== "All",
    format !== "All",
    genre !== "All",
    Boolean(search.trim()),
    sort !== "POPULARITY_DESC",
  ].filter(Boolean).length;

  function resetFilters() {
    const params = new URLSearchParams();
    const qs = params.toString();
    router.push(qs ? `/manga?${qs}` : "/manga");
  }

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = currentPage + 1;
    const params = new URLSearchParams();
    if (sort !== "POPULARITY_DESC") params.set("sort", sort);
    if (status !== "All") params.set("status", status);
    if (genre !== "All") params.set("genre", genre);
    if (format !== "All") params.set("format", format);
    if (search.trim()) params.set("search", search.trim());
    params.set("page", String(nextPage));

    try {
      const res = await fetch(`/api/manga?${params.toString()}`);
      if (!res.ok) throw new Error("fetch failed");
      const json = (await res.json()) as {
        manga: MangaItem[];
        pageInfo: AnimePageInfo;
      };
      setItems((prev) => [...prev, ...json.manga]);
      setCurrentPage(json.pageInfo.currentPage);
      setHasMore(json.pageInfo.hasNextPage);
    } catch (err) {
      console.error("[manga/infinite]", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, sort, status, genre, format, search]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const total = pageInfo.total;

  const filtersPanel = (
    <div className="space-y-5">
      <FilterGroup label="Search">
        <div className="relative">
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
            placeholder="Title..."
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-subtle outline-none transition focus:border-accent"
          />
        </div>
      </FilterGroup>

      <FilterGroup label="Sort by">
        <div className="grid grid-cols-2 gap-1.5">
          {sortTabs.map((t) => (
            <button
              key={t.value}
              onClick={() => navigate({ sort: t.value })}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                sort === t.value
                  ? "border-accent bg-accent/10 text-accent-strong"
                  : "border-border bg-surface text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Status">
        <div className="flex flex-col gap-1">
          {statusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => navigate({ status: s.value })}
              className={`rounded-md border px-3 py-1.5 text-left text-xs font-medium transition ${
                status === s.value
                  ? "border-accent bg-accent/10 text-accent-strong"
                  : "border-border bg-surface text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Format">
        <div className="flex flex-col gap-1">
          {formatOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => navigate({ format: f.value })}
              className={`rounded-md border px-3 py-1.5 text-left text-xs font-medium transition ${
                format === f.value
                  ? "border-accent bg-accent/10 text-accent-strong"
                  : "border-border bg-surface text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Genre">
        <div className="flex flex-wrap gap-1.5">
          {["All", ...genres].map((g) => (
            <button
              key={g}
              onClick={() => navigate({ genre: g })}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                genre === g
                  ? "border-accent bg-accent/10 text-accent-strong"
                  : "border-border bg-surface text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </FilterGroup>

      {hasFilters && (
        <button
          onClick={resetFilters}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-4">
            {filtersPanel}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-1 to-brand-2" />
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Browse Manga
                </h2>
              </div>
              {total > 0 && (
                <p className="mt-1 text-sm text-muted">
                  {total.toLocaleString()} titles in the database
                </p>
              )}
            </div>

            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground transition hover:border-accent lg:hidden"
            >
              <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" />
              </svg>
              Filters
              {activeCount > 0 && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-brand-1 to-brand-2 px-1 text-[10px] font-bold text-white">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-5 py-16 text-center">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {items.map((a, i) => (
                  <motion.a
                    key={a.id}
                    href={`/manga/${buildMediaSlug(a.id, a.title)}`}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
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
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass(a.status)}`}
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
                      <p className="mt-0.5 truncate text-xs text-subtle">{a.author}</p>

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
                        <span>
                          {a.volumes != null && <>Vol {a.volumes}</>}
                          {a.volumes != null && a.chapters != null && " · "}
                          {a.chapters != null && <>Ch {a.chapters}</>}
                          {a.volumes == null && a.chapters == null && a.year}
                        </span>
                        <span className="ml-auto truncate">{a.genres[0]}</span>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </AnimatePresence>
            </div>
          )}

          {items.length > 0 && (
            <div ref={sentinelRef} className="mt-8 flex justify-center py-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <svg className="h-4 w-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Loading more…
                </div>
              ) : !hasMore ? (
                <p className="text-xs text-subtle">You&apos;ve reached the end</p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 36 }}
              className="fixed inset-y-0 left-0 z-[60] flex w-[85%] max-w-sm flex-col border-r border-border bg-background shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-bold text-foreground">Filters</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-foreground"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">{filtersPanel}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
