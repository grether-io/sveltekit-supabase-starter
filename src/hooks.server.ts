import { createSupabaseServerClient } from '$lib/server/supabase';
import { sequence } from '@sveltejs/kit/hooks';
import { getUserRoleFromJWT } from '$lib/server/roles';
import type { Handle } from '@sveltejs/kit';

/**
 * Authorization hook - extracts user role from JWT and adds to locals
 */
const authorizationHook: Handle = async ({ event, resolve }) => {
	// Get session and user
	const { user } = await event.locals.safeGetSession();

	// Extract role from JWT claims
	const userRole = getUserRoleFromJWT(user);
	event.locals.userRole = userRole;

	// Add helper function to check role level
	event.locals.hasRole = (minLevel: number): boolean => {
		return (userRole?.level ?? 0) >= minLevel;
	};

	return resolve(event);
};

export const handle = sequence(createSupabaseServerClient, authorizationHook);

