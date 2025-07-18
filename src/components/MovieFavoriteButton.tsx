import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { BsHeart, BsHeartFill } from "react-icons/bs";

export default function MovieFavoriteButton({movieId}: {
    movieId: string
}) {
    const [isFav, setIsFav] = useState(isFavorite(movieId));
    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        toggleFavorite(movieId);
        setIsFav(isFavorite(movieId));
      };

    return (
        <IconButton
            onClick={handleToggleFavorite}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            backgroundColor="gray.700/50"
            rounded="full"
            style={{
                position: "absolute",
                top: 10,
                right: 10,
                border: "none",
                cursor: "pointer",
                zIndex: 2,
            }}
        >
            {isFav ? (
                <BsHeartFill size={22} color="#e53e3e" />
            ) : (
                <BsHeart size={22} color="#fff" />
            )}
        </IconButton>
    )
}