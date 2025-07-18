"use client";
import { TMDB_IMAGE_BASE } from "@/constants";
import {
  Box,
  Button,
  Heading,
  Skeleton,
  Text,
  SkeletonText,
  Avatar,
  Stack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import type { Movie } from "@video-club/types";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Person } from "@video-club/types";
import NextLink from "next/link";
import dynamic from "next/dynamic";

interface MovieDetailProps {
  initialMovie?: Movie;
}

const MovieFavoriteButton = dynamic(() => import("./MovieFavoriteButton"), {
  ssr: false,
});

export default function MovieDetail({ initialMovie }: MovieDetailProps) {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const movieId = params?.movieId as string;
  const [movie, setMovie] = useState<Movie>(initialMovie || ({} as Movie));
  const [recommenders, setRecommenders] = useState<Person[]>([]);
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

    const fetchRecommenders = async () => {
      try {
        const response = await fetch(`/api/movie/${movieId}/recommendations`);
        const data = await response.json();
        setRecommenders(data);
      } catch (error) {
        console.error("Error fetching recommenders:", error);
      }
    };
    if (movieId) fetchRecommenders();
  }, [movieId, initialMovie, locale]);

  const { title, overview, poster_url } = movie.translations?.[locale] || {};

  return (
    <>
      <Box className="container">  
        <Button onClick={() => router.back()} mb={3} p={0} variant="plain">
          ‹ {t("Actions.back")}
        </Button>
      </Box>
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
          <Box className="movie-detail-card-inner">
        <Box className="container" display={{ mdTo2xl: "flex" }}>
            <Box maxWidth={{ md: "50%" }} pt={5} pb={5} pr={5}>
              {poster_url ? (
                <Box
                  asChild
                  margin={{ mdDown: "0 auto" }}
                  height={{ md: 500 }}
                  width="auto"
                >
                  <Image
                    src={`${TMDB_IMAGE_BASE}${poster_url}`}
                    alt={`Poster of ${title}`}
                    height={750}
                    width={500}
                    priority
                    placeholder="blur"
                    blurDataURL="/placeholder.png"
                  />
                </Box>
              ) : (
                <Skeleton
                  maxWidth="100%"
                  borderRadius="md"
                  height={{ base: "300px", md: "750px" }}
                  width={{ base: "100%", md: "500px" }}
                />
              )}
            </Box>

            <Box
              className="movie-detail-card-text"
              px="5"
              pb={5}
              pt={{ md: 10 }}
              flex={1}
            >
              {movie._id ? (
                <>
                  <Heading size="4xl">
                    {title}{" "}
                    <span style={{ fontSize: ".7em" }}>({movie.year})</span>
                  </Heading>
                  <MovieFavoriteButton movieId={`${movie._id}`} />
                  <Text>
                    {t("MovieDetail.directedBy", { name: movie.director })}
                    <span>&nbsp;•&nbsp;</span>
                    {movie.genres.map((genre) => genre.name).join(`, `)}
                  </Text>

                  <Heading size="2xl" as="h3" mt={8}>
                    {t("MovieDetail.overview")}
                  </Heading>
                  <Text>{overview}</Text>
                  {recommenders.length > 0 && (
                    <Box mt={8}>
                      <Heading size="2xl" mb={2} as="h3">
                        {t("MovieDetail.pickedBy")}
                      </Heading>
                      <Stack direction="row" gap={4}>
                        {recommenders.map((person) => (
                          <ChakraLink
                            as={NextLink}
                            key={`${person._id}`}
                            href={`/${locale}/person/${person._id}/movies`}
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                          >
                            <Avatar.Root size="2xl" mb={1}>
                              <Avatar.Fallback name={person.name} />
                              <Avatar.Image src={person.profile_url} />
                            </Avatar.Root>
                            <Text fontSize="sm" textAlign="center">
                              {person.name}
                            </Text>
                          </ChakraLink>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </>
              ) : (
                <SkeletonText noOfLines={10} />
              )}
            </Box>
        </Box>
          </Box>
      </Box>
    </>
  );
}
