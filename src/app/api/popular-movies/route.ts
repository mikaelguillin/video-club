import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Movie } from "@/types";

const MIN_PERSONS = 2;

export async function GET(req: NextRequest) {
  try {
    const { mongoClient } = await connectToDB();
    if (!mongoClient) throw new Error("An error occurred while connecting to database");
    const db = mongoClient.db("video-club");
    const locale = req.nextUrl.searchParams.get("locale") || "en";

    // Movies with at least MIN_PERSONS persons, sorted by count desc
    const byMovie = await db
      .collection("persons-movies")
      .aggregate<{ _id: string; count: number; person_ids: string[] }>([
        { $group: { _id: "$movie_id", count: { $sum: 1 }, person_ids: { $push: "$person_id" } } },
        { $match: { count: { $gte: MIN_PERSONS } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    const movieIds = byMovie.map((m) => ObjectId.createFromHexString(m._id));
    const countByMovieId = new Map(byMovie.map((m) => [m._id, m.count]));
    const personIdsByMovieId = new Map(byMovie.map((m) => [m._id, m.person_ids]));

    const allPersonIds = [...new Set(byMovie.flatMap((m) => m.person_ids))];
    const persons = await db
      .collection("persons")
      .find({
        _id: { $in: allPersonIds.map((id) => ObjectId.createFromHexString(id)) },
        show: { $ne: false },
      })
      .project({ name: 1 })
      .toArray();
    const personNameById = new Map(persons.map((p) => [p._id.toString(), p.name]));

    const movies = await db
      .collection<Movie>("movies")
      .find({
        _id: { $in: movieIds },
        show: { $ne: false },
      })
      .project({
        year: 1,
        [`translations.${locale}.title`]: 1,
        [`translations.${locale}.poster_url`]: 1,
      })
      .toArray();

    const movieById = new Map(movies.map((m) => [m._id.toString(), m]));

    type Item = Movie & { mentionCount: number; persons: { name: string }[] };
    const items: Item[] = [];
    for (const row of byMovie) {
      const movie = movieById.get(row._id);
      if (!movie) continue;
      const names = (personIdsByMovieId.get(row._id) || [])
        .map((id) => personNameById.get(id))
        .filter(Boolean) as string[];
      items.push({
        ...movie,
        mentionCount: countByMovieId.get(row._id) ?? 0,
        persons: names.map((name) => ({ name })),
      } as Item);
    }

    // Secondary sort by title (locale)
    items.sort((a, b) => {
      const titleA = (a.translations as Record<string, { title?: string }>)?.[locale]?.title ?? "";
      const titleB = (b.translations as Record<string, { title?: string }>)?.[locale]?.title ?? "";
      if (a.mentionCount !== b.mentionCount) return b.mentionCount - a.mentionCount;
      return (titleA || "").localeCompare(titleB || "", locale);
    });

    const total = items.length;
    return NextResponse.json({
      items,
      pagination: {
        total,
        page: 1,
        limit: total,
        totalPages: 1,
      },
    });
  } catch (error) {
    console.error("Error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
