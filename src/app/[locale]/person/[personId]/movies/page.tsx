import PersonMovies from "@/components/PersonMovies";
import { Metadata } from "next";

async function fetchPersonMovies(
  personId: string,
  locale: string,
  page: number = 1,
  limit: number = 10
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/person/${personId}/movies?page=${page}&limit=${limit}&locale=${locale}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch person movies");
  return res.json();
}

async function fetchPerson(personId: string) {
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
  params: Promise<{ personId: string; }>;
}): Promise<Metadata> {
  const { personId } = await params;

  try {
    const person = await fetchPerson(personId);
    const { name, biography } = person || {};

    return {
      title: `${name} - Movies`,
      description: biography
        ? `${biography.substring(0, 160)}...`
        : `Discover movies featuring ${name}`,
      openGraph: {
        title: `${name} - Movies`,
        description: biography
          ? `${biography.substring(0, 160)}...`
          : `Discover movies featuring ${name}`,
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: `${name} - Movies`,
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
  params: Promise<{ personId: string; locale: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const awaitedSearchParams = await searchParams;
  const page = awaitedSearchParams?.page
    ? parseInt(awaitedSearchParams.page)
    : 1;
  const limit = 10;

  const { personId, locale } = await params;

  const [person, { items, pagination }] = await Promise.all([
    fetchPerson(personId),
    fetchPersonMovies(personId, locale, page, limit),
  ]);

  return (
    <PersonMovies
      personId={personId}
      person={person}
      initialItems={items}
      initialPage={page}
      initialPagination={pagination}
    />
  );
}
