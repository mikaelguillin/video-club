import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let mongoClient: MongoClient | null = null;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

export async function connectToDB() {
    if (mongoClient) {
        return { mongoClient };
    }
    mongoClient = await new MongoClient(uri, options).connect();
    return { mongoClient };
} 