import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase, safeGetSession } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type');
	const next = url.searchParams.get('next') ?? '/dashboard';

	let error: string | null = null;
	let success = false;

	if (token_hash && type) {
		const { error: verifyError } = await supabase.auth.verifyOtp({
			type: type as any,
			token_hash
		});

		if (verifyError) {
			error = verifyError.message;
		} else {
			success = true;
			// Check if user is now authenticated
			const { session } = await safeGetSession();
			if (session) {
				redirect(303, next);
			}
		}
	} else {
		error = 'Invalid verification link';
	}

	return {
		success,
		error
	};
};

