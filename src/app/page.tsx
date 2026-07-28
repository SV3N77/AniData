import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchHero from "@/components/SearchHero";
import RankedTable from "@/components/RankedTable";
import ScheduleSection from "@/components/ScheduleSection";
import { getHomeData } from "@/lib/fetchers";

export default async function Home() {
  const { topAnime, trending, stats, schedule } = await getHomeData();

  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        <SearchHero trending={trending} stats={stats} />
        <RankedTable anime={topAnime} />
        <ScheduleSection schedule={schedule} />
      </main>
      <Footer />
    </>
  );
}
