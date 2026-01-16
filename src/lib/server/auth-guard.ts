import { redirect } from '@sveltejs/kit';
import { ROLE_LEVELS } from '$lib/constants/roles';

/**
 * Require user to have minimum role level
 * Redirects to /dashboard if insufficient permissions
 */
export function requireRole(locals: App.Locals, minLevel: number): void {
	const userLevel = locals.userRole?.level ?? 0;
	if (userLevel < minLevel) {
		throw redirect(303, '/dashboard');
	}
}

/**
 * Re-export ROLE_LEVELS for convenient server-side access
 */
export { ROLE_LEVELS };

