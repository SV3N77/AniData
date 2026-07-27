"use client";

import { motion } from "framer-motion";
import type { StatItem } from "@/lib/types";

export default function SearchHero({
  trending,
  stats,
}: {
  trending: string[];
  stats: StatItem[];
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(225,29,72,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(50%_100%_at_80%_0%,rgba(139,92,246,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          The open anime encyclopedia
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl font-black tracking-tight text-white sm:text-6xl"
        >
          Explore every anime,
          <br />
          <span className="bg-gradient-to-r from-rose-400 to-violet-400 bg-clip-text text-transparent">
            character & studio
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-base text-zinc-400 sm:text-lg"
        >
          Search across thousands of titles. Browse scores, rankings, seasons, and
          detailed metadata curated by the community.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-8 max-w-xl"
        >
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 110-16 8 8 0 010 16z" />
            </svg>
            <input
              type="text"
              placeholder="Search anime, characters, studios, genres..."
              className="w-full rounded-xl border border-white/10 bg-black/40 py-4 pl-12 pr-32 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-rose-500/50 focus:bg-black/60"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-rose-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white">
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-zinc-500">Trending:</span>
            {trending.map((t) => (
              <a
                key={t}
                href="#"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300 transition hover:border-rose-500/40 hover:text-rose-300"
              >
                {t}
              </a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4">
              <div className="bg-gradient-to-r from-rose-400 to-violet-400 bg-clip-text text-2xl font-black text-transparent">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-zinc-400">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
