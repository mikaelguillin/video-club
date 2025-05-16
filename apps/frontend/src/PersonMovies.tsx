import { Box, Button, Heading, Image, SimpleGrid, Skeleton, SkeletonCircle, SkeletonText, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { Movie, Person } from "@video-club/types";
// import VideoModal from "./VideoModal";

export default function PersonMovies() {
    const { personId } = useParams();
    const [person, setPerson] = useState<Person>();
    const [movies, setMovies] = useState<Movie[]>([]);

    useEffect(() => {
        const fetchPerson = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/person/${personId}`);
                const personData = await response.json();
                setPerson(personData);
            } catch (error) {
                console.error('Error fetching person movies:', error);
            }
        };
        const fetchPersonMovies = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/person/${personId}/movies`);
                const moviesData = await response.json();
                setMovies(moviesData);
            } catch (error) {
                console.error('Error fetching person movies:', error);
            }
        };

        fetchPerson();
        fetchPersonMovies();
    }, [])

    return (
        <>
            {person ? (
                <Box className="person-movies-header" display={{
                    base: 'block',
                    sm: 'flex'
                }}>
                    <div className="person-name">
                        <Image
                            hideBelow="md"
                            src={person.profile_url}
                            borderRadius="full"
                            border="1px solid #ddd"
                            boxSize="80px"
                            alt={person.name}
                            margin={'0 .75em 0 0'}
                        />
                        <Heading size="3xl">{person.name}'s selection</Heading>
                    </div>
                    <Button variant="outline" ml="auto" mt={{base: 2, sm: 0}} asChild>
                        <a href={`https://www.youtube.com/watch?v=${person.video}`} target="_blank">
                            🎬 Watch the interview
                        </a>
                    </Button>
                    {/* <VideoModal
                        buttonLabel="🎬 Watch the interview"
                        video={person.video}
                    /> */}
                </Box>
            ) : (
                <div style={{margin: '1em 0', display: 'flex', alignItems: 'center'}}>
                    <SkeletonCircle size="80px" />
                    <SkeletonText ml="2" noOfLines={1} width="300px" />
                </div>
            )}

                <SimpleGrid
                    columns={{
                        base: 1,
                        sm: 2,
                        md: 3,
                        lg: 4,
                        xl: 5
                    }}
                    gap="20px"
                >
                {movies.length ? (
                    <>
                        {movies.map((movie, index) => (
                            <div className="movie-card" key={index}>
                                <Image
                                    src={movie.poster_url}
                                    alt={movie.name}
                                    height="300px"
                                    width="100%"
                                />
                                <div className="card-info">
                                    <Text
                                        fontWeight="bold"
                                        style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                        title={movie.name}
                                    >{movie.name}</Text>
                                    <Text color="#555">({movie.year})</Text>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {Array.from({ length: 15 }, (_, index) => (
                            <Skeleton height="300px" key={index} />
                        ))}
                    </>
                )}
                </SimpleGrid>
        </>
    );
}