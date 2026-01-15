export const load = async ({ locals: { safeGetSession, userRole } }: { locals: App.Locals }) => {
	const { session, user } = await safeGetSession();
	return {
		session,
		user,
		userRole
	};
};

