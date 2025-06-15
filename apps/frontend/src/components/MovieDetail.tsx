import { Box, Button, Heading, Image, Skeleton, Text } from "@chakra-ui/react"
import type { Movie } from "@video-club/types";
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router";

export default function MovieDetail() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState<Movie>({} as Movie);
  const [isLoadedImage, setLoadedImage] = useState(false);
  const navigate = useNavigate();

    useEffect(() => {
        const fetchMovie = async() => {
            try {
                const response = await fetch(
                  `${import.meta.env.VITE_API_URL}/movie/${movieId}`
                );
                const movieData = await response.json();
                setMovie(movieData);
            } catch (error) {
                console.error("Error fetching movie:", error);
            }
        }
        fetchMovie();
    }, [])

    const handleImageLoad = () => {
        setLoadedImage(true);
    };

    return (
        <>
            <Button
                onClick={() => navigate(-1)}
                mb={3}
                variant="plain"
            >
                ‹ Back
            </Button>
            <Box className="movie-detail-card" style={{backgroundImage: `url(${movie.poster_url})`}}>
                <Box className="movie-detail-card-inner" display={{mdTo2xl: 'flex'}}>
                    <Skeleton
                        loading={!isLoadedImage}
                        maxWidth="100%"
                        height={!isLoadedImage ? "750px" : "auto"}
                        width={{base: '60%', md: '500px'}}
                        p={5}
                    >
                        <Image
                            src={movie.poster_url}
                            alt={`Poster of ${movie.name}`}
                            onLoad={handleImageLoad}
                            borderRadius="10px"
                            width="100%"
                        />
                    </Skeleton>

                    <Box className="movie-detail-card-text" px="5" pb={5} pt={{md: 5}} flexShrink={4}>
                        {movie._id && (
                            <>
                                <Heading size="4xl" mb={4}>
                                    {movie.title.en} <span style={{fontSize: '.7em'}}>({movie.year})</span>
                                </Heading>
                                <Heading size="2xl">Overview</Heading>
                                <Text>{movie.overview.en}</Text>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    )
}