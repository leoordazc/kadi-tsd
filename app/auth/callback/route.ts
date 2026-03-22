import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = await cookies(); // ← IMPORTANTE: await aquí
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        try {
                            cookieStore.set({ name, value, ...options });
                        } catch (error) {
                            console.error('Error setting cookie:', error);
                        }
                    },
                    remove(name: string, options: any) {
                        try {
                            cookieStore.set({ name, value: '', ...options });
                        } catch (error) {
                            console.error('Error removing cookie:', error);
                        }
                    },
                },
            }
        );

        await supabase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin));
}