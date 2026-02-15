const TMDB_BASE = "https://api.themoviedb.org/3";

function getAuthHeader(): string {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_TMDB_API_KEY is not set");
  return `Bearer ${key}`;
}

type TmdbMovieSearchResult = {
  id: number;
  title: string;
  overview?: string;
  release_date?: string;
  poster_path?: string;
  genre_ids?: number[];
};

type TmdbMovieDetails = TmdbMovieSearchResult & {
  backdrop_path?: string;
  genres?: { id: number }[];
};

type TmdbCredits = {
  crew?: { job: string; name: string }[];
};

export async function searchTmdbMovie(
  title: string,
  year?: string
): Promise<TmdbMovieSearchResult | null> {
  const params = new URLSearchParams({
    query: title,
    language: "en-US",
  });
  if (year) params.set("year", year);
  const res = await fetch(`${TMDB_BASE}/search/movie?${params}`, {
    headers: { Authorization: getAuthHeader() },
  });
  const data = await res.json();
  const results = data.results as TmdbMovieSearchResult[] | undefined;
  if (!results?.length) return null;
  return results[0];
}

export async function getTmdbMovieDetails(
  tmdbId: number,
  language: string
): Promise<TmdbMovieDetails | null> {
  const res = await fetch(
    `${TMDB_BASE}/movie/${tmdbId}?language=${language}`,
    { headers: { Authorization: getAuthHeader() } }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getTmdbMovieCredits(tmdbId: number): Promise<TmdbCredits> {
  const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}/credits`, {
    headers: { Authorization: getAuthHeader() },
  });
  if (!res.ok) return {};
  return res.json();
}


export type MovieForImport = {
  _id?: string;
  director: string;
  year: string;
  backdrop_url: string;
  translations: Record<string, { title: string; overview: string; poster_url: string }>;
  genre_ids_tmdb?: number[];
};

export async function movieFromTmdbId(tmdbId: number): Promise<MovieForImport | null> {
  const [en, fr, credits] = await Promise.all([
    getTmdbMovieDetails(tmdbId, "en-US"),
    getTmdbMovieDetails(tmdbId, "fr-FR"),
    getTmdbMovieCredits(tmdbId),
  ]);
  if (!en) return null;

  const director =
    credits.crew?.find((c) => c.job === "Director")?.name ?? "";
  const year = en.release_date?.slice(0, 4) ?? "";

  const movie: MovieForImport = {
    director,
    year,
    backdrop_url: en.backdrop_path ?? "",
    translations: {
      en: {
        title: en.title ?? "",
        overview: en.overview ?? "",
        poster_url: en.poster_path ?? "",
      },
      fr: {
        title: fr?.title ?? en.title ?? "",
        overview: fr?.overview ?? en.overview ?? "",
        poster_url: (fr?.poster_path ?? en.poster_path) ?? "",
      },
    },
    genre_ids_tmdb:
      en.genre_ids?.length ? en.genre_ids : en.genres?.map((g) => g.id),
  };
  return movie;
}
