import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let mongoClient: MongoClient | null = null;

export async function connectToDB() {
    if (!process.env.MONGODB_URI) {
        throw new Error('Please add your Mongo URI to .env.local');
    }
    if (mongoClient) {
        return { mongoClient };
    }
    mongoClient = await new MongoClient(uri, options).connect();
    return { mongoClient };
} 