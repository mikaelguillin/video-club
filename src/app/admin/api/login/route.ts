import { NextResponse } from "next/server";
import { validateCredentials, setSessionCookie, isAuthenticated } from "@/app/admin/auth";

export async function POST(req: Request) {
    const { username, password } = await req.json();
    if (validateCredentials(username, password)) {
        await setSessionCookie();
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
}

export async function GET() {
    if (await isAuthenticated()) {
        return NextResponse.json({ authenticated: true });
    } else {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
} 