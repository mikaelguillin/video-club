import MovieDetail from "@/components/MovieDetail";
import { Metadata } from "next";

async function fetchMovie(movieId: string, locale: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/movie/${movieId}?locale=${locale}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ movieId: string; locale: string }>;
}): Promise<Metadata> {
  const { movieId, locale } = await params;

  try {
    const movie = await fetchMovie(movieId, locale);
    const { title, overview } = movie.translations?.[locale] || {};

    return {
      title: `${title} (${movie.year})`,
      description: overview,
      openGraph: {
        title: `${title} (${movie.year})`,
        description: overview,
        images: movie.poster_url
          ? [{url: `${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}${movie.poster_url}`}]
          : [],
        type: "video.movie",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} (${movie.year})`,
        description: overview,
        images: movie.poster_url
          ? [`${process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE}${movie.poster_url}`]
          : [],
      },
    };
  } catch {
    return {
      title: "Movie Not Found",
      description: "The requested movie could not be found.",
    };
  }
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ movieId: string; locale: string }>;
}) {
  const { movieId, locale } = await params;

  // Pre-fetch movie data for better performance and SEO
  const movie = await fetchMovie(movieId, locale);

  return <MovieDetail initialMovie={movie} />;
}
