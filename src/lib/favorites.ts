const FAVORITES_KEY = 'favoriteMovieIds';

export function getFavoriteMovieIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function isFavorite(movieId: string): boolean {
    return getFavoriteMovieIds().includes(movieId);
}

export function addFavorite(movieId: string) {
    const ids = getFavoriteMovieIds();
    if (!ids.includes(movieId)) {
        ids.push(movieId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    }
}

export function removeFavorite(movieId: string) {
    const ids = getFavoriteMovieIds().filter((id) => id !== movieId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function toggleFavorite(movieId: string) {
    if (isFavorite(movieId)) {
        removeFavorite(movieId);
    } else {
        addFavorite(movieId);
    }
} 