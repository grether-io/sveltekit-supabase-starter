export const load = async ({ locals: { safeGetSession } }: { locals: App.Locals }) => {
	const { session, user } = await safeGetSession();
	return {
		session,
		user
	};
};

