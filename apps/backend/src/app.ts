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

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

app.get('/persons', async (req: Request, res: Response) => {
    try {
        const { mongoClient } = await connectToDB();

        if (!mongoClient)
            throw new Error('An error occured while connecting to database');

        const db = mongoClient.db('video-club');
        const persons = await db
            .collection('persons')
            .find({})
            .toArray(); 

        const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/person';

        const data = await Promise.all(
            persons.map(async (person) => {
                if (person.name) {
                    const response = await fetch(`${TMDB_SEARCH_URL}?query=${person.name}`, {
                        headers: {
                            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
                        },
                    });
                    const result: any = await response.json();
                    if (result.results && result.results.length > 0) {
                        person.profile_url = `${TMDB_IMAGE_BASE}${result.results[0].profile_path}`;
                    }
                }
                return person;
            })
        );

        res.send(data);
    } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/person/:personId/movies', async (req: Request, res: Response) => {
    console.log(req.params.personId)

    try {
        const { mongoClient } = await connectToDB();

        if (!mongoClient)
            throw new Error('An error occured while connecting to database');

        const db = mongoClient.db('video-club');

        const personMovies = await db.collection('persons-movies').find({ "person_id": req.params.personId }).toArray();

        const movieIds = personMovies.map(personMovie => new ObjectId(personMovie.movie_id));

        const movies = await db.collection('movies').find({ "_id": { "$in": movieIds } }).toArray();

        const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
        
        const data = await Promise.all(
            movies.map(async (movie) => {
                if (movie.name) {
                    const response = await fetch(`${TMDB_SEARCH_URL}?query=${movie.name}`, {
                        headers: {
                            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
                        },
                    });
                    const result: any = await response.json();
                    if (result.results && result.results.length > 0) {
                        movie.poster_url = `${TMDB_IMAGE_BASE}${result.results[0].poster_path}`;
                    }
                }
                return movie;
            })
        );

        res.send(data);
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
