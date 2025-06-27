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

        const total = await db.collection('persons').countDocuments({ show: true });
        const persons = await db.collection('persons')
            .find({ show: true })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return NextResponse.json({
            items: persons,
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
        const { name, profile_url, date, show } = body;
        if (!name || !profile_url || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const person = {
            name,
            profile_url,
            date,
            show: show !== undefined ? show : true,
        };
        const result = await db.collection('persons').insertOne(person);
        return NextResponse.json({ ...person, _id: result.insertedId });
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 