import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MediaTabs from "@/components/MediaTabs";
import { getMedia, getMediaCharacters, getMediaStaff } from "@/lib/fetchers";
import { parseAnimeId } from "@/lib/slug";
import type { MediaDetail } from "@/lib/types";

export const revalidate = 3600;

function formatAiring(unix: number): string {
  return new Date(unix * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.42 4.36a1 1 0 00.95.69h4.59c.97 0 1.37 1.24.59 1.81l-3.72 2.7a1 1 0 00-.36 1.12l1.42 4.36c.3.92-.75 1.68-1.54 1.12l-3.72-2.7a1 1 0 00-1.17 0l-3.72 2.7c-.79.56-1.84-.2-1.54-1.12l1.42-4.36a1 1 0 00-.36-1.12l-3.72-2.7c-.78-.57-.38-1.81.59-1.81h4.59a1 1 0 00.95-.69L9.05 2.93z" />
    </svg>
  );
}

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border py-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-foreground">{children}</div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mediaId = parseAnimeId(slug);
  if (!Number.isFinite(mediaId) || mediaId <= 0) {
    return { title: "Not found — AniData" };
  }
  try {
    const media = await getMedia(mediaId);
    if (!media) return { title: "Not found — AniData" };
    return {
      title: `${media.title} — AniData`,
      description: media.synopsis.slice(0, 160) || undefined,
    };
  } catch {
    return { title: "Not found — AniData" };
  }
}

export default async function MediaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mediaId = parseAnimeId(slug);
  if (!Number.isFinite(mediaId) || mediaId <= 0) notFound();

  let media: MediaDetail | null = null;
  try {
    media = await getMedia(mediaId);
  } catch (err) {
    console.error("[anilist]", err);
  }
  if (!media) notFound();

  let characters: Awaited<ReturnType<typeof getMediaCharacters>> = [];
  try {
    characters = await getMediaCharacters(mediaId);
  } catch (err) {
    console.error("[anilist]", err);
  }

  let staff: Awaited<ReturnType<typeof getMediaStaff>> = [];
  try {
    staff = await getMediaStaff(mediaId);
  } catch (err) {
    console.error("[anilist]", err);
  }

  const isManga = media.type === "MANGA";

  const statusTone =
    media.status === "Airing"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
      : media.status === "Upcoming"
        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
        : "bg-surface-2 text-muted";

  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        {/* Hero banner with overlapping cover + title */}
        <section className="relative -mt-16 w-full">
          <div className="relative h-[260px] w-full overflow-hidden sm:h-[320px]">
            {media.banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.banner}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(135deg, ${media.color}, color-mix(in oklch, ${media.color} 35%, var(--background)))`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={media.cover}
                  alt=""
                  className="h-full w-full scale-110 object-cover opacity-30 blur-2xl"
                />
              </div>
            )}
            {/* Gradient blends the banner down into the page background */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
            <div className="absolute inset-0 bg-background/10" />
          </div>

          <div className="relative mx-auto max-w-[1400px] px-4 pb-4 sm:px-6 lg:px-8">
            <div className="-mt-12 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6">
              {/* Cover image overlapping the banner */}
              <img
                src={media.cover}
                alt={media.title}
                className="w-32 flex-shrink-0 rounded-xl border border-border object-cover shadow-xl sm:w-44 md:w-52"
              />

              {/* Title + quick facts */}
              <div className="min-w-0 flex-1 pb-1">
                <a
                  href="/"
                  className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-muted transition hover:text-accent-strong"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </a>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-gradient-to-r from-brand-1 to-brand-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {isManga ? "Manga" : "Anime"}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone}`}
                  >
                    {media.status}
                  </span>
                  <span className="rounded border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
                    {media.format}
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground drop-shadow-sm sm:text-4xl md:text-5xl">
                  {media.title}
                </h1>

                {(media.romajiTitle || media.nativeTitle) && (
                  <p className="mt-1 text-sm text-muted">
                    {media.romajiTitle && media.romajiTitle !== media.title
                      ? media.romajiTitle
                      : media.nativeTitle}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-subtle">
                  {media.score > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                      <span className="font-bold text-foreground">
                        {media.score.toFixed(1)}
                      </span>
                    </span>
                  )}
                  <span className="font-medium text-foreground">
                    {media.studio}
                  </span>
                  {media.year && <span>{media.year}</span>}
                  {media.genres[0] && (
                    <span className="truncate">{media.genres.join(", ")}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar + main content */}
        <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
              {/* Score block */}
              <div className="flex items-end justify-between border-b border-border py-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
                    Score
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                    <span className="text-2xl font-black tabular-nums text-foreground">
                      {media.score > 0 ? media.score.toFixed(1) : "—"}
                    </span>
                    <span className="text-xs text-subtle">/ 10</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
                    Popularity
                  </div>
                  <div className="mt-1 text-base font-bold tabular-nums text-foreground">
                    {media.members}
                  </div>
                </div>
              </div>

              <MetaItem label="Mean Score">
                {media.meanScore > 0 ? media.meanScore.toFixed(1) : "—"}
              </MetaItem>
              <MetaItem label="Favorites">
                {media.favourites}
              </MetaItem>
              <MetaItem label="Format">{media.format}</MetaItem>
              <MetaItem label={isManga ? "Volumes" : "Episodes"}>
                {isManga ? (
                  <>
                    {media.volumes ?? "—"}
                    {media.chapters ? ` · ${media.chapters} ch` : ""}
                  </>
                ) : (
                  media.episodes ?? "—"
                )}
              </MetaItem>
              {!isManga && (
                <MetaItem label="Duration">
                  {media.duration ? `${media.duration} min` : "—"}
                </MetaItem>
              )}
              <MetaItem label="Status">{media.status}</MetaItem>
              {!isManga && media.season && (
                <MetaItem label="Season">
                  {media.season} {media.year ?? ""}
                </MetaItem>
              )}
              <MetaItem label={isManga ? "Published" : "Aired"}>
                {media.aired}
              </MetaItem>
              <MetaItem label="Studio">
                {media.studios.join(", ") || "Unknown"}
              </MetaItem>
              <MetaItem label="Source">{media.source}</MetaItem>
              {media.nextAiring && (
                <MetaItem label="Next Episode">
                  Ep {media.nextAiring.episode} ·{" "}
                  {formatAiring(media.nextAiring.airingAt)}
                </MetaItem>
              )}
              {media.nativeTitle && (
                <MetaItem label="Native">{media.nativeTitle}</MetaItem>
              )}

              {/* Genres */}
              <div className="mt-5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
                  Genres
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {media.genres.length ? (
                    media.genres.map((g) => (
                      <span
                        key={g}
                        className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-muted"
                      >
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-subtle">No genres listed.</span>
                  )}
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0">
              <MediaTabs
                synopsis={media.synopsis}
                characters={characters}
                staff={staff}
                relations={media.relations}
                trailer={media.trailer}
                title={media.title}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
