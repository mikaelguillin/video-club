import PersonMovies from "@/components/PersonMovies";

async function fetchPersonMovies(
  personId: string,
  page: number = 1,
  limit: number = 10
) {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/person/${personId}/movies?page=${page}&limit=${limit}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch person movies");
  return res.json();
}

async function fetchPerson(personId: string) {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/api/person/${personId}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch person");
  return res.json();
}

export default async function PersonMoviesPage({
  params,
  searchParams,
}: {
  params: Promise<{ personId: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const awaitedSearchParams = await searchParams;
  const page = awaitedSearchParams?.page ? parseInt(awaitedSearchParams.page) : 1;
  const limit = 10;

  const { personId } = await params;

  const [person, { items, pagination }] = await Promise.all([
    fetchPerson(personId),
    fetchPersonMovies(personId, page, limit),
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
