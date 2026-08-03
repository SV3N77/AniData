export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function buildAnimeSlug(id: number, title: string): string {
  const s = slugify(title);
  return s ? `${id}-${s}` : `${id}`;
}

export function parseAnimeId(slug: string): number {
  const m = /^(\d+)/.exec(slug);
  return m ? parseInt(m[1], 10) : NaN;
}
