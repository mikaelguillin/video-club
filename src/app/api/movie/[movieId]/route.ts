import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Movie, MovieGenre } from '@/types';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ movieId: string }> }
) {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');
        const { movieId } = await params;
        const { searchParams } = new URL(req.url);
        const locale = searchParams.get('locale') || 'en';

        const movie = await db
            .collection<Movie>('movies')
            .findOne(
                { _id: ObjectId.createFromHexString(movieId) },
                { projection: { [`translations.${locale}`]: 1, year: 1, poster_url: 1, backdrop_url: 1, director: 1, genre_ids_tmdb: 1 } }
            );

        if (!movie) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        const genreIds: number[] = movie.genre_ids_tmdb || [];
        let genres: { id: number; name: string }[] = [];
        if (genreIds.length > 0) {
            const genresCursor = db.collection<MovieGenre>('movies-genres').find({ id_tmdb: { $in: genreIds } });
            const genresArray = await genresCursor.toArray();
            genres = genresArray.map((genre) => ({
                id: genre.id_tmdb,
                name: genre.translations?.[locale] || genre.translations?.en || ''
            }));
        }

        const response = {
            ...movie,
            genres,
        }
        delete response.genre_ids_tmdb;

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 