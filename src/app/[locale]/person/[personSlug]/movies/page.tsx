import PersonMovies from "@/components/PersonMovies";
import { Metadata } from "next";
import { extractIdFromSlug } from "@/lib/slug";

async function fetchPersonMovies(
  personSlug: string,
  locale: string,
  page: number = 1,
  limit: number = 10
) {
  const personId = extractIdFromSlug(personSlug);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/person/${personId}/movies?page=${page}&limit=${limit}&locale=${locale}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch person movies");
  return res.json();
}

async function fetchPerson(personSlug: string) {
  const personId = extractIdFromSlug(personSlug);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/person/${personId}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch person");
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ personSlug: string }>;
}): Promise<Metadata> {
  const { personSlug } = await params;

  try {
    const person = await fetchPerson(personSlug);
    const { name, biography } = person || {};

    return {
      title: `${name} - Movies`,
      description: biography
        ? `${biography.substring(0, 160)}...`
        : `Discover movies featuring ${name}`,
      openGraph: {
        title: `${name} - Movies`,
        images: [{ url: person.profile_url }],
        description: biography
          ? `${biography.substring(0, 160)}...`
          : `Discover movies featuring ${name}`,
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: `${name} - Movies`,
        images: [person.profile_url],
        description: biography
          ? `${biography.substring(0, 160)}...`
          : `Discover movies featuring ${name}`,
      },
    };
  } catch {
    return {
      title: "Person Movies",
      description: "Discover movies featuring this person.",
    };
  }
}

export default async function PersonMoviesPage({
  params,
  searchParams,
}: {
  params: Promise<{ personSlug: string; locale: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const awaitedSearchParams = await searchParams;
  const page = awaitedSearchParams?.page
    ? parseInt(awaitedSearchParams.page)
    : 1;
  const limit = 10;

  const { personSlug, locale } = await params;

  const [person, { items, pagination }] = await Promise.all([
    fetchPerson(personSlug),
    fetchPersonMovies(personSlug, locale, page, limit),
  ]);

  return (
    <PersonMovies
      person={person}
      initialItems={items}
      initialPage={page}
      initialPagination={pagination}
    />
  );
}
