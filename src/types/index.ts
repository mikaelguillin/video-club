export interface Person {
    _id: string;
    name: string;
    date: string;
    video: string;
    profile_url: string;
    show?: boolean;
}

interface MovieTranslation {
    title: string;
    overview: string;
    poster_url: string;
}
export interface Movie {
    _id: string;
    director: string;
    year: number;
    backdrop_url: string;
    translations: Record<string, MovieTranslation>;
} 