import { fail, type RequestEvent } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { assignRoleSchema } from '$lib/schemas/roles';
import {
	getUsersWithRoles,
	getAllRoles,
	assignRole,
	canManageUser
} from '$lib/server/roles';

export const load = async (event: RequestEvent) => {
	const { locals } = event;
	const { supabase, userRole } = locals;

	if (!userRole) {
		return {
			users: [],
			availableRoles: [],
			currentUserLevel: 0
		};
	}

	// Fetch users with roles (filtered by current user's level)
	const users = await getUsersWithRoles(userRole.level, supabase);

	// Fetch all roles and filter those below current user's level
	const allRoles = await getAllRoles(supabase);
	const availableRoles = allRoles.filter((role) => role.level < userRole.level);

	return {
		users,
		availableRoles,
		currentUserLevel: userRole.level
	};
};

export const actions = {
	assignRole: async (event: RequestEvent) => {
		const { request, locals } = event;
		const { supabase, userRole, safeGetSession } = locals;
		const { user } = await safeGetSession();

		if (!user || !userRole) {
			return fail(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod4(assignRoleSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { userId, roleId } = form.data;

		// Get target user's current role level
		const { data: targetUserRole } = await supabase
			.from('user_roles')
			.select('role:roles(level)')
			.eq('user_id', userId)
			.single();

		const targetLevel = (targetUserRole?.role as any)?.level ?? 0;

		// Get new role level
		const { data: newRole } = await supabase
			.from('roles')
			.select('level')
			.eq('id', roleId)
			.single();

		const newLevel = newRole?.level ?? 0;

		// Check if admin can manage this user
		if (!canManageUser(userRole.level, targetLevel)) {
			return message(form, 'You cannot manage users with equal or higher role levels', {
				status: 403
			});
		}

		// Check if admin can assign this role
		if (!canManageUser(userRole.level, newLevel)) {
			return message(form, 'You cannot assign roles equal to or higher than your own', {
				status: 403
			});
		}

		// Assign the role (triggers will sync to JWT)
		const result = await assignRole(userId, roleId, user.id, supabase);

		if (!result.success) {
			return message(form, result.error || 'Failed to assign role', { status: 500 });
		}

		return message(form, 'Role assigned successfully');
	}
};

