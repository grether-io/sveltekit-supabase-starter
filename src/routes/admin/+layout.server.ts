import { requireRole, ROLE_LEVELS } from '$lib/server/auth-guard';
import type { RequestEvent } from '@sveltejs/kit';

export const load = async (event: RequestEvent) => {
	// Require admin role (level 90) to access admin section
	requireRole(event.locals, ROLE_LEVELS.ADMIN);

	return {};
};

