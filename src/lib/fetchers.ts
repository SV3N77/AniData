import {
  anilistFetch,
  GENRE_COLORS,
  getCurrentSeason,
  getRecentSeasons,
  mapMedia,
  MEDIA_FIELDS,
  pickTitle,
  type RawMedia,
} from "./anilist";
import type { AnimeItem, GenreItem, StatItem } from "./types";

export async function getTopAnime(perPage = 20): Promise<AnimeItem[]> {
  const data = await anilistFetch<{ Page: { media: RawMedia[] } }>(
    `query TopAnime {
      Page(page: 1, perPage: ${perPage}) {
        media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }`,
  );
  return data.Page.media.map(mapMedia);
}

export async function getSeasonalAnime(perPage = 6): Promise<AnimeItem[]> {
  const { season, year } = getCurrentSeason();
  const data = await anilistFetch<{ Page: { media: RawMedia[] } }>(
    `query Seasonal($season: MediaSeason, $year: Int) {
      Page(page: 1, perPage: ${perPage}) {
        media(
          type: ANIME
          season: $season
          seasonYear: $year
          sort: POPULARITY_DESC
          isAdult: false
        ) {
          ${MEDIA_FIELDS}
        }
      }
    }`,
    { season, year },
  );
  return data.Page.media.map(mapMedia);
}

export async function getTrendingSearches(perPage = 6): Promise<string[]> {
  const data = await anilistFetch<{
    Page: { media: { title: RawMedia["title"] }[] };
  }>(
    `query Trending {
      Page(page: 1, perPage: ${perPage}) {
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
          title { english romaji native }
        }
      }
    }`,
  );
  return data.Page.media.map((m) => pickTitle(m.title));
}

export async function getGenres(): Promise<GenreItem[]> {
  const data = await anilistFetch<{ GenreCollection: string[] }>(
    `query Genres { GenreCollection }`,
  );
  return (data.GenreCollection ?? [])
    .filter((g): g is string => Boolean(g))
    .map((name) => ({
      name,
      color: GENRE_COLORS[name] ?? "#6366f1",
    }));
}

export async function getStats(): Promise<StatItem[]> {
  const data = await anilistFetch<{
    anime: { pageInfo: { total: number } };
    manga: { pageInfo: { total: number } };
    characters: { pageInfo: { total: number } };
    studios: { pageInfo: { total: number } };
  }>(
    `query Stats {
      anime: Page(page: 1, perPage: 1) {
        media(type: ANIME) { id }
        pageInfo { total }
      }
      manga: Page(page: 1, perPage: 1) {
        media(type: MANGA) { id }
        pageInfo { total }
      }
      characters: Page(page: 1, perPage: 1) {
        characters { id }
        pageInfo { total }
      }
      studios: Page(page: 1, perPage: 1) {
        studios { id }
        pageInfo { total }
      }
    }`,
  );

  const fmt = (n: number) => n.toLocaleString("en-US");

  return [
    { value: fmt(data.anime?.pageInfo?.total ?? 0), label: "Anime" },
    { value: fmt(data.manga?.pageInfo?.total ?? 0), label: "Manga" },
    { value: fmt(data.characters?.pageInfo?.total ?? 0), label: "Characters" },
    { value: fmt(data.studios?.pageInfo?.total ?? 0), label: "Studios" },
  ];
}

export type HomeData = {
  topAnime: AnimeItem[];
  seasonalAnime: AnimeItem[];
  trending: string[];
  genres: GenreItem[];
  stats: StatItem[];
  seasons: string[];
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (err) {
    console.error("[anilist]", err);
    return fallback;
  }
}

export async function getHomeData(): Promise<HomeData> {
  const [topAnime, seasonalAnime, trending, genres, stats, seasons] =
    await Promise.all([
      safe(getTopAnime(20), [] as AnimeItem[]),
      safe(getSeasonalAnime(6), [] as AnimeItem[]),
      safe(getTrendingSearches(6), [] as string[]),
      safe(getGenres(), [] as GenreItem[]),
      safe(getStats(), [] as StatItem[]),
      getRecentSeasons(3),
    ]);
  return { topAnime, seasonalAnime, trending, genres, stats, seasons };
}
