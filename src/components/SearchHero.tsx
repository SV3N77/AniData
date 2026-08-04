"use client";

import { motion } from "framer-motion";
import type { StatItem } from "@/lib/types";
import SearchBox from "@/components/SearchBox";

export default function SearchHero({
  trending,
  stats,
}: {
  trending: string[];
  stats: StatItem[];
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(50%_100%_at_80%_0%,color-mix(in_oklch,var(--accent)_16%,transparent),transparent_60%)]" />

      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
 
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl font-black tracking-tight text-foreground sm:text-6xl"
        >
          Explore every anime,
          <br />
          <span className="bg-gradient-to-r from-brand-1 to-brand-2 bg-clip-text text-transparent">
            character & studio
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg"
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
            <SearchBox variant="hero" />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-subtle">Trending:</span>
            {trending.map((t) => (
              <a
                key={t}
                href="#"
                className="rounded-full border border-border bg-surface px-3 py-1 text-muted transition hover:border-accent hover:text-accent-strong"
              >
                {t}
              </a>
            ))}
          </div>
        </motion.div>

       
      </div>
    </section>
  );
}
