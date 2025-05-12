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
        const persons = await db
            .collection('persons')
            .find({show: true})
            .toArray(); 

        res.send(persons);
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

        const personMovies = await db.collection('persons-movies').find({ "person_id": req.params.personId }).toArray();

        const movieIds = personMovies.map(personMovie => ObjectId.createFromHexString(personMovie.movie_id));

        const movies = await db.collection('movies').find({ "_id": { "$in": movieIds } }).toArray();

        res.send(movies);
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
