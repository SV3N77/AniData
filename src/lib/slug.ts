export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function buildMediaSlug(id: number, title: string): string {
  return `${id}-${slugify(title)}`;
}

export function parseMediaSlug(slug: string): number | null {
  const m = slug.match(/^(\d+)(?:-|$)/);
  return m ? Number(m[1]) : null;
}
