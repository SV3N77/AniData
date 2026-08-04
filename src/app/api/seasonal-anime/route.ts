import { NextResponse } from "next/server";
import { getSeasonalAnimePage, parseGenres, type MediaSortOption } from "@/lib/fetchers";
import { getCurrentSeason, type Season } from "@/lib/anilist";

export const dynamic = "force-dynamic";

const PER_PAGE = 30;
const SEASONS: Season[] = ["WINTER", "SPRING", "SUMMER", "FALL"];

function parseSeason(value: string | null): Season {
  return (SEASONS as string[]).includes(value ?? "")
    ? (value as Season)
    : getCurrentSeason().season;
}

function parseYear(value: string | null): number {
  const fallback = getCurrentSeason().year;
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 1900 && n < 2100 ? n : fallback;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const season = parseSeason(searchParams.get("season"));
  const year = parseYear(searchParams.get("year"));
  const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const sortParam = searchParams.get("sort");
  const sort: MediaSortOption =
    sortParam === "SCORE_DESC" ? "SCORE_DESC" : "POPULARITY_DESC";
  const status = searchParams.get("status");
  const genres = parseGenres(searchParams.getAll("genre"));
  const format = searchParams.get("format");
  const search = searchParams.get("search");

  try {
    const result = await getSeasonalAnimePage({
      page,
      perPage: PER_PAGE,
      sort,
      status,
      genres,
      format,
      search,
      season,
      year,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[anilist]", err);
    return NextResponse.json(
      {
        anime: [],
        pageInfo: {
          currentPage: page,
          hasNextPage: false,
          lastPage: 1,
          total: 0,
          perPage: PER_PAGE,
        },
      },
      { status: 200 },
    );
  }
}
