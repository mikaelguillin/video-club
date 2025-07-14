"use client";
import { Box, Text } from "@chakra-ui/react";
import type { Movie, Person } from "@video-club/types";
import PersonMoviesHeader from "./PersonMoviesHeader";
import GridList from "./GridList";
import { TMDB_IMAGE_BASE } from "@/constants";
import { Link } from '@/i18n/navigation';
import Image from "next/image";
import { useLocale } from "next-intl";

interface PersonMoviesProps {
  personId: string;
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

export default function PersonMovies({
  personId,
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
    const { title, poster_url } = movie.translations?.[locale] || {};
    return (
      <Link href={`/movie/${movie._id}`} key={`${movie._id}`}>
        <article className="movie-card">
          <Image
            src={`${TMDB_IMAGE_BASE}${poster_url}`}
            alt={title || ''}
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
    )
  };

  return (
    <>
      <PersonMoviesHeader person={person} />
      <GridList<Movie>
        fetchUrl={`/api/person/${personId}/movies`}
        renderItem={renderMovie}
        initialItems={initialItems}
        initialPage={initialPage}
        initialPagination={initialPagination}
      />
    </>
  );
}
