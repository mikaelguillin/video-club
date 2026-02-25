import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ personId: string }> }
) {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const { personId } = await params;
        const locale = searchParams.get('locale') || 'en';
        const personMovies = await db.collection('persons-movies').find({ person_id: personId }).toArray();
        const movieIds = personMovies.map((personMovie) => ObjectId.createFromHexString(personMovie.movie_id));
        const allMovies = await db.collection('movies')
            .find(
                { _id: { $in: movieIds }, show: { $ne: false } },
                { projection: { year: 1, [`translations.${locale}.title`]: 1, [`translations.${locale}.poster_url`]: 1 } }
            )
            .sort({ [`translations.${locale}.title`]: 1 })
            .toArray();
        const total = allMovies.length;
        const movies = allMovies.slice(skip, skip + limit);
        return NextResponse.json({
            items: movies,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

