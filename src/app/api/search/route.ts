import { NextResponse } from "next/server";
import { searchMedia } from "@/lib/fetchers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchMedia(q, 8);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
