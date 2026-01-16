import { requireRole, ROLE_LEVELS } from '$lib/server/auth-guard';
import { getAuditLog } from '$lib/server/roles';
import { createSupabaseAdminClient } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Require admin role (level 90) to access audit trail
	requireRole(locals, ROLE_LEVELS.ADMIN);

	const { supabase, userRole } = locals;

	if (!userRole) {
		return {
			auditLog: {
				entries: [],
				totalCount: 0,
				currentPage: 1,
				totalPages: 0
			}
		};
	}

	// Get page number from URL query params, default to 1
	const pageParam = url.searchParams.get('page');
	const page = pageParam ? parseInt(pageParam, 10) : 1;
	const validPage = isNaN(page) || page < 1 ? 1 : page;

	// Create admin client for auth.admin operations
	const adminClient = createSupabaseAdminClient();

	// Fetch audit log with pagination
	const auditLog = await getAuditLog(supabase, adminClient, userRole.level, validPage, 20);

	return {
		auditLog
	};
};

