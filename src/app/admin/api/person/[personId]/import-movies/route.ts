import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { MovieForImport } from "@/lib/tmdb-movie";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const { personId } = await params;
    const body = await req.json();
    const { movies: rawMovies } = body as { movies: MovieForImport[] };
    if (!Array.isArray(rawMovies))
      return NextResponse.json(
        { error: "Body must contain movies array" },
        { status: 400 }
      );

    const { mongoClient } = await connectToDB();
    if (!mongoClient)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    const db = mongoClient.db("video-club");

    let linked = 0;
    let created = 0;

    for (const movie of rawMovies) {
      if (!movie || typeof movie !== "object") continue;
      const director =
        typeof movie.director === "string" ? movie.director : "";
      const year = typeof movie.year === "string" ? movie.year : "";
      const translations =
        movie.translations && typeof movie.translations === "object"
          ? movie.translations
          : {};
      const title =
        translations.en?.title ?? translations.fr?.title ?? "";
      if (!title.trim()) continue;

      let movieId: string | null = null;

      if (movie._id && /^[a-f0-9]{24}$/i.test(movie._id)) {
        const existing = await db.collection("movies").findOne({
          _id: ObjectId.createFromHexString(movie._id),
        });
        if (existing) movieId = movie._id;
      }

      if (!movieId) {
        const searchPattern = escapeRegex(title.trim()).replace(/\s+/g, "\\s*");
        const regex = new RegExp(searchPattern, "i");
        const found = await db.collection("movies").findOne({
          $or: [
            { "translations.en.title": regex },
            { "translations.fr.title": regex },
          ],
        });
        if (found) movieId = (found as { _id: ObjectId })._id.toString();
      }

      if (!movieId) {
        const toInsert = {
          director,
          year,
          translations,
          genre_ids_tmdb: movie.genre_ids_tmdb ?? undefined,
          ...(movie.backdrop_url && { backdrop_url: movie.backdrop_url }),
        };
        const result = await db.collection("movies").insertOne(toInsert);
        movieId = result.insertedId.toString();
        created++;
      }

      const existingLink = await db.collection("persons-movies").findOne({
        person_id: personId,
        movie_id: movieId,
      });
      if (!existingLink) {
        await db.collection("persons-movies").insertOne({
          person_id: personId,
          movie_id: movieId,
        });
        linked++;
      }
    }

    return NextResponse.json({
      success: true,
      linked,
      created,
    });
  } catch (err) {
    console.error("import-movies:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
