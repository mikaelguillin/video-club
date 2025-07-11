import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ movieId: string }> }
) {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) throw new Error('An error occurred while connecting to database');
        const db = mongoClient.db('video-club');
        const { movieId } = await params;

        const persons = await db.collection('persons-movies').aggregate([
            { $match: { movie_id: movieId } },
            { $addFields: { personObjId: { $toObjectId: "$person_id" } } },
            {
                $lookup: {
                    from: 'persons',
                    localField: 'personObjId',
                    foreignField: '_id',
                    as: 'person'
                }
            },
            { $unwind: '$person' },
            { $match: { 'person.show': { $ne: false } } },
            {
                $project: {
                    _id: '$person._id',
                    name: '$person.name',
                    profile_url: '$person.profile_url'
                }
            }
        ]).toArray();

        return NextResponse.json(persons);
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 