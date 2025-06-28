import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/mongodb';
import type { User } from '@/types';

async function getUser(username: string): Promise<User | null> {
    try {
        const { mongoClient } = await connectToDB();
        if (!mongoClient) {
            console.error('Failed to connect to database');
            return null;
        }

        const db = mongoClient.db('video-club');
        const user = await db.collection('users').findOne({ username });

        if (user) {
            return {
                _id: user._id.toString(),
                username: user.username,
                password: user.password,
                email: user.email,
                role: user.role
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching user from database:', error);
        return null;
    }
}

export const authConfig = {
    pages: {
        signIn: '/admin/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const pathname = nextUrl.pathname;

            // Handle admin authentication
            if (isOnAdmin) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && pathname === '/admin/login') {
                return Response.redirect(new URL('/admin', nextUrl));
            }
            return true;
        },
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                try {
                    const parsedCredentials = z
                        .object({ username: z.string().min(1), password: z.string().min(1) })
                        .safeParse(credentials);

                    if (parsedCredentials.success) {
                        const { username, password } = parsedCredentials.data;
                        const user = await getUser(username);
                        if (!user) return null;

                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        if (passwordsMatch) {
                            return {
                                id: user._id,
                                username: user.username,
                                email: user.email,
                                role: user.role,
                            };
                        }
                    }
                    return null;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
} satisfies NextAuthConfig; 