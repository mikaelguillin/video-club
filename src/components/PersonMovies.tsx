"use client";
import { Box, Text } from "@chakra-ui/react";
import type { Movie, Person } from "@video-club/types";
import PersonMoviesHeader from "./PersonMoviesHeader";
import GridList from "./GridList";
import { TMDB_IMAGE_BASE } from "@/constants";
import { Link } from "@/i18n/navigation";
import { movieToSlug } from "@/lib/slug";
import Image from "next/image";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";

interface PersonMoviesProps {
  person: Person;
  initialItems: Movie[];
  initialPage: number;
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const MovieFavoriteButton = dynamic(() => import("./MovieFavoriteButton"), {
  ssr: false,
});

function MovieCard({
  movie,
  isImageLoaded,
  handleImageLoad,
  locale,
}: {
  movie: Movie;
  isImageLoaded: boolean;
  handleImageLoad: (id: string) => void;
  locale: string;
}) {
  const { title, poster_url } = movie.translations?.[locale] || {};
  return (
    <Link href={`/movie/${movieToSlug(movie, locale)}`} key={`${movie._id}`}>
      <article className="movie-card" style={{ position: "relative" }}>
        <MovieFavoriteButton movieId={`${movie._id}`} />
        <Image
          src={`${TMDB_IMAGE_BASE}${poster_url}`}
          alt={title}
          onLoad={() => handleImageLoad(`${movie._id}`)}
          width={500}
          height={750}
          placeholder="blur"
          blurDataURL="/placeholder.png"
          priority
          style={{
            opacity: isImageLoaded ? 1 : 0,
            transition: "opacity 0.3s",
            willChange: "opacity",
          }}
        />
        <Box className="card-info" hideBelow="sm">
          <Text className="movie-title" title={title}>
            {title}
          </Text>
          <Text color="#555">({movie.year})</Text>
        </Box>
      </article>
    </Link>
  );
}

export default function PersonMovies({
  person,
  initialItems,
  initialPage,
  initialPagination,
}: PersonMoviesProps) {
  const locale = useLocale();
  const renderMovie = (
    movie: Movie,
    isImageLoaded: boolean,
    handleImageLoad: (id: string) => void
  ) => {
    return (
      <MovieCard
        key={`${movie._id}`}
        movie={movie}
        isImageLoaded={isImageLoaded}
        handleImageLoad={handleImageLoad}
        locale={locale}
      />
    );
  };

  return (
    <div className="container">
      <PersonMoviesHeader person={person} />
      <GridList<Movie>
        fetchUrl={`/api/person/${person._id}/movies`}
        renderItem={renderMovie}
        initialItems={initialItems}
        initialPage={initialPage}
        initialPagination={initialPagination}
      />
    </div>
  );
}
