export interface Person {
    _id: string;
    name: string;
    date: string;
    video: string;
    profile_url: string;
}

export interface Movie {
    _id: string;
    name: string;
    director: string;
    year: number;
    poster_url: string;
}
