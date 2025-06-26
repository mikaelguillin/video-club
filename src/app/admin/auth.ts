import { cookies } from "next/headers";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";
const SESSION_COOKIE = "admin_session";

export function validateCredentials(username: string, password: string) {
    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// These functions must be used in Route Handlers or Server Actions
export async function setSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, "1", { httpOnly: true, path: "/admin", maxAge: 60 * 60 });
}

export async function clearSessionCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE)?.value === "1";
} 