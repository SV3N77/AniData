export type AnimeStatus = "Airing" | "Finished" | "Upcoming";

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
