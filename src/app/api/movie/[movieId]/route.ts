import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
            .collection('movies')
            .findOne(
                { _id: ObjectId.createFromHexString(movieId) },
                { projection: { [`translations.${locale}`]: 1, year: 1, poster_url: 1, backdrop_url: 1 } }
            );

        if (!movie) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }

        return NextResponse.json(movie);
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 