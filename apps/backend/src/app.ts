import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectToDB from './db';
import { ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

app.get('/persons', async (req: Request, res: Response) => {
    try {
        const { mongoClient } = await connectToDB();

        if (!mongoClient)
            throw new Error('An error occured while connecting to database');

        const db = mongoClient.db('video-club');

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Get total count of documents
        const total = await db
            .collection('persons')
            .countDocuments({ show: true });

        // Get paginated results
        const persons = await db
            .collection('persons')
            .find({ show: true })
            .sort({ date: -1 })
.skip(skip)
            .limit(limit)
            .toArray(); 

        res.send({
            items: persons,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/person/:personId', async (req: Request, res: Response) => {
    try {
        const { mongoClient } = await connectToDB();

        if (!mongoClient)
            throw new Error('An error occured while connecting to database');

        const db = mongoClient.db('video-club');
        const person = await db
            .collection('persons')
            .findOne({"_id": ObjectId.createFromHexString(req.params.personId)}); 

        res.send(person);
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/person/:personId/movies', async (req: Request, res: Response) => {
    try {
        const { mongoClient } = await connectToDB();

        if (!mongoClient)
            throw new Error('An error occured while connecting to database');

        const db = mongoClient.db('video-club');

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const personMovies = await db.collection('persons-movies').find({ "person_id": req.params.personId }).toArray();
        const movieIds = personMovies.map(personMovie => ObjectId.createFromHexString(personMovie.movie_id));

        const allMovies = await db.collection('movies').find(
            {
                "_id": { "$in": movieIds },
            show: { "$ne": false }
            }).sort({
                "title.en": 1,
                "title.original": 1
        }).toArray();

        const total = allMovies.length;

        const movies = allMovies.slice(skip, skip + limit);
        res.send({
            items: movies,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/movies', async (req: Request, res: Response) => {
    try {
        const { mongoClient } = await connectToDB();

        if (!mongoClient)
            throw new Error('An error occured while connecting to database');

        const db = mongoClient.db('video-club');
        const persons = await db
            .collection('movies')
            .find({})
            .sort({ name: -1 })
            .toArray();

        res.send(persons);
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/movie/:movieId', async (req: Request, res: Response) => {
    try {
        const { mongoClient } = await connectToDB();

        if (!mongoClient)
            throw new Error('An error occured while connecting to database');

        const db = mongoClient.db('video-club');
        const movie = await db
            .collection('movies')
            .findOne({"_id": ObjectId.createFromHexString(req.params.movieId)});

        res.send(movie);
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/randommovie', async (req: Request, res: Response) => {
    try {
        const { mongoClient } = await connectToDB();

        if (!mongoClient)
            throw new Error('An error occured while connecting to database');

        const db = mongoClient.db('video-club');
        const [randomMovie] = await db.collection('movies').aggregate([{ $sample: { size: 1} }]).toArray();

        res.send(randomMovie);
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
});

export default app;
