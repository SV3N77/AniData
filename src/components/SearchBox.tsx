"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { buildMediaSlug } from "@/lib/slug";
import type { SearchResultItem } from "@/lib/types";

type Variant = "header" | "hero";

const MIN_CHARS = 3;

function SearchIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
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
  );
}

export default function SearchBox({
  variant = "header",
  initialValue = "",
}: {
  variant?: Variant;
  initialValue?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = useId();

  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < MIN_CHARS) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as { results: SearchResultItem[] };
        setResults(json.results);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onFocus(e: FocusEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("focusin", onFocus);
    };
  }, []);

  const submitSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [router],
  );

  const goToResult = useCallback(
    (r: SearchResultItem) => {
      const base = r.type === "MANGA" ? "/manga/" : "/anime/";
      router.push(`${base}${buildMediaSlug(r.id, r.title)}`);
      setOpen(false);
    },
    [router],
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open && results.length) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        goToResult(results[activeIndex]);
      } else {
        submitSearch(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length >= MIN_CHARS;

  const inputClasses =
    variant === "hero"
      ? "w-full rounded-xl border border-border bg-surface py-4 pl-12 pr-28 text-sm text-foreground placeholder:text-subtle outline-none transition focus:border-accent focus:bg-surface"
      : "w-full rounded-full border border-border bg-surface py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-subtle outline-none transition focus:border-accent focus:bg-surface";

  const dropdownClasses =
    variant === "hero"
      ? "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-border bg-popover shadow-xl shadow-black/10"
      : "absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 overflow-hidden rounded-xl border border-border bg-popover shadow-xl shadow-black/10";

  return (
    <div ref={containerRef} className="relative">
      {variant === "hero" ? (
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
      ) : (
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.length && query.trim().length >= MIN_CHARS) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
        }
        placeholder={
          variant === "hero"
            ? "Search anime, manga, characters, studios, genres..."
            : "Search anime..."
        }
        className={inputClasses}
      />

      {variant === "hero" && (
        <button
          type="button"
          onClick={() => submitSearch(query)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-brand-1 to-brand-2 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Search
        </button>
      )}

      {variant === "header" && query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setResults([]);
            setOpen(false);
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle transition hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={dropdownClasses}
          >
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
                <svg className="h-4 w-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Searching…
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-subtle">
                No results for &ldquo;{query.trim()}&rdquo;
              </div>
            ) : (
              <ul id={listId} role="listbox" className="max-h-[24rem] overflow-y-auto py-1">
                {results.map((r, i) => (
                  <li key={`${r.type}-${r.id}`} role="option" aria-selected={i === activeIndex}>
                    <button
                      type="button"
                      id={`${listId}-opt-${i}`}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => goToResult(r)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition ${
                        i === activeIndex ? "bg-surface-hover" : "hover:bg-surface-hover"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.cover}
                        alt=""
                        loading="lazy"
                        className="h-11 w-8 flex-shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {r.title}
                          </span>
                          <span
                            className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              r.type === "MANGA"
                                ? "bg-violet-500/15 text-violet-700 dark:text-violet-300"
                                : "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                            }`}
                          >
                            {r.type === "MANGA" ? "Manga" : "Anime"}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-subtle">
                          {r.format && <span>{r.format}</span>}
                          {r.year && (
                            <>
                              <span>·</span>
                              <span>{r.year}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {r.score > 0 && (
                        <span className="flex flex-shrink-0 items-center gap-1 text-xs font-semibold text-foreground">
                          <svg className="h-3 w-3 text-amber-500 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.42 4.36a1 1 0 00.95.69h4.59c.97 0 1.37 1.24.59 1.81l-3.72 2.7a1 1 0 00-.36 1.12l1.42 4.36c.3.92-.75 1.68-1.54 1.12l-3.72-2.7a1 1 0 00-1.17 0l-3.72 2.7c-.79.56-1.84-.2-1.54-1.12l1.42-4.36a1 1 0 00-.36-1.12l-3.72-2.7c-.78-.57-.38-1.81.59-1.81h4.59a1 1 0 00.95-.69L9.05 2.93z" />
                          </svg>
                          {r.score}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                <li className="border-t border-border">
                  <button
                    type="button"
                    onClick={() => submitSearch(query)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-muted transition hover:bg-surface-hover hover:text-accent-strong"
                  >
                    <span>
                      See all results for &ldquo;{query.trim()}&rdquo;
                    </span>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </li>
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
