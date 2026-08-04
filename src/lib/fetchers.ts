import {
  anilistFetch,
  getCurrentSeason,
  mapAiringSchedule,
  mapCharacterConnection,
  mapMedia,
  mapMediaDetail,
  mapManga,
  mapSearchMedia,
  mapStaffConnection,
  MEDIA_DETAIL_FIELDS,
  MEDIA_FIELDS,
  MANGA_FIELDS,
  SEARCH_FIELDS,
  pickTitle,
  type CharacterEdgeRaw,
  type RawAiringSchedule,
  type RawMedia,
  type RawMediaDetail,
  type RawManga,
  type RawSearchMedia,
  type Season,
  type StaffEdgeRaw,
} from "./anilist";
import { slugify } from "./slug";
import type {
  AnimeItem,
  CharacterPreview,
  MediaDetail,
  MangaItem,
  ScheduleItem,
  SearchResultItem,
  StatItem,
  StaffPreview,
} from "./types";

export async function getMedia(id: number): Promise<MediaDetail | null> {
  const data = await anilistFetch<{ Media: RawMediaDetail | null }>(
    `query MediaDetail($id: Int) {
      Media(id: $id) {
        ${MEDIA_DETAIL_FIELDS}
      }
    }`,
    { id },
  );
  if (!data.Media) return null;
  return mapMediaDetail(data.Media);
}

export async function getMediaBySlug(slug: string): Promise<MediaDetail | null> {
  const search = slug.replace(/-/g, " ").trim();
  if (!search) return null;
  const data = await anilistFetch<{ Page: { media: RawMediaDetail[] } }>(
    `query MediaBySlug($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, isAdult: false) {
          ${MEDIA_DETAIL_FIELDS}
        }
      }
    }`,
    { search },
  );
  const items = data.Page.media;
  if (!items.length) return null;
  const exact = items.find((m) => slugify(pickTitle(m.title)) === slug);
  return mapMediaDetail(exact ?? items[0]!);
}

export async function getMangaBySlug(slug: string): Promise<MediaDetail | null> {
  const search = slug.replace(/-/g, " ").trim();
  if (!search) return null;
  const data = await anilistFetch<{ Page: { media: RawMediaDetail[] } }>(
    `query MangaBySlug($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: MANGA, isAdult: false) {
          ${MEDIA_DETAIL_FIELDS}
        }
      }
    }`,
    { search },
  );
  const items = data.Page.media;
  if (!items.length) return null;
  const exact = items.find((m) => slugify(pickTitle(m.title)) === slug);
  return mapMediaDetail(exact ?? items[0]!);
}

export async function getMediaPeople(
  id: number,
  perPage = 25,
): Promise<{ characters: CharacterPreview[]; staff: StaffPreview[] }> {
  const data = await anilistFetch<{
    Media: {
      characters: { edges: CharacterEdgeRaw[] } | null;
      staff: { edges: StaffEdgeRaw[] } | null;
    } | null;
  }>(
    `query MediaPeople($id: Int) {
      Media(id: $id) {
        characters(page: 1, perPage: ${perPage}, sort: [FAVOURITES_DESC]) {
          edges {
            role
            voiceActors(language: JAPANESE) { id name { full } language image { large } }
            node { id name { full } image { large } }
          }
        }
        staff(page: 1, perPage: ${perPage}, sort: [ROLE]) {
          edges {
            role
            node { id name { full } image { large } }
          }
        }
      }
    }`,
    { id },
  );

  return {
    characters: mapCharacterConnection(data.Media?.characters ?? null),
    staff: mapStaffConnection(data.Media?.staff ?? null),
  };
}

export type MediaSortOption = "SCORE_DESC" | "POPULARITY_DESC";

