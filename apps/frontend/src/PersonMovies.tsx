import { SimpleGrid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

export default function PersonMovies() {
    const [movies, setMovies] = useState<any>([]);
    const { personId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/person/${personId}/movies`);
                const movies = await response.json();
                setMovies(movies);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [])

    return (
        <>
            <Link to={`/`}>Back</Link>
            <SimpleGrid minChildWidth="sm" gap="20px">
                {movies.map((movie, index) => (
                    <div key={index}>
                        <img src={movie.poster_url} alt={movie.name} />
                        <h2>{movie.name}</h2>
                    </div>
                ))}
            </SimpleGrid>
        </>
    );
}