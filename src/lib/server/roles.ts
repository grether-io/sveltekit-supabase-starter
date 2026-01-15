import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Role, UserWithRole } from '$lib/schemas/roles';

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
 * Check if user has minimum required role level
 */
export function hasMinimumRole(userLevel: number | undefined, requiredLevel: number): boolean {
	return (userLevel ?? 0) >= requiredLevel;
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
 */
export async function getUsersWithRoles(
	currentUserLevel: number,
	supabase: SupabaseClient
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
			)
			.lt('roles.level', currentUserLevel) // Filter out equal or higher level users
			.order('roles.level', { ascending: false });

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
			// Fetch individual user data
			const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
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
					firstname: user.user_metadata?.firstname,
					lastname: user.user_metadata?.lastname,
					display_name: user.user_metadata?.display_name
				},
				role: userRole.role as Role
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
 * Get user's role from database (fallback if JWT claims missing)
 */
export async function getUserRoleFromDB(
	userId: string,
	supabase: SupabaseClient
): Promise<{ name: string; level: number } | null> {
	try {
		const { data, error } = await supabase
			.from('user_roles')
			.select(
				`
				role:roles (
					name,
					level
				)
			`
			)
			.eq('user_id', userId)
			.single();

		if (error || !data?.role) {
			return null;
		}

		return data.role as { name: string; level: number };
	} catch (err) {
		console.error('Error in getUserRoleFromDB:', err);
		return null;
	}
}

