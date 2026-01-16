import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Authentication is handled by (authenticated)/+layout.server.ts
	return {};
};

