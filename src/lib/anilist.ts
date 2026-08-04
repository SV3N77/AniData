import type { AnimeItem, AnimeStatus, CharacterPreview, MangaItem, MangaStatus, MediaDetail, MediaType, RelationPreview, ScheduleItem, StaffPreview } from "./types";

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

// App-level response cache. Next.js ignores `next.revalidate` in dev, so without
// this every page load re-hits AniList and blows past the 90 req/min limit (-> 429 -> 404).
const CACHE_TTL_MS = 60 * 60 * 1000;
const responseCache = new Map<string, { value: unknown; ts: number }>();
const inflight = new Map<string, Promise<unknown>>();

async function rawFetch<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt++) {
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

    if (res.status === 429) {
      // Retry once after backoff before giving up.
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      throw new AniListError("AniList rate limit exceeded (429)");
    }

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
  throw new AniListError("AniList request failed");
}

export async function anilistFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const key = `${query}::${JSON.stringify(variables)}`;

  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.value as T;
  }

  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = rawFetch<T>(query, variables)
    .then((data) => {
      responseCache.set(key, { value: data, ts: Date.now() });
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise as Promise<T>;
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
  isAdult?: boolean | null;
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
    color: m?.coverImage?.color ?? "#d24a2c",
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
    color: m.coverImage?.color ?? "#d24a2c",
  };
}

export const MANGA_FIELDS = `
  id
  title { english romaji native }
  coverImage { large color }
  averageScore
  popularity
  chapters
  volumes
  status
  format
  source
  genres
  startDate { year }
  staff(sort: ROLE) { edges { node { name { full } } } }
  description
`;

export type RawManga = {
  id: number;
  title: { english: string | null; romaji: string | null; native: string | null };
  coverImage: { large: string | null; color: string | null } | null;
  averageScore: number | null;
  popularity: number | null;
  chapters: number | null;
  volumes: number | null;
  status: string | null;
  format: string | null;
  source: string | null;
  genres: string[] | null;
  startDate: { year: number | null } | null;
  staff: { edges: { node: { name: { full: string | null } | null } | null }[] | null } | null;
  description: string | null;
};

function mapMangaStatus(status: string | null): MangaStatus {
  switch (status) {
    case "RELEASING":
      return "Publishing";
    case "NOT_YET_RELEASED":
      return "Upcoming";
    case "HIATUS":
      return "Hiatus";
    case "CANCELLED":
      return "Cancelled";
    case "FINISHED":
    default:
      return "Finished";
  }
}

export function mapManga(m: RawManga): MangaItem {
  return {
    id: m.id,
    title: pickTitle(m.title),
    cover: m.coverImage?.large ?? "",
    score: m.averageScore ? m.averageScore / 10 : 0,
    popularity: m.popularity ?? 0,
    members: formatCount(m.popularity ?? 0),
    year: m.startDate?.year ?? null,
    volumes: m.volumes ?? null,
    chapters: m.chapters ?? null,
    status: mapMangaStatus(m.status),
    format: m.format ?? "MANGA",
    source: m.source ?? "Original",
    genres: m.genres ?? [],
    author: m.staff?.edges?.[0]?.node?.name?.full ?? "Unknown",
    synopsis: stripHtml(m.description),
    color: m.coverImage?.color ?? "#d24a2c",
  };
}

export const MEDIA_DETAIL_FIELDS = `
  id
  idMal
  type
  title { english romaji native }
  coverImage { large extraLarge color }
  bannerImage
  averageScore
  meanScore
  popularity
  favourites
  episodes
  duration
  chapters
  volumes
  status
  format
  source
  season
  seasonYear
  genres
  startDate { year month day }
  endDate { year month day }
  studios(isMain: true) { nodes { name } }
  description
  siteUrl
  trailer { id site }
  nextAiringEpisode { airingAt timeUntilAiring episode }
  relations {
    edges {
      relationType(version: 2)
      node {
        id
        type
        format
        title { english romaji native }
        coverImage { large color }
        startDate { year }
      }
    }
  }
`;

