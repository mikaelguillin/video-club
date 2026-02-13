"use client";
import { useEffect, useState } from "react";
import { getFavoriteMovieIds } from "@/lib/favorites";
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Skeleton,
  EmptyState,
  HStack,
  Button,
} from "@chakra-ui/react";
import { TMDB_IMAGE_BASE } from "@/constants";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Movie } from "@/types";
import { BsHeartFill } from "react-icons/bs";

export default function FavoritesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const [movieIds, setMovieIds] = useState<string[]>([]);

  useEffect(() => {
    setMovieIds(getFavoriteMovieIds())
  }, [])

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setMovies([]);
      if (movieIds.length === 0) {
        setLoading(false);
        return;
      }
      try {
        await Promise.all(
          movieIds.map(async (id) => {
            const res = await fetch(`/api/movie/${id}?locale=${locale}`);
            if (res.ok) {
              const movie = await res.json();
              setMovies((prev) => prev.some((m) => m._id === movie._id) ? prev : [...prev, movie]);
            }
          })
        );
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [locale, movieIds]);

  return (
    <Box className="container">
      <Heading mb={6} size="3xl">
        {t("FavoriteMoviesList.title")}
      </Heading>
      <Button onClick={() => router.back()} mb={3} p={0} variant="plain">
        ‹ {t("Actions.back")}
      </Button>
      {!loading && movies.length < 1 && (
        <EmptyState.Root>
          <EmptyState.Content>
            <HStack textAlign="center">
              <EmptyState.Indicator>
                <BsHeartFill size={22} color="#e53e3e" />
              </EmptyState.Indicator>
              <EmptyState.Title>
                {t('FavoriteMoviesList.emptyMessage')}
              </EmptyState.Title>
            </HStack>
          </EmptyState.Content>
        </EmptyState.Root>
      )}
      <SimpleGrid columns={{ base: 2, sm: 2, md: 3, lg: 4, xl: 5 }} gap="20px">
        {loading
          ? Array.from({ length: movieIds.length }).map((_, index) => (
              <Skeleton key={index} height="350px" />
            ))
          : movies.map((movie) => {
              const { title, poster_url } = movie.translations?.[locale] || {};
              return (
                <Link href={`/movie/${movie._id}`} key={`${movie._id}`}>
                  <article className="movie-card">
                    <Image
                      src={`${TMDB_IMAGE_BASE}${poster_url}`}
                      alt={title || ""}
                      width={500}
                      height={750}
                      placeholder="blur"
                      blurDataURL="/placeholder.png"
                      priority
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
            })}
      </SimpleGrid>
    </Box>
  );
}
