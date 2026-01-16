import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { PRIVATE_SUPABASE_SERVICE_ROLE } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';

/**
 * Create a Supabase admin client with service role key
 * USE WITH CAUTION: This client bypasses Row Level Security (RLS)
 * Only use for admin operations like auth.admin.* methods
 */
export function createSupabaseAdminClient() {
	return createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

export const createSupabaseServerClient: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		// Check if session is older than 7 days (security policy: session timeout)
		const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
		const sevenDays = 7 * 24 * 60 * 60 * 1000;
		if (sessionAge > sevenDays) {
			// Session expired - sign out silently
			await event.locals.supabase.auth.signOut();
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

