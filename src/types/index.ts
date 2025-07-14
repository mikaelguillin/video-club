import { ObjectId } from "mongodb";

export interface Person {
    _id: ObjectId;
    name: string;
    date: string;
    video: string;
    profile_url: string;
    show?: boolean;
}

export interface User {
    _id: ObjectId;
    username: string;
    password: string;
    email?: string;
    role?: string;
}

export interface MovieGenre {
    id_tmdb: number;
    translations: Record<string, string>;
}

interface MovieTranslation {
    title: string;
    overview: string;
    poster_url: string;
}

export interface Movie {
    _id: ObjectId;
    director: string;
    year: string;
    backdrop_url: string;
    translations: Record<string, MovieTranslation>;
    genre_ids_tmdb?: number[];
    genres: {
        id: number;
        name: string
    }[];
} 