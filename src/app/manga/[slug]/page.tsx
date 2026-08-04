import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MediaDetailLayout from "@/components/MediaDetailLayout";
import { getMangaBySlug, getMediaCharacters, getMediaStaff } from "@/lib/fetchers";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const media = await getMangaBySlug(slug);
    if (!media) return { title: "Not found — AniData" };
    return {
      title: `${media.title} — AniData`,
      description: media.synopsis.slice(0, 160) || undefined,
    };
  } catch {
    return { title: "Not found — AniData" };
  }
}

export default async function MangaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let media: Awaited<ReturnType<typeof getMangaBySlug>> = null;
  try {
    media = await getMangaBySlug(slug);
  } catch (err) {
    console.error("[anilist]", err);
  }
  if (!media) notFound();

  const mediaId = media.id;

  let characters: Awaited<ReturnType<typeof getMediaCharacters>> = [];
  try {
    characters = await getMediaCharacters(mediaId);
  } catch (err) {
    console.error("[anilist]", err);
  }

  let staff: Awaited<ReturnType<typeof getMediaStaff>> = [];
  try {
    staff = await getMediaStaff(mediaId);
  } catch (err) {
    console.error("[anilist]", err);
  }

  return (
    <>
      <Header />
      <MediaDetailLayout media={media} characters={characters} staff={staff} />
      <Footer />
    </>
  );
}
