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
        const movie = await db
            .collection('movies')
            .findOne({ _id: ObjectId.createFromHexString(movieId) });
        return NextResponse.json(movie);
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ movieId: string }> }) {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');
        const { movieId } = await params;
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
        const result = await db.collection('movies').updateOne(
            { _id: ObjectId.createFromHexString(movieId) },
            { $set: { director, year, translations } }
        );
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ movieId: string }> }) {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');
        const { movieId } = await params;
        const result = await db.collection('movies').deleteOne({ _id: ObjectId.createFromHexString(movieId) });
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 