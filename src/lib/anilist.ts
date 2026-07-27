import type { AnimeItem, AnimeStatus, ScheduleItem } from "./types";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export class AniListError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AniListError";
  }
}

export async function anilistFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "AniData/0.1",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new AniListError(`AniList request failed: ${res.status}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new AniListError(json.errors[0]?.message ?? "GraphQL error");
  }

  if (!json.data) {
    throw new AniListError("AniList returned no data");
  }

  return json.data;
}

export const MEDIA_FIELDS = `
  id
  title { english romaji native }
  coverImage { large color }
  averageScore
  popularity
  episodes
  status
  format
  source
  genres
  startDate { year }
  studios(isMain: true) { nodes { name } }
  description
`;

export type RawMedia = {
  id: number;
  title: { english: string | null; romaji: string | null; native: string | null };
  coverImage: { large: string | null; color: string | null };
  averageScore: number | null;
  popularity: number | null;
  episodes: number | null;
  status: string | null;
  format: string | null;
  source: string | null;
  genres: string[] | null;
  startDate: { year: number | null } | null;
  studios: { nodes: { name: string }[] | null } | null;
  description: string | null;
};

export function pickTitle(t: RawMedia["title"]): string {
  return t.english ?? t.romaji ?? t.native ?? "Untitled";
}

export type RawAiringSchedule = {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  mediaId: number;
  media: RawMedia | null;
};

export function mapAiringSchedule(s: RawAiringSchedule): ScheduleItem {
  const m = s.media;
  return {
    id: s.id,
    mediaId: s.mediaId,
    title: m ? pickTitle(m.title) : "Unknown",
    cover: m?.coverImage?.large ?? "",
    color: m?.coverImage?.color ?? "#a855f7",
    format: m?.format ?? "TV",
    episode: s.episode,
    airingAt: s.airingAt,
    timeUntilAiring: s.timeUntilAiring,
  };
}

function mapStatus(status: string | null): AnimeStatus {
  switch (status) {
    case "RELEASING":
      return "Airing";
    case "NOT_YET_RELEASED":
      return "Upcoming";
    case "FINISHED":
    default:
      return "Finished";
  }
}

function formatCount(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(n);
}

function stripHtml(s: string | null): string {
  if (!s) return "";
  return s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapMedia(m: RawMedia): AnimeItem {
  return {
    id: m.id,
    title: pickTitle(m.title),
    cover: m.coverImage?.large ?? "",
    score: m.averageScore ? m.averageScore / 10 : 0,
    popularity: m.popularity ?? 0,
    members: formatCount(m.popularity ?? 0),
    year: m.startDate?.year ?? null,
    episodes: m.episodes ?? null,
    status: mapStatus(m.status),
    format: m.format ?? "TV",
    source: m.source ?? "Original",
    genres: m.genres ?? [],
    studio: m.studios?.nodes?.[0]?.name ?? "Unknown",
    synopsis: stripHtml(m.description),
    color: m.coverImage?.color ?? "#a855f7",
  };
}

export type Season = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export function getCurrentSeason(): { season: Season; year: number } {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  let season: Season;
  if (month <= 2) season = "WINTER";
  else if (month <= 5) season = "SPRING";
  else if (month <= 8) season = "SUMMER";
  else season = "FALL";
  return { season, year };
}

export function getRecentSeasons(count = 3): string[] {
  const { season, year } = getCurrentSeason();
  const order: Season[] = ["WINTER", "SPRING", "SUMMER", "FALL"];
  let idx = order.indexOf(season);
  let y = year;
  const labels: { season: Season; year: number }[] = [];
  for (let i = 0; i < count; i++) {
    labels.push({ season: order[idx], year: y });
    idx -= 1;
    if (idx < 0) {
      idx = order.length - 1;
      y -= 1;
    }
  }
  return labels.map(
    (l) => `${l.season.charAt(0)}${l.season.slice(1).toLowerCase()} ${l.year}`,
  );
}
