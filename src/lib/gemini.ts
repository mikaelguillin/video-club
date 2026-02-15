import { GoogleGenAI } from "@google/genai";

const PROMPT = `You are analyzing a YouTube video (e.g. an interview) where a person talks about their favorite movies.
Extract every movie that the person mentions as a favorite, recommendation, or film they love.
For each movie, provide the original title in English and the release year if mentioned (otherwise omit year).
Return a valid JSON array only, no markdown or extra text. Each item: { "title": "Movie Title", "year": "1994" }.
If year is unknown, omit the "year" field. Example: [{"title": "The Godfather","year":"1972"},{"title": "Pulp Fiction"}]`;

export async function extractFavoriteMoviesFromYouTubeVideo(
  youtubeVideoUrl: string
): Promise<{ title: string; year?: string }[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: youtubeVideoUrl,
            },
          },
          { text: PROMPT },
        ],
      },
    ],
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Gemini returned no text");

  // Strip markdown code block if present
  let jsonStr = text;
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();

  const parsed = JSON.parse(jsonStr) as { title: string; year?: string }[];
  if (!Array.isArray(parsed))
    throw new Error("Gemini response is not an array");
  return parsed.filter(
    (item) => item && typeof item.title === "string" && item.title.trim()
  );
}
