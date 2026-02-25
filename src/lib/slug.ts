const HEX_REGEX = /^[a-f0-9]{24}$/;

/**
 * Convert a person's name to a URL-safe slug (lowercase, hyphens, no accents).
 */
function nameToSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "person";
}

/**
 * Build a person slug for URLs: "brad-pitt-507f1f77bcf86cd799439011"
 */
export function personToSlug(person: {
  _id: string | { toString(): string };
  name?: string;
}): string {
  const id = String(person._id);
  const slug = nameToSlug(person.name || "");
  return slug ? `${slug}-${id}` : id;
}

/**
 * Build a movie slug for URLs: "pulp-fiction-507f1f77bcf86cd799439011"
 */
export function movieToSlug(
  movie: {
    _id: string | { toString(): string };
    translations?: Record<string, { title?: string }>;
  },
  locale: string = "en"
): string {
  const id = String(movie._id);
  const title =
    movie.translations?.[locale]?.title ??
    movie.translations?.en?.title ??
    Object.values(movie.translations ?? {}).find((t) => t?.title)?.title ??
    "";
  const slug = nameToSlug(title || "movie");
  return slug ? `${slug}-${id}` : id;
}

/**
 * Extract MongoDB ObjectId from a slug (person or movie).
 * Accepts: "brad-pitt-507f1f77bcf86cd799439011" or plain "507f1f77bcf86cd799439011"
 */
export function extractIdFromSlug(slug: string): string {
  const s = slug.trim();
  if (HEX_REGEX.test(s)) {
    return s;
  }
  const parts = s.split("-");
  const lastPart = parts[parts.length - 1];
  if (lastPart && HEX_REGEX.test(lastPart)) {
    return lastPart;
  }
  return s;
}
