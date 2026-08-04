import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MediaDetailLayout from "@/components/MediaDetailLayout";
import { getMedia, getMangaBySlug, getMediaCharacters, getMediaStaff } from "@/lib/fetchers";
import { buildMediaSlug, parseMediaSlug } from "@/lib/slug";
import type { MediaDetail } from "@/lib/types";

export const revalidate = 3600;

async function resolveMedia(
  slug: string,
): Promise<{ media: MediaDetail | null; legacy: boolean }> {
  const id = parseMediaSlug(slug);
  if (id !== null) {
    try {
      return { media: await getMedia(id), legacy: false };
    } catch (err) {
      console.error("[anilist]", err);
      return { media: null, legacy: false };
    }
  }
  // Legacy title-only slug fallback
  try {
    return { media: await getMangaBySlug(slug), legacy: true };
  } catch (err) {
    console.error("[anilist]", err);
    return { media: null, legacy: true };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { media } = await resolveMedia(slug);
  if (!media) return { title: "Not found — AniData" };
  return {
    title: `${media.title} — AniData`,
    description: media.synopsis.slice(0, 160) || undefined,
  };
}

export default async function MangaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { media, legacy } = await resolveMedia(slug);
  if (!media) notFound();

  // Cross-type: an anime id on the manga route -> redirect to anime
  if (media.type === "ANIME") {
    redirect(`/anime/${buildMediaSlug(media.id, media.title)}`);
  }
  // Canonicalize legacy title-only URLs to the new id-based URL
  if (legacy) {
    redirect(`/manga/${buildMediaSlug(media.id, media.title)}`);
  }

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
