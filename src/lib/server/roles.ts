import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Role, UserWithRole, AuditLogPage, AuditLogEntry } from '$lib/schemas/roles';

/**
 * Extract user role from JWT claims in user.app_metadata
 */
export function getUserRoleFromJWT(user: User | null): { name: string; level: number } | null {
	if (!user?.app_metadata?.role || !user?.app_metadata?.role_level) {
		return null;
	}

	return {
		name: user.app_metadata.role as string,
		level: user.app_metadata.role_level as number
	};
}

/**
 * Check if admin can manage target user based on role hierarchy
 * Admin can only manage users with lower role level
 */
export function canManageUser(adminLevel: number, targetLevel: number): boolean {
	return adminLevel > targetLevel;
}

/**
 * Assign role to a user (updates user_roles table, triggers auto-sync to JWT)
 */
export async function assignRole(
	userId: string,
	roleId: string,
	assignedBy: string,
	supabase: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
	try {
		// Check if user already has a role
		const { data: existingRole } = await supabase
			.from('user_roles')
			.select('id')
			.eq('user_id', userId)
			.single();

		if (existingRole) {
			// Update existing role
			const { error } = await supabase
				.from('user_roles')
				.update({
					role_id: roleId,
					updated_at: new Date().toISOString(),
					updated_by: assignedBy
				})
				.eq('user_id', userId);

			if (error) {
				console.error('Error updating user role:', error);
				return { success: false, error: error.message };
			}
		} else {
			// Insert new role
			const { error } = await supabase.from('user_roles').insert({
				user_id: userId,
				role_id: roleId,
				created_by: assignedBy,
				updated_by: assignedBy
			});

			if (error) {
				console.error('Error inserting user role:', error);
				return { success: false, error: error.message };
			}
		}

		return { success: true };
	} catch (err) {
		console.error('Unexpected error in assignRole:', err);
		return { success: false, error: 'An unexpected error occurred' };
	}
}

/**
 * Get all users with their roles, filtered by current user's role level
 * Admins cannot see SuperAdmins, etc.
 * @param currentUserLevel - The current user's role level
 * @param supabase - Regular Supabase client for database queries
 * @param adminClient - Admin Supabase client with service role for auth.admin operations
 */
export async function getUsersWithRoles(
	currentUserLevel: number,
	supabase: SupabaseClient,
	adminClient: SupabaseClient
): Promise<UserWithRole[]> {
	try {
		// Query user_roles with role information
		const { data: userRoles, error: userRolesError } = await supabase
			.from('user_roles')
			.select(
				`
				user_id,
				role:roles (
					id,
					name,
					description,
					level,
					created_at
				)
			`
			);

		if (userRolesError) {
			console.error('Error fetching user roles:', userRolesError);
			return [];
		}

		if (!userRoles || userRoles.length === 0) {
			return [];
		}

		// Fetch user details from auth.users via admin API
		const users: UserWithRole[] = [];

		for (const userRole of userRoles) {
			// Fetch individual user data using admin client
			const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(
				userRole.user_id
			);

			if (userError || !userData.user) {
				console.error(`Error fetching user ${userRole.user_id}:`, userError);
				continue;
			}

		const user = userData.user;

		users.push({
			id: user.id,
			email: user.email || '',
			user_metadata: {
				first_name: user.user_metadata?.first_name,
				last_name: user.user_metadata?.last_name,
				display_name: user.user_metadata?.display_name
			},
			role: (userRole.role as any) as Role
		});
	}

		return users;
	} catch (err) {
		console.error('Unexpected error in getUsersWithRoles:', err);
		return [];
	}
}

/**
 * Get all available roles from database
 */
export async function getAllRoles(supabase: SupabaseClient): Promise<Role[]> {
	try {
		const { data, error } = await supabase
			.from('roles')
			.select('*')
			.order('level', { ascending: true });

		if (error) {
			console.error('Error fetching roles:', error);
			return [];
		}

		return data || [];
	} catch (err) {
		console.error('Unexpected error in getAllRoles:', err);
		return [];
	}
}

