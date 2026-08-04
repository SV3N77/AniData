export type AnimeStatus = "Airing" | "Finished" | "Upcoming";

export type MangaStatus = "Publishing" | "Finished" | "Upcoming" | "Hiatus" | "Cancelled";

export type AnimeItem = {
  id: number;
  title: string;
  cover: string;
  score: number;
  popularity: number;
  members: string;
  year: number | null;
  episodes: number | null;
  status: AnimeStatus;
  format: string;
  source: string;
  genres: string[];
  studio: string;
  synopsis: string;
  color: string;
};

export type MangaItem = {
  id: number;
  title: string;
  cover: string;
  score: number;
  popularity: number;
  members: string;
  year: number | null;
  volumes: number | null;
  chapters: number | null;
  status: MangaStatus;
  format: string;
  source: string;
  genres: string[];
  author: string;
  synopsis: string;
  color: string;
};

export type StatItem = { value: string; label: string };

export type ScheduleItem = {
  id: number;
  mediaId: number;
  title: string;
  cover: string;
  color: string;
  format: string;
  episode: number;
  airingAt: number;
  timeUntilAiring: number;
};

export type MediaType = "ANIME" | "MANGA";

export type NextAiring = {
  episode: number;
  airingAt: number;
  timeUntilAiring: number;
};

export type VoiceActor = {
  id: number;
  name: string;
  image: string;
  language: string;
};

export type CharacterPreview = {
  id: number;
  name: string;
  image: string;
  role: string;
  voiceActor: VoiceActor | null;
};

export type StaffPreview = {
  id: number;
  name: string;
  image: string;
  role: string;
};

export type RelationPreview = {
  id: number;
  type: MediaType;
  relation: string;
  format: string;
  title: string;
  cover: string;
  color: string;
  year: number | null;
};

export type MediaDetail = {
  id: number;
  type: MediaType;
  title: string;
  romajiTitle: string | null;
  nativeTitle: string | null;
  cover: string;
  banner: string | null;
  score: number;
  meanScore: number;
  popularity: number;
  members: string;
  favourites: string;
  year: number | null;
  season: string | null;
  episodes: number | null;
  duration: number | null;
  chapters: number | null;
  volumes: number | null;
  status: AnimeStatus;
  format: string;
  source: string;
  genres: string[];
  studio: string;
  studios: string[];
  synopsis: string;
  color: string;
  siteUrl: string | null;
  malId: number | null;
  trailer: { id: string; site: string } | null;
  nextAiring: NextAiring | null;
  aired: string;
  relations: RelationPreview[];
};
