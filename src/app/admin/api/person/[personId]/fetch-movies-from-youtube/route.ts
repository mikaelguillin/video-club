import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { extractFavoriteMoviesFromYouTubeVideo } from "@/lib/gemini";
import {
  searchTmdbMovie,
  movieFromTmdbId,
  type MovieForImport,
} from "@/lib/tmdb-movie";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const { personId } = await params;
    const { mongoClient } = await connectToDB();
    if (!mongoClient)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    const db = mongoClient.db("video-club");

    const person = await db.collection("persons").findOne({
      _id: ObjectId.createFromHexString(personId),
    });
    if (!person)
      return NextResponse.json({ error: "Person not found" }, { status: 404 });

    const videoId = (person as { video?: string }).video;
    if (!videoId || typeof videoId !== "string")
      return NextResponse.json(
        { error: "Person has no YouTube video ID" },
        { status: 400 }
      );

    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId.trim()}`;
    const extracted = await extractFavoriteMoviesFromYouTubeVideo(youtubeUrl);

    const movies: MovieForImport[] = [];
    const seenTitles = new Set<string>();

    for (const { title, year } of extracted) {
      const normTitle = title.trim();
      if (!normTitle || seenTitles.has(normTitle.toLowerCase())) continue;
      seenTitles.add(normTitle.toLowerCase());

      // 1) Fuzzy search in MongoDB
      const searchPattern = escapeRegex(normTitle).replace(/\s+/g, "\\s*");
      const regex = new RegExp(searchPattern, "i");
      const existing = await db.collection("movies").findOne({
        $or: [
          { "translations.en.title": regex },
          { "translations.fr.title": regex },
        ],
      });

      if (existing) {
        const doc = existing as {
          _id: ObjectId;
          director: string;
          year: string;
          backdrop_url?: string;
          translations: Record<
            string,
            { title: string; overview: string; poster_url: string }
          >;
          genre_ids_tmdb?: number[];
        };
        movies.push({
          _id: doc._id.toString(),
          director: doc.director ?? "",
          year: doc.year ?? "",
          backdrop_url: doc.backdrop_url ?? "",
          translations: doc.translations ?? {},
          genre_ids_tmdb: doc.genre_ids_tmdb,
        });
        continue;
      }

      // 2) Search TMDB (fuzzy: first result)
      const tmdbHit = await searchTmdbMovie(normTitle, year);
      if (!tmdbHit) continue;

      const movieFromTmdb = await movieFromTmdbId(tmdbHit.id);
      if (movieFromTmdb) movies.push(movieFromTmdb);
    }

    return NextResponse.json({ movies });
  } catch (err) {
    console.error("fetch-movies-from-youtube:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