/**
 * Get paginated audit log with user and role details
 * @param supabase - Regular Supabase client for database queries
 * @param adminClient - Admin Supabase client with service role for auth.admin operations
 * @param userLevel - Current user's role level (for future filtering if needed)
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of entries per page
 */
export async function getAuditLog(
	supabase: SupabaseClient,
	adminClient: SupabaseClient,
	userLevel: number,
	page: number = 1,
	pageSize: number = 20
): Promise<AuditLogPage> {
	try {
		const offset = (page - 1) * pageSize;

		// Get total count
		const { count, error: countError } = await supabase
			.from('user_roles_audit')
			.select('*', { count: 'exact', head: true });

		if (countError) {
			console.error('Error fetching audit count:', countError);
			return { entries: [], totalCount: 0, currentPage: page, totalPages: 0 };
		}

		const totalCount = count || 0;
		const totalPages = Math.ceil(totalCount / pageSize);

		// Get audit records with role information
		const { data: auditData, error: auditError } = await supabase
			.from('user_roles_audit')
			.select(
				`
				id,
				user_role_id,
				action,
				role_id_old,
				role_id_new,
				changed_by,
				changed_at,
				user_roles!inner (
					user_id
				),
				old_role:roles!user_roles_audit_role_id_old_fkey (
					name,
					level
				),
				new_role:roles!user_roles_audit_role_id_new_fkey (
					name,
					level
				)
			`
			)
			.order('changed_at', { ascending: false })
			.range(offset, offset + pageSize - 1);

		if (auditError) {
			console.error('Error fetching audit records:', auditError);
			return { entries: [], totalCount: 0, currentPage: page, totalPages: 0 };
		}

		if (!auditData || auditData.length === 0) {
			return { entries: [], totalCount, currentPage: page, totalPages };
		}

		// Collect all unique user IDs (affected users and changers)
		const userIds = new Set<string>();
		auditData.forEach((record: any) => {
			if (record.user_roles?.user_id) {
				userIds.add(record.user_roles.user_id);
			}
			if (record.changed_by) {
				userIds.add(record.changed_by);
			}
		});

		// Batch fetch all users
		const userMap = new Map<string, { email: string; display_name: string }>();
		const userIdArray = Array.from(userIds);

		for (const userId of userIdArray) {
			const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId);
			if (!userError && userData.user) {
				const user = userData.user;
			const displayName =
				user.user_metadata?.display_name ||
				(user.user_metadata?.first_name && user.user_metadata?.last_name
					? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
					: null);
				userMap.set(userId, {
					email: user.email || '',
					display_name: displayName || ''
				});
			}
		}

		// Build audit log entries
		const entries: AuditLogEntry[] = auditData.map((record: any) => {
			const userId = record.user_roles?.user_id;
			const user = userMap.get(userId);
			const changedBy = record.changed_by ? userMap.get(record.changed_by) : null;

			return {
				id: record.id,
				user_id: userId,
				user_email: user?.email || null,
				user_display_name: user?.display_name || null,
				action: record.action,
				old_role_name: record.old_role?.name || null,
				new_role_name: record.new_role?.name || null,
				old_role_level: record.old_role?.level || null,
				new_role_level: record.new_role?.level || null,
				changed_by_id: record.changed_by,
				changed_by_email: changedBy?.email || null,
				changed_by_display_name: changedBy?.display_name || (record.changed_by ? 'System' : null),
				changed_at: record.changed_at
			};
		});

		return {
			entries,
			totalCount,
			currentPage: page,
			totalPages
		};
	} catch (err) {
		console.error('Unexpected error in getAuditLog:', err);
		return { entries: [], totalCount: 0, currentPage: page, totalPages: 0 };
	}
}
