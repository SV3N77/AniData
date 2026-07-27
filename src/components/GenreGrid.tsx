"use client";

import { motion } from "framer-motion";
import type { GenreItem } from "@/lib/types";

export default function GenreGrid({ genres }: { genres: GenreItem[] }) {
  return (
    <section id="genres" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-1 to-brand-2" />
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Browse by Genre</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {genres.map((g, i) => (
          <motion.a
            key={g.name}
            href="#"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: (i % 4) * 0.04 }}
            whileHover={{ y: -2 }}
            className="group relative overflow-hidden rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
          >
            <div
              className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-xl transition-opacity group-hover:opacity-40"
              style={{ backgroundColor: g.color }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{g.name}</h3>
                <p className="mt-0.5 text-xs text-subtle">Browse titles</p>
              </div>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                style={{ backgroundColor: `${g.color}22`, color: g.color }}
              >
                {g.name.charAt(0)}
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
