"use client";
import { TMDB_IMAGE_BASE } from "@/constants";
import {
  Box,
  Button,
  Heading,
  Skeleton,
  Text,
  SkeletonText,
} from "@chakra-ui/react";
import type { Movie } from "@video-club/types";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface MovieDetailProps {
  initialMovie?: Movie;
}

export default function MovieDetail({ initialMovie }: MovieDetailProps) {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const movieId = params?.movieId as string;
  const [movie, setMovie] = useState<Movie>(initialMovie || ({} as Movie));
  const router = useRouter();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`/api/movie/${movieId}?locale=${locale}`);
        const movieData = await response.json();
        setMovie(movieData);
      } catch (error) {
        console.error("Error fetching movie:", error);
      }
    };
    if (movieId && !initialMovie) fetchMovie();
  }, [movieId, initialMovie, locale]);

  const { title, overview, poster_url } = movie.translations?.[locale] || {};

  return (
    <>
      <Button onClick={() => router.back()} mb={3} variant="plain">
        ‹ {t("Actions.back")}
      </Button>
      <Box
        className="movie-detail-card"
        as="article"
        style={
          movie.backdrop_url || poster_url
            ? {
                backgroundImage: `url(${TMDB_IMAGE_BASE}${
                  movie.backdrop_url || poster_url
                })`,
              }
            : undefined
        }
      >
        <Box className="movie-detail-card-inner" display={{ mdTo2xl: "flex" }}>
          <Box
            width={{
              base: "50%",
              md: "calc(500px + (var(--chakra-spacing-5) * 2))",
            }}
            maxWidth="50%"
            p={5}
          >
            {poster_url ? (
              <Image
                src={`${TMDB_IMAGE_BASE}${poster_url}`}
                alt={`Poster of ${title}`}
                height={750}
                width={500}
                priority
                placeholder="blur"
                blurDataURL="/placeholder.png"
              />
            ) : (
              <Skeleton
                height={{ base: "300px", md: "750px" }}
                width={{ base: "100%", md: "500px" }}
                maxWidth="100%"
                borderRadius="md"
              />
            )}
          </Box>

          <Box
            className="movie-detail-card-text"
            px="5"
            pb={5}
            pt={{ md: 5 }}
            flex={1}
          >
            {movie._id ? (
              <>
                <Heading size="4xl" mb={4}>
                  {title}{" "}
                  <span style={{ fontSize: ".7em" }}>({movie.year})</span>
                </Heading>
                <Heading size="2xl">{t("MovieDetail.overview")}</Heading>
                <Text>{overview}</Text>
              </>
            ) : (
              <SkeletonText noOfLines={10} />
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
