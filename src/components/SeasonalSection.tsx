"use client";

import { motion } from "framer-motion";
import type { AnimeItem } from "@/lib/types";

const formats = ["TV", "Movie", "ONA", "OVA"];

export default function SeasonalSection({
  anime,
  seasons,
}: {
  anime: AnimeItem[];
  seasons: string[];
}) {
  return (
    <section id="seasonal" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-rose-500 to-violet-600" />
            <h2 className="text-2xl font-bold tracking-tight text-white">This Season</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-400">Currently airing and upcoming releases</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 outline-none">
            {seasons.map((s) => (
              <option key={s} className="bg-zinc-900">
                {s}
              </option>
            ))}
          </select>
          <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 outline-none">
            {formats.map((f) => (
              <option key={f} className="bg-zinc-900">
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {anime.map((a, i) => (
          <motion.a
            key={a.id}
            href="#"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
            whileHover={{ y: -3 }}
            className="group flex gap-4 overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.cover}
              alt={a.title}
              loading="lazy"
              className="h-32 w-22 flex-shrink-0 rounded-lg object-cover"
              style={{ width: "5.5rem" }}
            />

            <div className="flex min-w-0 flex-col py-1">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    a.status === "Airing"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {a.status}
                </span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                  {a.format}
                </span>
              </div>

              <h3 className="mt-2 truncate text-sm font-semibold text-white group-hover:text-rose-300">
                {a.title}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">{a.studio}</p>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                {a.synopsis}
              </p>

              <div className="mt-auto flex items-center gap-3 pt-2 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.42 4.36a1 1 0 00.95.69h4.59c.97 0 1.37 1.24.59 1.81l-3.72 2.7a1 1 0 00-.36 1.12l1.42 4.36c.3.92-.75 1.68-1.54 1.12l-3.72-2.7a1 1 0 00-1.17 0l-3.72 2.7c-.79.56-1.84-.2-1.54-1.12l1.42-4.36a1 1 0 00-.36-1.12l-3.72-2.7c-.78-.57-.38-1.81.59-1.81h4.59a1 1 0 00.95-.69L9.05 2.93z" />
                  </svg>
                  <span className="font-semibold text-zinc-300">{a.score}</span>
                </span>
                <span>{a.members}</span>
                <span className="ml-auto truncate">{a.genres[0]}</span>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
