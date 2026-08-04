"use client";

import { AnimatePresence, motion } from "framer-motion";
import SearchBox from "@/components/SearchBox";
import { buildMediaSlug } from "@/lib/slug";
import type { AnimeItem, MangaItem } from "@/lib/types";

function AnimeCard({ a, index }: { a: AnimeItem; index: number }) {
  return (
    <motion.a
      href={`/anime/${buildMediaSlug(a.id, a.title)}`}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: Math.min((index % 6) * 0.05, 0.3) }}
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
          <span>{a.episodes != null ? `${a.episodes} eps` : a.year}</span>
          <span className="ml-auto truncate">{a.genres[0]}</span>
        </div>
      </div>
    </motion.a>
  );
}

function MangaCard({ m, index }: { m: MangaItem; index: number }) {
  return (
    <motion.a
      href={`/manga/${buildMediaSlug(m.id, m.title)}`}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: Math.min((index % 6) * 0.05, 0.3) }}
      whileHover={{ y: -3 }}
      className="group flex gap-4 overflow-hidden rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent hover:bg-surface-hover"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={m.cover}
        alt={m.title}
        loading="lazy"
        className="h-32 flex-shrink-0 rounded-lg object-cover"
        style={{ width: "5.5rem" }}
      />
      <div className="flex min-w-0 flex-col py-1">
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              m.status === "Publishing"
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : m.status === "Upcoming" || m.status === "Hiatus"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : m.status === "Cancelled"
                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                : "bg-surface-2 text-muted"
            }`}
          >
            {m.status}
          </span>
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted">
            {m.format}
          </span>
        </div>
        <h3 className="mt-2 truncate text-sm font-semibold text-foreground group-hover:text-accent-strong">
          {m.title}
        </h3>
        <p className="mt-0.5 truncate text-xs text-subtle">{m.author}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
          {m.synopsis}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-2 text-[11px] text-subtle">
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3 text-amber-500 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.42 4.36a1 1 0 00.95.69h4.59c.97 0 1.37 1.24.59 1.81l-3.72 2.7a1 1 0 00-.36 1.12l1.42 4.36c.3.92-.75 1.68-1.54 1.12l-3.72-2.7a1 1 0 00-1.17 0l-3.72 2.7c-.79.56-1.84-.2-1.54-1.12l1.42-4.36a1 1 0 00-.36-1.12l-3.72-2.7c-.78-.57-.38-1.81.59-1.81h4.59a1 1 0 00.95-.69L9.05 2.93z" />
            </svg>
            <span className="font-semibold text-muted">{m.score}</span>
          </span>
          <span>
            {m.volumes != null && <>Vol {m.volumes}</>}
            {m.volumes != null && m.chapters != null && " · "}
            {m.chapters != null && <>Ch {m.chapters}</>}
            {m.volumes == null && m.chapters == null && m.year}
          </span>
          <span className="ml-auto truncate">{m.genres[0]}</span>
        </div>
      </div>
    </motion.a>
  );
}

function SectionHeading({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-1 to-brand-2" />
      <h2 className="text-xl font-bold tracking-tight text-foreground">{label}</h2>
      <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
        {count}
      </span>
    </div>
  );
}

export default function SearchResults({
  query,
  anime,
  manga,
}: {
  query: string;
  anime: AnimeItem[];
  manga: MangaItem[];
}) {
  const total = anime.length + manga.length;
  const hasQuery = query.trim().length > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-xl">
        <SearchBox variant="hero" initialValue={query} />
      </div>

      {hasQuery && (
        <p className="mb-8 text-center text-sm text-muted">
          {total > 0 ? (
            <>
              Found{" "}
              <span className="font-semibold text-foreground">{total}</span>{" "}
              result{total === 1 ? "" : "s"} for{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{query}&rdquo;
              </span>
            </>
          ) : (
            <>
              No results for{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{query}&rdquo;
              </span>
            </>
          )}
        </p>
      )}

      {total === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface px-5 py-16 text-center">
          <p className="text-sm font-medium text-foreground">No results found</p>
          <p className="mt-1 text-xs text-subtle">
            Try a different spelling, or search for a title, studio, or author.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {anime.length > 0 && (
            <div>
              <SectionHeading label="Anime" count={anime.length} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {anime.map((a, i) => (
                    <AnimeCard key={a.id} a={a} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {manga.length > 0 && (
            <div>
              <SectionHeading label="Manga" count={manga.length} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {manga.map((m, i) => (
                    <MangaCard key={m.id} m={m} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
