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
        const { personId } = await params;
        const person = await db
            .collection('persons')
            .findOne({ _id: ObjectId.createFromHexString(personId) });
        return NextResponse.json(person);
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ personId: string }> }) {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');
        const { personId } = await params;
        const body = await req.json();
        const { name, profile_url, date, show } = body;
        if (!name || !profile_url || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const result = await db.collection('persons').updateOne(
            { _id: ObjectId.createFromHexString(personId) },
            { $set: { name, profile_url, date, show: show !== undefined ? show : true } }
        );
        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Person not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ personId: string }> }) {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');
        const { personId } = await params;
        const result = await db.collection('persons').deleteOne({ _id: ObjectId.createFromHexString(personId) });
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Person not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 