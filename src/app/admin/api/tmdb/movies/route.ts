import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const language = searchParams.get('language') || 'en-US';
    const year = searchParams.get('year') || '';

    if (!query.trim()) {
        return NextResponse.json({ results: [] });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
    }

    const params = new URLSearchParams({ query, language });
    if (year) params.set('year', year);

    const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
        return NextResponse.json({ error: 'TMDB request failed' }, { status: res.status });
    }

    return NextResponse.json(await res.json());
}
