"use client";

import { Box, Text } from "@chakra-ui/react";
import type { Movie } from "@video-club/types";
import GridList from "./GridList";
import { TMDB_IMAGE_BASE } from "@/constants";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Heading } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

export type PopularMovie = Movie & {
  mentionCount: number;
  persons: { name: string }[];
};

interface PopularMoviesProps {
  initialItems: PopularMovie[];
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

function PopularMovieCard({
  movie,
  isImageLoaded,
  handleImageLoad,
  locale,
}: {
  movie: PopularMovie;
  isImageLoaded: boolean;
  handleImageLoad: (id: string) => void;
  locale: string;
}) {
  const t = useTranslations();
  const { title, poster_url } = movie.translations?.[locale] || {};
  const persons = movie.persons ?? [];

  return (
    <Link href={`/movie/${movie._id}`} key={`${movie._id}`}>
      <article className="movie-card popular-movie-card" style={{ position: "relative" }}>
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
        {persons.length > 0 && (
          <Box
            className="popular-movies-hover"
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="blackAlpha.800"
            color="white"
            fontSize="sm"
            py={2}
            px={3}
            borderBottomRadius="0.5em"
            opacity={0}
            transition="opacity 0.2s"
          >
            <Text fontWeight="bold" mb={1}>
              {t("MovieDetail.pickedBy")}
            </Text>
            <Text>{persons.map((p) => p.name).join(", ")}</Text>
          </Box>
        )}
      </article>
    </Link>
  );
}

export default function PopularMovies({
  initialItems,
  initialPagination,
}: PopularMoviesProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();

  const renderMovie = (
    movie: PopularMovie,
    isImageLoaded: boolean,
    handleImageLoad: (id: string) => void
  ) => (
    <Box key={`${movie._id}`} className="popular-movie-card-group" role="group">
      <PopularMovieCard
        movie={movie}
        isImageLoaded={isImageLoaded}
        handleImageLoad={handleImageLoad}
        locale={locale}
      />
    </Box>
  );

  return (
    <div className="container">
      <Heading size="3xl" mb={4}>
        {t("PopularMovies.title")}
      </Heading>
      <Button mb={3} p={0} variant="plain" onClick={() => router.back()}>
        ‹ {t("Actions.back")}
      </Button>
      <GridList<PopularMovie>
        fetchUrl="/api/popular-movies"
        renderItem={renderMovie}
        initialItems={initialItems}
        initialPage={1}
        initialPagination={initialPagination}
      />
    </div>
  );
}