export function parseGenres(
  v: string | string[] | null | undefined,
): string[] {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  return Array.from(
    new Set(
      arr
        .flatMap((s) => s.split(","))
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

export type AnimePageParams = {
  page?: number;
  perPage?: number;
  sort?: MediaSortOption;
  status?: string | null;
  format?: string | null;
  genres?: string[] | null;
  search?: string | null;
};

export type AnimePageInfo = {
  currentPage: number;
  hasNextPage: boolean;
  lastPage: number;
  total: number;
  perPage: number;
};

export type AnimePage = {
  anime: AnimeItem[];
  pageInfo: AnimePageInfo;
};

export async function getAnimePage(
  params: AnimePageParams,
): Promise<AnimePage> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.max(1, params.perPage ?? 50);
  const sort: MediaSortOption = params.sort ?? "SCORE_DESC";

  const variables: Record<string, unknown> = {
    page,
    perPage,
    sort: [sort],
  };
  if (params.status) variables.status = params.status;
  if (params.format) variables.format = params.format;
  if (params.genres && params.genres.length) variables.genres = params.genres;
  if (params.search?.trim()) variables.search = params.search.trim();

  const data = await anilistFetch<{
    Page: { pageInfo: AnimePageInfo; media: RawMedia[] };
  }>(
    `query AnimePage(
      $page: Int
      $perPage: Int
      $sort: [MediaSort]
      $status: MediaStatus
      $format: MediaFormat
      $genres: [String]
      $search: String
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          currentPage
          hasNextPage
          lastPage
          total
          perPage
        }
        media(
          type: ANIME
          sort: $sort
          status: $status
          format: $format
          genre_in: $genres
          search: $search
          isAdult: false
        ) {
          ${MEDIA_FIELDS}
        }
      }
    }`,
    variables,
  );

  return {
    anime: data.Page.media.map(mapMedia),
    pageInfo: data.Page.pageInfo,
  };
}

export async function getGenres(): Promise<string[]> {
  const data = await anilistFetch<{ GenreCollection: string[] | null }>(
    `query Genres { GenreCollection }`,
  );
  return (data.GenreCollection ?? []).filter((g) => g !== "Hentai");
}

export async function getTopManga(perPage = 20): Promise<MangaItem[]> {
  const data = await anilistFetch<{ Page: { media: RawManga[] } }>(
    `query TopManga {
      Page(page: 1, perPage: ${perPage}) {
        media(type: MANGA, sort: SCORE_DESC, isAdult: false) {
          ${MANGA_FIELDS}
        }
      }
    }`,
  );
  return data.Page.media.map(mapManga);
}

export type MangaPage = {
  manga: MangaItem[];
  pageInfo: AnimePageInfo;
};

export async function getMangaPage(
  params: AnimePageParams,
): Promise<MangaPage> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.max(1, params.perPage ?? 50);
  const sort: MediaSortOption = params.sort ?? "SCORE_DESC";

  const variables: Record<string, unknown> = {
    page,
    perPage,
    sort: [sort],
  };
  if (params.status) variables.status = params.status;
  if (params.format) variables.format = params.format;
  if (params.genres && params.genres.length) variables.genres = params.genres;
  if (params.search?.trim()) variables.search = params.search.trim();

  const data = await anilistFetch<{
    Page: { pageInfo: AnimePageInfo; media: RawManga[] };
  }>(
    `query MangaPage(
      $page: Int
      $perPage: Int
      $sort: [MediaSort]
      $status: MediaStatus
      $format: MediaFormat
      $genres: [String]
      $search: String
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          currentPage
          hasNextPage
          lastPage
          total
          perPage
        }
        media(
          type: MANGA
          sort: $sort
          status: $status
          format: $format
          genre_in: $genres
          search: $search
          isAdult: false
        ) {
          ${MANGA_FIELDS}
        }
      }
    }`,
    variables,
  );

  return {
    manga: data.Page.media.map(mapManga),
    pageInfo: data.Page.pageInfo,
  };
}

export type SeasonalAnimePageParams = AnimePageParams & {
  season: Season;
  year: number;
};

export async function getSeasonalAnimePage(
  params: SeasonalAnimePageParams,
): Promise<AnimePage> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.max(1, params.perPage ?? 24);
  const sort: MediaSortOption = params.sort ?? "POPULARITY_DESC";

  const variables: Record<string, unknown> = {
    page,
    perPage,
    sort: [sort],
    season: params.season,
    seasonYear: params.year,
  };
  if (params.status) variables.status = params.status;
  if (params.format) variables.format = params.format;
  if (params.genres && params.genres.length) variables.genres = params.genres;
  if (params.search?.trim()) variables.search = params.search.trim();

  const data = await anilistFetch<{
    Page: { pageInfo: AnimePageInfo; media: RawMedia[] };
  }>(
    `query SeasonalAnimePage(
      $page: Int
      $perPage: Int
      $sort: [MediaSort]
      $season: MediaSeason
      $seasonYear: Int
      $status: MediaStatus
      $format: MediaFormat
      $genres: [String]
      $search: String
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          currentPage
          hasNextPage
          lastPage
          total
          perPage
        }
        media(
          type: ANIME
          season: $season
          seasonYear: $seasonYear
          sort: $sort
          status: $status
          format: $format
          genre_in: $genres
          search: $search
          isAdult: false
        ) {
          ${MEDIA_FIELDS}
        }
      }
    }`,
    variables,
  );

  return {
    anime: data.Page.media.map(mapMedia),
    pageInfo: data.Page.pageInfo,
  };
}

