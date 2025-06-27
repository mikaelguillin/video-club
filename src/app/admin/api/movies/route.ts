import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const total = await db.collection('movies').countDocuments();
        const movies = await db.collection('movies')
            .find({})
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

export async function POST(req: NextRequest) {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');
        const body = await req.json();
        const { director, year, translations } = body;
        if (!director || !year || !translations || typeof translations !== 'object') {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        // Validate at least one language
        const langs = Object.keys(translations);
        if (langs.length === 0 || !translations[langs[0]].title) {
            return NextResponse.json({ error: 'At least one language with title is required' }, { status: 400 });
        }
        const movie = {
            director,
            year,
            translations,
        };
        const result = await db.collection('movies').insertOne(movie);
        return NextResponse.json({ ...movie, _id: result.insertedId });
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 