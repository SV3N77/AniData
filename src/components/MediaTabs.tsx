"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CharacterPreview, RelationPreview, StaffPreview } from "@/lib/types";
import { buildAnimeSlug, buildMangaSlug } from "@/lib/slug";

type Tab = "Overview" | "Characters" | "Staff";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-1 to-brand-2" />
      {children}
    </h3>
  );
}

function PersonCard({
  image,
  name,
  sub,
}: {
  image: string;
  name: string;
  sub: string;
}) {
  return (
    <div className="flex gap-3 overflow-hidden rounded-lg border border-border bg-surface p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="h-16 w-12 flex-shrink-0 rounded object-cover"
      />
      <div className="flex min-w-0 flex-col justify-center">
        <div className="truncate text-xs font-semibold text-foreground">
          {name}
        </div>
        {sub && <div className="mt-0.5 text-[11px] text-subtle">{sub}</div>}
      </div>
    </div>
  );
}

function PersonGrid({
  people,
}: {
  people: { id: number; name: string; image: string; role: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {people.map((p) => (
        <PersonCard key={p.id} image={p.image} name={p.name} sub={p.role} />
      ))}
    </div>
  );
}

function CharacterCard({ character }: { character: CharacterPreview }) {
  const va = character.voiceActor;
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex min-w-0 flex-1 gap-3 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.image}
          alt={character.name}
          loading="lazy"
          className="h-20 w-14 flex-shrink-0 rounded object-cover"
        />
        <div className="min-w-0 self-center">
          <div className="truncate text-xs font-semibold text-foreground">
            {character.name}
          </div>
          <div className="mt-0.5 text-[11px] text-subtle">{character.role}</div>
        </div>
      </div>

      {va && (
        <>
          <div className="w-px bg-border" />
          <div className="flex min-w-0 flex-1 justify-end gap-3 p-2">
            <div className="min-w-0 self-center text-right">
              <div className="truncate text-xs font-semibold text-foreground">
                {va.name}
              </div>
              <div className="mt-0.5 text-[11px] text-subtle">
                {va.language}
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={va.image}
              alt={va.name}
              loading="lazy"
              className="h-20 w-14 flex-shrink-0 rounded object-cover"
            />
          </div>
        </>
      )}
    </div>
  );
}

function CharacterGrid({ characters }: { characters: CharacterPreview[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {characters.map((c) => (
        <CharacterCard key={c.id} character={c} />
      ))}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-12 text-center text-sm text-subtle">
      {children}
    </div>
  );
}

export default function MediaTabs({
  synopsis,
  characters,
  staff,
  relations,
  trailer,
  title,
}: {
  synopsis: string;
  characters: CharacterPreview[];
  staff: StaffPreview[];
  relations: RelationPreview[];
  trailer: { id: string; site: string } | null;
  title: string;
}) {
  const [tab, setTab] = useState<Tab>("Overview");

  const tabs: Tab[] = [
    "Overview",
    ...(characters.length ? (["Characters"] as Tab[]) : []),
    ...(staff.length ? (["Staff"] as Tab[]) : []),
  ];

  const hasYoutube = trailer && trailer.site === "youtube";

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-4 border-b border-border">
        {tabs.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative pb-3 text-sm font-semibold transition-colors ${
                active ? "text-foreground" : "text-subtle hover:text-foreground"
              }`}
            >
              {t}
              {active && (
                <motion.span
                  layoutId="media-tab-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-brand-1 to-brand-2"
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "Overview" && (
            <div className="space-y-10">
              <div>
                <SectionTitle>Synopsis</SectionTitle>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                  {synopsis || "No synopsis available."}
                </p>
              </div>

              {characters.length > 0 && (
                <div>
                  <SectionTitle>
                    Characters
                    <span className="ml-1 text-xs font-medium text-subtle">
                      Top {Math.min(8, characters.length)}
                    </span>
                  </SectionTitle>
                  <CharacterGrid characters={characters.slice(0, 8)} />
                </div>
              )}

              {relations.length > 0 && (
                <div>
                  <SectionTitle>Relations</SectionTitle>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {relations.map((r) => (
                      <a
                        key={`${r.type}-${r.id}`}
                        href={`/${r.type === "MANGA" ? "manga" : "anime"}/${r.type === "MANGA" ? buildMangaSlug(r.title) : buildAnimeSlug(r.title)}`}
                        className="group flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-surface p-2 transition-colors hover:border-accent hover:bg-surface-hover"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.cover}
                          alt={r.title}
                          loading="lazy"
                          className="h-16 w-12 flex-shrink-0 rounded object-cover"
                        />
                        <div className="flex min-w-0 flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted">
                              {r.relation}
                            </span>
                            <span className="text-[10px] font-medium uppercase text-subtle">
                              {r.type} {r.format && `· ${r.format}`}
                            </span>
                          </div>
                          <div className="mt-1 truncate text-xs font-semibold text-foreground group-hover:text-accent-strong">
                            {r.title}
                          </div>
                          {r.year && (
                            <div className="text-[11px] text-subtle">{r.year}</div>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {hasYoutube && (
                <div>
                  <SectionTitle>Trailer</SectionTitle>
                  <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="relative aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${trailer!.id}`}
                        title={`${title} trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "Characters" &&
            (characters.length > 0 ? (
              <div className="space-y-4">
                <SectionTitle>
                  Characters
                  <span className="ml-1 text-xs font-medium text-subtle">
                    {characters.length}
                  </span>
                </SectionTitle>
                <CharacterGrid characters={characters} />
              </div>
            ) : (
              <EmptyState>No characters listed.</EmptyState>
            ))}

          {tab === "Staff" &&
            (staff.length > 0 ? (
              <div className="space-y-4">
                <SectionTitle>
                  Staff
                  <span className="ml-1 text-xs font-medium text-subtle">
                    {staff.length}
                  </span>
                </SectionTitle>
                <PersonGrid people={staff} />
              </div>
            ) : (
              <EmptyState>No staff listed.</EmptyState>
            ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
