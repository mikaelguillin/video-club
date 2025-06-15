import { Box, Image, Skeleton, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Movie, Person } from "@video-club/types";
import PersonMoviesHeader from "./PersonMoviesHeader";
import GridList from "./GridList";

export default function PersonMovies() {
  const { personId } = useParams();
  const [person, setPerson] = useState<Person>();

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/person/${personId}`
        );
        const personData = await response.json();
        setPerson(personData);
      } catch (error) {
        console.error("Error fetching person:", error);
      }
    };

    fetchPerson();
  }, [personId]);

  const renderMovie = (
    movie: Movie,
    index: number,
    isImageLoaded: boolean,
    handleImageLoad: (id: string) => void
  ) => {
    const movieTitle = movie.title?.en || movie.title?.original;

    return (
      <Skeleton
        key={index}
        height={!isImageLoaded ? "350px" : "auto"}
        loading={!isImageLoaded}
      >
        <Link to={`/movie/${movie._id}`}>
          <div
            className="movie-card"
            style={{
              opacity: isImageLoaded ? 1 : 0,
              transform: `translateY(${isImageLoaded ? "0" : "10px"})`,
              transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
              position: "relative",
              zIndex: isImageLoaded ? 1 : 0,
            }}
          >
            <Image
              src={movie.poster_url}
              alt={movieTitle}
              onLoad={() => handleImageLoad(movie._id)}
            />
            <Box className="card-info" hideBelow="sm">
              <Text className="movie-title" title={movieTitle}>
                {movieTitle}
              </Text>
              <Text color="#555">({movie.year})</Text>
            </Box>
          </div>
        </Link>
      </Skeleton>
    );
  };

  return (
    <>
      <PersonMoviesHeader person={person} />
      <GridList<Movie>
        fetchUrl={`${import.meta.env.VITE_API_URL}/person/${personId}/movies`}
        renderItem={renderMovie}
      />
    </>
  );
}
