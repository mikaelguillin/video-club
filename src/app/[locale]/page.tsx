import PersonsList from "@/components/PersonsList";
import { Tagline } from "@/components/Tagline";

async function fetchPersons(page: number = 1, limit: number = 10) {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/api/persons?page=${page}&limit=${limit}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch persons");
  return res.json();
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const awaitedSearchParams = await searchParams;
  const page = awaitedSearchParams?.page
    ? parseInt(awaitedSearchParams.page)
    : 1;
  const limit = 10;
  const { items, pagination } = await fetchPersons(page, limit);

  return (
    <div className="container">
      <Tagline />
      <PersonsList
        initialItems={items}
        initialPage={page}
        initialPagination={pagination}
      />
    </div>
  );
}