export type RawMediaDetail = {
  id: number;
  idMal: number | null;
  type: "ANIME" | "MANGA" | null;
  title: { english: string | null; romaji: string | null; native: string | null };
  coverImage: { large: string | null; extraLarge: string | null; color: string | null } | null;
  bannerImage: string | null;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  favourites: number | null;
  episodes: number | null;
  duration: number | null;
  chapters: number | null;
  volumes: number | null;
  status: string | null;
  format: string | null;
  source: string | null;
  season: string | null;
  seasonYear: number | null;
  genres: string[] | null;
  startDate: { year: number | null; month: number | null; day: number | null } | null;
  endDate: { year: number | null; month: number | null; day: number | null } | null;
  studios: { nodes: { name: string }[] | null } | null;
  description: string | null;
  siteUrl: string | null;
  trailer: { id: string; site: string } | null;
  nextAiringEpisode: { airingAt: number; timeUntilAiring: number; episode: number } | null;
  relations: {
    edges: {
      relationType: string | null;
      node: {
        id: number;
        type: "ANIME" | "MANGA" | null;
        format: string | null;
        title: { english: string | null; romaji: string | null; native: string | null };
        coverImage: { large: string | null; color: string | null } | null;
        startDate: { year: number | null } | null;
      } | null;
    }[] | null;
  } | null;
};

export function mapMediaDetail(m: RawMediaDetail): MediaDetail {
  const studioNodes = m.studios?.nodes ?? [];
  return {
    id: m.id,
    type: (m.type ?? "ANIME") as MediaDetail["type"],
    title: pickTitle(m.title),
    romajiTitle: m.title.romaji ?? null,
    nativeTitle: m.title.native ?? null,
    cover: m.coverImage?.extraLarge || m.coverImage?.large || "",
    banner: m.bannerImage ?? null,
    score: m.averageScore ? m.averageScore / 10 : 0,
    meanScore: m.meanScore ? m.meanScore / 10 : 0,
    popularity: m.popularity ?? 0,
    members: formatCount(m.popularity ?? 0),
    favourites: formatCount(m.favourites ?? 0),
    year: m.seasonYear ?? m.startDate?.year ?? null,
    season: m.season
      ? `${m.season.charAt(0)}${m.season.slice(1).toLowerCase()}`
      : null,
    episodes: m.episodes ?? null,
    duration: m.duration ?? null,
    chapters: m.chapters ?? null,
    volumes: m.volumes ?? null,
    status: mapStatus(m.status),
    format: m.format ?? "TV",
    source: prettifySource(m.source),
    genres: m.genres ?? [],
    studio: studioNodes[0]?.name ?? "Unknown",
    studios: studioNodes.map((s) => s.name),
    synopsis: stripHtml(m.description),
    color: m.coverImage?.color ?? "#d24a2c",
    siteUrl: m.siteUrl ?? null,
    malId: m.idMal ?? null,
    trailer: m.trailer?.id ? m.trailer : null,
    nextAiring: m.nextAiringEpisode ?? null,
    aired: formatAiredRange(m.startDate, m.endDate),
    relations: (m.relations?.edges ?? [])
      .filter((e) => Boolean(e?.node))
      .map<RelationPreview>((e) => ({
        id: e!.node!.id,
        type: (e!.node!.type ?? "ANIME") as MediaType,
        relation: prettifyRelation(e!.relationType),
        format: e!.node!.format ?? "",
        title: pickTitle(e!.node!.title),
        cover: e!.node!.coverImage?.large ?? "",
        color: e!.node!.coverImage?.color ?? "#d24a2c",
        year: e!.node!.startDate?.year ?? null,
      })),
  };
}

function prettifyRole(role: string | null): string {
  if (!role) return "";
  switch (role) {
    case "MAIN":
      return "Main";
    case "SUPPORTING":
      return "Supporting";
    default:
      return role.charAt(0) + role.slice(1).toLowerCase();
  }
}

