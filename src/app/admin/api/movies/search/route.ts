import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;
        const personId = searchParams.get('personId') || '';

        // Build search query
        let query = {};
        if (search.trim()) {
            query = {
                $or: [
                    { 'translations.en.title': { $regex: search, $options: 'i' } },
                    { 'translations.fr.title': { $regex: search, $options: 'i' } },
                    { director: { $regex: search, $options: 'i' } },
                ]
            };
        }

        // If personId is provided, exclude movies already linked to this person
        if (personId) {
            const personMovies = await db.collection('persons-movies').find({ person_id: personId }).toArray();
            const linkedMovieIds = personMovies.map((personMovie) => ObjectId.createFromHexString(personMovie.movie_id));
            if (linkedMovieIds.length > 0) {
                query = { ...query, _id: { $nin: linkedMovieIds } };
            }
        }

        const total = await db.collection('movies').countDocuments(query);
        const movies = await db.collection('movies')
            .find(query)
            .sort({ year: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

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