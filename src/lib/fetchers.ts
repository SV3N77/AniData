import {
  anilistFetch,
  getCurrentSeason,
  mapAiringSchedule,
  mapCharacterConnection,
  mapMedia,
  mapMediaDetail,
  mapStaffConnection,
  MEDIA_DETAIL_FIELDS,
  MEDIA_FIELDS,
  pickTitle,
  type CharacterEdgeRaw,
  type RawAiringSchedule,
  type RawMedia,
  type RawMediaDetail,
  type Season,
  type StaffEdgeRaw,
} from "./anilist";
import type {
  AnimeItem,
  CharacterPreview,
  MediaDetail,
  ScheduleItem,
  StatItem,
  StaffPreview,
} from "./types";

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

export async function getMediaCharacters(
  id: number,
  perPage = 25,
): Promise<CharacterPreview[]> {
  const MAX_PAGES = 20;
  const collected: CharacterEdgeRaw[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= MAX_PAGES) {
    const data = await anilistFetch<{
      Media: {
        characters: {
          pageInfo: { hasNextPage: boolean };
          edges: CharacterEdgeRaw[];
        } | null;
      } | null;
    }>(
      `query MediaCharacters($id: Int, $page: Int) {
        Media(id: $id) {
          characters(page: $page, perPage: ${perPage}, sort: [FAVOURITES_DESC]) {
            pageInfo { hasNextPage }
            edges {
              role
              voiceActors(language: JAPANESE) { id name { full } language image { large } }
              node { id name { full } image { large } }
            }
          }
        }
      }`,
      { id, page },
    );
    const conn = data.Media?.characters;
    if (!conn) break;
    collected.push(...(conn.edges ?? []));
    hasNext = conn.pageInfo.hasNextPage;
    page += 1;
  }

  return mapCharacterConnection({ edges: collected });
}

export async function getMediaStaff(
  id: number,
  perPage = 25,
): Promise<StaffPreview[]> {
  const MAX_PAGES = 20;
  const collected: StaffEdgeRaw[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext && page <= MAX_PAGES) {
    const data = await anilistFetch<{
      Media: {
        staff: {
          pageInfo: { hasNextPage: boolean };
          edges: StaffEdgeRaw[];
        } | null;
      } | null;
    }>(
      `query MediaStaff($id: Int, $page: Int) {
        Media(id: $id) {
          staff(page: $page, perPage: ${perPage}, sort: [ROLE]) {
            pageInfo { hasNextPage }
            edges {
              role
              node { id name { full } image { large } }
            }
          }
        }
      }`,
      { id, page },
    );
    const conn = data.Media?.staff;
    if (!conn) break;
    collected.push(...(conn.edges ?? []));
    hasNext = conn.pageInfo.hasNextPage;
    page += 1;
  }

  return mapStaffConnection({ edges: collected });
}

export type MediaSortOption = "SCORE_DESC" | "POPULARITY_DESC";

export type AnimePageParams = {
  page?: number;
  perPage?: number;
  sort?: MediaSortOption;
  status?: string | null;
  format?: string | null;
  genre?: string | null;
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
  if (params.genre) variables.genre = params.genre;
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
      $genre: String
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
          genre: $genre
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
  return data.GenreCollection ?? [];
}

export type SeasonalPageParams = AnimePageParams & {
  season: Season;
  year: number;
};

export async function getSeasonalPage(
  params: SeasonalPageParams,
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
  if (params.genre) variables.genre = params.genre;
  if (params.search?.trim()) variables.search = params.search.trim();

  const data = await anilistFetch<{
    Page: { pageInfo: AnimePageInfo; media: RawMedia[] };
  }>(
    `query SeasonalPage(
      $page: Int
      $perPage: Int
      $sort: [MediaSort]
      $season: MediaSeason
      $seasonYear: Int
      $status: MediaStatus
      $format: MediaFormat
      $genre: String
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
          genre: $genre
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
  trending: string[];
  stats: StatItem[];
  schedule: ScheduleItem[];
  seasonal: AnimeItem[];
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

  const [topAnime, trending, stats, schedule, seasonal] = await Promise.all([
    safe(getTopAnime(20), [] as AnimeItem[]),
    safe(getTrendingSearches(6), [] as string[]),
    safe(getStats(), [] as StatItem[]),
    safe(getAiringSchedule(), [] as ScheduleItem[]),
    safe(
      getSeasonalPage({ season, year, perPage: 6 }).then((r) => r.anime),
      [] as AnimeItem[],
    ),
  ]);
  return { topAnime, trending, stats, schedule, seasonal, seasonLabel };
}
