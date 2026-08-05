import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ExplorerSkeleton } from "@/components/CardSkeleton";

export default function Loading() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        <ExplorerSkeleton variant="table" count={12} />
      </main>
      <Footer />
    </>
  );
}
