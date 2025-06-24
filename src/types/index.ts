export interface Person {
    _id: string;
    name: string;
    date: string;
    video: string;
    profile_url: string;
    show?: boolean;
}

export interface Movie {
    _id: string;
    name: string;
    director: string;
    year: number;
    poster_url: string;
    backdrop_url: string;
    background_url: string;
    title: Record<string, string>;
    overview: Record<string, string>;
} 