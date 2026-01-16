/**
 * Role-Based Access Control (RBAC) Constants
 * Shared between client and server for role management
 */

/**
 * Role hierarchy levels - higher number = more permissions
 */
export const ROLE_LEVELS = {
	GUEST: 10,
	CONTRIBUTOR: 30,
	AUTHOR: 50,
	EDITOR: 70,
	ADMIN: 90,
	SUPERADMIN: 100
} as const;

/**
 * Role display names mapped by level
 */
export const ROLE_NAMES: Record<number, string> = {
	10: 'Guest',
	30: 'Contributor',
	50: 'Author',
	70: 'Editor',
	90: 'Admin',
	100: 'SuperAdmin'
} as const;

/**
 * Role descriptions mapped by level
 */
export const ROLE_DESCRIPTIONS: Record<number, string> = {
	10: 'Read-only access to backend',
	30: 'Submit content for review',
	50: 'Create and publish own content',
	70: 'Manage all content and media',
	90: 'User management and settings',
	100: 'Full system access'
} as const;

/**
 * Badge color variants for UI display
 * Maps to shadcn/ui badge component variants
 */
export const ROLE_BADGE_VARIANTS: Record<number, 'default' | 'secondary' | 'destructive' | 'outline'> = {
	10: 'secondary',
	30: 'outline',
	50: 'default',
	70: 'default',
	90: 'default',
	100: 'destructive'
} as const;


/**
 * Helper to get role description by level
 */
export function getRoleDescription(level: number): string {
	return ROLE_DESCRIPTIONS[level] || 'No description available';
}
