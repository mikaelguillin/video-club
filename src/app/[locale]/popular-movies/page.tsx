import PopularMovies from "@/components/PopularMovies";
import { Metadata } from "next";

async function fetchPopularMovies(locale: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/popular-movies?locale=${locale}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch popular movies");
  return res.json();
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Popular Movies",
    description:
      "Movies picked by the most celebrities in Vidéo Club.",
  };
}

export default async function PopularMoviesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { items, pagination } = await fetchPopularMovies(locale);

  return (
    <PopularMovies
      initialItems={items}
      initialPagination={pagination}
    />
  );
}
