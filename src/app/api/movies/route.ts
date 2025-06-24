import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';

export async function GET() {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');
        const movies = await db
            .collection('movies')
            .find({})
            .sort({ name: -1 })
            .toArray();
        return NextResponse.json(movies);
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 