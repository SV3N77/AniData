import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchHero from "@/components/SearchHero";
import RankedTable from "@/components/RankedTable";
import SeasonalSection from "@/components/SeasonalSection";
import GenreGrid from "@/components/GenreGrid";
import { getHomeData } from "@/lib/fetchers";

export default async function Home() {
  const { topAnime, seasonalAnime, trending, genres, stats, seasons } =
    await getHomeData();

  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        <SearchHero trending={trending} stats={stats} />
        <RankedTable anime={topAnime} />
        <SeasonalSection anime={seasonalAnime} seasons={seasons} />
        <GenreGrid genres={genres} />
      </main>
      <Footer />
    </>
  );
}