export async function getHomeBatch(
  season: Season,
  year: number,
): Promise<{
  topAnime: AnimeItem[];
  trending: string[];
  stats: StatItem[];
  seasonalAnime: AnimeItem[];
}> {
  const data = await anilistFetch<{
    topAnime: { media: RawMedia[] };
    trending: { media: { title: RawMedia["title"] }[] };
    seasonal: { media: RawMedia[] };
    animeCount: { pageInfo: { total: number } };
    mangaCount: { pageInfo: { total: number } };
    charactersCount: { pageInfo: { total: number } };
    studiosCount: { pageInfo: { total: number } };
  }>(
    `query HomePage($season: MediaSeason, $seasonYear: Int) {
      topAnime: Page(page: 1, perPage: 20) {
        media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
      trending: Page(page: 1, perPage: 6) {
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
          title { english romaji native }
        }
      }
      seasonal: Page(page: 1, perPage: 6) {
        media(
          type: ANIME
          season: $season
          seasonYear: $seasonYear
          sort: POPULARITY_DESC
          isAdult: false
        ) {
          ${MEDIA_FIELDS}
        }
      }
      animeCount: Page(page: 1, perPage: 1) {
        media(type: ANIME) { id }
        pageInfo { total }
      }
      mangaCount: Page(page: 1, perPage: 1) {
        media(type: MANGA) { id }
        pageInfo { total }
      }
      charactersCount: Page(page: 1, perPage: 1) {
        characters { id }
        pageInfo { total }
      }
      studiosCount: Page(page: 1, perPage: 1) {
        studios { id }
        pageInfo { total }
      }
    }`,
    { season, seasonYear: year },
  );

  const fmt = (n: number) => n.toLocaleString("en-US");
  return {
    topAnime: data.topAnime.media.map(mapMedia),
    trending: data.trending.media.map((m) => pickTitle(m.title)),
    seasonalAnime: data.seasonal.media.map(mapMedia),
    stats: [
      { value: fmt(data.animeCount?.pageInfo?.total ?? 0), label: "Anime" },
      { value: fmt(data.mangaCount?.pageInfo?.total ?? 0), label: "Manga" },
      {
        value: fmt(data.charactersCount?.pageInfo?.total ?? 0),
        label: "Characters",
      },
      { value: fmt(data.studiosCount?.pageInfo?.total ?? 0), label: "Studios" },
    ],
  };
}

export async function searchMedia(
  query: string,
  perPage = 8,
): Promise<SearchResultItem[]> {
  const data = await anilistFetch<{ Page: { media: RawSearchMedia[] } }>(
    `query Search($search: String, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(search: $search, sort: POPULARITY_DESC, isAdult: false) {
          ${SEARCH_FIELDS}
        }
      }
    }`,
    { search: query, perPage },
  );
  return data.Page.media.map(mapSearchMedia);
}

export type SearchPageResults = {
  query: string;
  anime: AnimeItem[];
  manga: MangaItem[];
};

export async function searchAll(
  query: string,
  perPage = 12,
): Promise<SearchPageResults> {
  const [animePage, mangaPage] = await Promise.all([
    getAnimePage({ search: query, perPage, sort: "POPULARITY_DESC" }),
    getMangaPage({ search: query, perPage, sort: "POPULARITY_DESC" }),
  ]);
  return { query, anime: animePage.anime, manga: mangaPage.manga };
}

export async function getAiringSchedule(
  perPage = 50,
  days = 7,
): Promise<ScheduleItem[]> {
  const from = Math.floor(Date.now() / 1000);
  const to = from + days * 24 * 60 * 60;
  const MAX_PAGES = 20;

  const collected: RawAiringSchedule[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage && page <= MAX_PAGES) {
    const data = await anilistFetch<{
      Page: {
        airingSchedules: RawAiringSchedule[];
        pageInfo: { hasNextPage: boolean };
      };
    }>(
      `query Schedule($from: Int, $to: Int) {
        Page(page: ${page}, perPage: ${perPage}) {
          pageInfo { hasNextPage }
          airingSchedules(airingAt_greater: $from, airingAt_lesser: $to) {
            id
            airingAt
            timeUntilAiring
            episode
            mediaId
            media {
              id
              title { english romaji native }
              coverImage { large color }
              format
              isAdult
            }
          }
        }
      }`,
      { from, to },
    );
    collected.push(...data.Page.airingSchedules);
    hasNextPage = data.Page.pageInfo.hasNextPage;
    page += 1;
  }

  return collected
    .filter((s) => Boolean(s.media) && !s.media!.isAdult)
    .sort((a, b) => a.airingAt - b.airingAt)
    .map(mapAiringSchedule);
}

export type HomeData = {
  topAnime: AnimeItem[];
  trending: string[];
  stats: StatItem[];
  schedule: ScheduleItem[];
  seasonalAnime: AnimeItem[];
  seasonLabel: string;
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
  const { season, year } = getCurrentSeason();
  const seasonLabel = `${season.charAt(0)}${season.slice(1).toLowerCase()} ${year}`;

  const [batch, schedule] = await Promise.all([
    safe(
      getHomeBatch(season, year),
      {
        topAnime: [] as AnimeItem[],
        trending: [] as string[],
        stats: [] as StatItem[],
        seasonalAnime: [] as AnimeItem[],
      },
    ),
    safe(getAiringSchedule(), [] as ScheduleItem[]),
  ]);

  return { ...batch, schedule, seasonLabel };
}
