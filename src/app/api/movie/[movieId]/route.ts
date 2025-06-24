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