import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SeasonalAnimeExplorer from "@/components/SeasonalAnimeExplorer";
import {
  getSeasonalAnimePage,
  getGenres,
  type MediaSortOption,
} from "@/lib/fetchers";
import {
  getCurrentSeason,
  getSeasonOptions,
  type Season,
  type SeasonOption,
} from "@/lib/anilist";

export const metadata: Metadata = {
  title: "Seasonal Anime — AniData",
  description:
    "Browse anime by season and year. Filter by genre, format, status, and popularity.",
};

export const revalidate = 3600;

const PER_PAGE = 30;
const SEASONS: Season[] = ["WINTER", "SPRING", "SUMMER", "FALL"];

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function parseSeason(value: string | undefined): Season {
  return (SEASONS as string[]).includes(value ?? "")
    ? (value as Season)
    : getCurrentSeason().season;
}

function parseYear(value: string | undefined): number {
  const fallback = getCurrentSeason().year;
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 1900 && n < 2100 ? n : fallback;
}

export default async function SeasonalAnimePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const season = parseSeason(first(sp.season));
  const year = parseYear(first(sp.year));

  const rawPage = parseInt(first(sp.page) ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const sort: MediaSortOption =
    first(sp.sort) === "SCORE_DESC" ? "SCORE_DESC" : "POPULARITY_DESC";
  const status = first(sp.status) ?? null;
  const genre = first(sp.genre) ?? null;
  const format = first(sp.format) ?? null;
  const search = first(sp.search) ?? null;

  const seasonOptions: SeasonOption[] = getSeasonOptions(12, 4);

  const [result, genres] = await Promise.all([
    getSeasonalAnimePage({
      page,
      perPage: PER_PAGE,
      sort,
      status,
      genre,
      format,
      search,
      season,
      year,
    }).catch((err) => {
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
    }),
    getGenres().catch(() => [] as string[]),
  ]);

  const { anime, pageInfo } = result;
  const currentLabel = `${season.charAt(0)}${season.slice(1).toLowerCase()} ${year}`;

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
                Seasonal Anime
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              Anime by{" "}
              <span className="bg-gradient-to-r from-brand-1 to-brand-2 bg-clip-text text-transparent">
                Season
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted">
              Travel through every season and year. Pick a season below, then
              filter by format, genre, status, and more.
            </p>
          </div>
        </section>

        <SeasonalAnimeExplorer
          anime={anime}
          pageInfo={pageInfo}
          season={season}
          year={year}
          currentLabel={currentLabel}
          seasonOptions={seasonOptions}
          sort={sort}
          status={status ?? "All"}
          genre={genre ?? "All"}
          format={format ?? "All"}
          search={search ?? ""}
          genres={genres}
        />
      </main>
      <Footer />
    </>
  );
}
