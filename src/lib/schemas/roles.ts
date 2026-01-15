import { z } from 'zod';

/**
 * Schema for assigning a role to a user
 */
export const assignRoleSchema = z.object({
	userId: z.string().uuid('Invalid user ID'),
	roleId: z.string().uuid('Invalid role ID')
});

/**
 * Role type definition
 */
export type Role = {
	id: string;
	name: string;
	description: string;
	level: number;
	created_at: string;
};

/**
 * User role assignment type
 */
export type UserRole = {
	id: string;
	user_id: string;
	role_id: string;
	role: Role;
	created_at: string;
	updated_at: string | null;
	created_by: string | null;
	updated_by: string | null;
};

/**
 * User with role information (for admin user management)
 */
export type UserWithRole = {
	id: string;
	email: string;
	user_metadata: {
		firstname?: string;
		lastname?: string;
		display_name?: string;
	};
	role: Role;
};

/**
 * Audit trail record type
 */
export type UserRoleAudit = {
	id: string;
	user_role_id: string | null;
	action: string;
	role_id_old: string | null;
	role_id_new: string | null;
	changed_by: string | null;
	changed_at: string;
};

