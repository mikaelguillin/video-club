// components/MovieCard.jsx
import { useMovieDetails } from "./utils/useMovieDetails";

export default function MovieCard({ title }) {
  const { movie, loading, error } = useMovieDetails(title);

  if (loading) return <p>Loading {title}...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!movie) return <p>No data found for {title}</p>;

  return (
    <div>
      {movie.poster_url && (
        <img src={movie.poster_url} alt={movie.title} />
      )}
      <div>
        <h2>{movie.title}</h2>
        <p>
          Release Date: {movie.release_date}
        </p>
      </div>
    </div>
  );
}
