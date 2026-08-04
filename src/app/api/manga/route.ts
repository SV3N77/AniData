import { NextResponse } from "next/server";
import { getMangaPage, type MediaSortOption } from "@/lib/fetchers";

export const dynamic = "force-dynamic";

const PER_PAGE = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const sortParam = searchParams.get("sort");
  const sort: MediaSortOption =
    sortParam === "SCORE_DESC" ? "SCORE_DESC" : "POPULARITY_DESC";
  const status = searchParams.get("status");
  const genre = searchParams.get("genre");
  const format = searchParams.get("format");
  const search = searchParams.get("search");

  try {
    const result = await getMangaPage({
      page,
      perPage: PER_PAGE,
      sort,
      status,
      genre,
      format,
      search,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[anilist]", err);
    return NextResponse.json(
      {
        manga: [],
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