function prettifyLanguage(lang: string | null): string {
  if (!lang) return "";
  return lang.charAt(0) + lang.slice(1).toLowerCase();
}

export type CharacterEdgeRaw = {
  role: string | null;
  voiceActors: {
    id: number;
    name: { full: string | null };
    language: string | null;
    image: { large: string | null } | null;
  }[] | null;
  node: {
    id: number;
    name: { full: string | null };
    image: { large: string | null } | null;
  } | null;
};

export type CharacterConnection = {
  edges: CharacterEdgeRaw[] | null;
} | null;

export function mapCharacterConnection(conn: CharacterConnection): CharacterPreview[] {
  return (conn?.edges ?? [])
    .filter((e) => Boolean(e?.node))
    .map<CharacterPreview>((e) => {
      const vas = e!.voiceActors ?? [];
      const vaRaw = vas[0] ?? null;
      return {
        id: e!.node!.id,
        name: e!.node!.name.full ?? "Unknown",
        image: e!.node!.image?.large ?? "",
        role: prettifyRole(e!.role),
        voiceActor: vaRaw
          ? {
              id: vaRaw.id,
              name: vaRaw.name.full ?? "Unknown",
              image: vaRaw.image?.large ?? "",
              language: prettifyLanguage(vaRaw.language),
            }
          : null,
      };
    });
}

function prettifyRelation(rel: string | null): string {
  if (!rel) return "Relation";
  return rel
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export type StaffEdgeRaw = {
  role: string | null;
  node: {
    id: number;
    name: { full: string | null };
    image: { large: string | null } | null;
  } | null;
};

export type StaffConnection = { edges: StaffEdgeRaw[] | null } | null;

export function mapStaffConnection(conn: StaffConnection): StaffPreview[] {
  const byId = new Map<number, StaffPreview>();
  for (const e of conn?.edges ?? []) {
    if (!e?.node) continue;
    const id = e.node.id;
    const role = e.role ?? "";
    const existing = byId.get(id);
    if (existing) {
      if (role && !existing.role.split(", ").includes(role)) {
        existing.role = existing.role ? `${existing.role}, ${role}` : role;
      }
    } else {
      byId.set(id, {
        id,
        name: e.node.name.full ?? "Unknown",
        image: e.node.image?.large ?? "",
        role,
      });
    }
  }
  return [...byId.values()];
}

function formatAiredDate(
  d: { year: number | null; month: number | null; day: number | null } | null,
): string {
  if (!d || !d.year) return "";
  const date = new Date(d.year, (d.month ?? 1) - 1, d.day ?? 1);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAiredRange(
  start: { year: number | null; month: number | null; day: number | null } | null,
  end: { year: number | null; month: number | null; day: number | null } | null,
): string {
  const s = formatAiredDate(start);
  const e = formatAiredDate(end);
  if (!s && !e) return "Unknown";
  if (!e) return s;
  if (!s) return e;
  if (s === e) return s;
  return `${s} — ${e}`;
}

function prettifySource(source: string | null): string {
  if (!source) return "Original";
  return source
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

export type SeasonOption = { season: Season; year: number; label: string };

export function getSeasonOptions(back = 12, forward = 4): SeasonOption[] {
  const { season, year } = getCurrentSeason();
  const order: Season[] = ["WINTER", "SPRING", "SUMMER", "FALL"];
  const startIdx = order.indexOf(season);

  const options: SeasonOption[] = [];
  for (let offset = -back; offset <= forward; offset++) {
    let idx = startIdx + offset;
    let y = year;
    while (idx < 0) {
      idx += 4;
      y -= 1;
    }
    while (idx >= 4) {
      idx -= 4;
      y += 1;
    }
    const s = order[idx];
    options.push({
      season: s,
      year: y,
      label: `${s.charAt(0)}${s.slice(1).toLowerCase()} ${y}`,
    });
  }
  return options;
}
