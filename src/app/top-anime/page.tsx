import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopAnimeExplorer from "@/components/TopAnimeExplorer";
import { getAnimePage, getGenres, parseGenres, type MediaSortOption } from "@/lib/fetchers";

export const metadata: Metadata = {
  title: "Top Anime — AniData",
  description:
    "Browse the highest-rated and most popular anime. Filter by genre, format, and status.",
};

export const revalidate = 3600;

const PER_PAGE = 50;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function TopAnimePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const rawPage = parseInt(first(sp.page) ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const sort: MediaSortOption =
    first(sp.sort) === "POPULARITY_DESC" ? "POPULARITY_DESC" : "SCORE_DESC";
  const status = first(sp.status) ?? null;
  const selectedGenres = parseGenres(sp.genre);
  const format = first(sp.format) ?? null;
  const search = first(sp.search) ?? null;

  const [result, genres] = await Promise.all([
    getAnimePage({ page, perPage: PER_PAGE, sort, status, genres: selectedGenres.length ? selectedGenres : null, format, search }).catch(
      (err) => {
        console.error("[anilist]", err);
        return {
          anime: [],
          pageInfo: {
            currentPage: page,
            hasNextPage: false,
            lastPage: 1,
            total: 0,
            perPage: PER_PAGE,
          },
        };
      },
    ),
    getGenres().catch(() => [] as string[]),
  ]);

  const { anime, pageInfo } = result;

  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(50%_100%_at_80%_0%,color-mix(in_oklch,var(--accent)_16%,transparent),transparent_60%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-gradient-to-b from-brand-1 to-brand-2" />
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Rankings
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              Top Anime{" "}
              <span className="bg-gradient-to-r from-brand-1 to-brand-2 bg-clip-text text-transparent">
                Rankings
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted">
              The highest-rated and most popular anime, curated by the community.
              Sort, filter, and explore the full leaderboard.
            </p>
          </div>
        </section>

        <TopAnimeExplorer
          anime={anime}
          pageInfo={pageInfo}
          sort={sort}
          status={status ?? "All"}
          selectedGenres={selectedGenres}
          format={format ?? "All"}
          search={search ?? ""}
          genres={genres}
        />
      </main>
      <Footer />
    </>
  );
}
