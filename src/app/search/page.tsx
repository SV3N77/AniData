import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchResults from "@/components/SearchResults";
import { searchAll } from "@/lib/fetchers";
import type { AnimeItem, MangaItem } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  return {
    title: query ? `${query} — Search — AniData` : "Search — AniData",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  let anime: AnimeItem[] = [];
  let manga: MangaItem[] = [];

  if (query.length >= 3) {
    try {
      const results = await searchAll(query, 12);
      anime = results.anime;
      manga = results.manga;
    } catch (err) {
      console.error("[search]", err);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        <SearchResults query={query} anime={anime} manga={manga} />
      </main>
      <Footer />
    </>
  );
}
