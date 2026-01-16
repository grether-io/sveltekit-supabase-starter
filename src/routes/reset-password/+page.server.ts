import { redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { resetPasswordSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	// Check if we have a token in the URL
	const token = url.searchParams.get('token');
	const type = url.searchParams.get('type');

	if (!token || type !== 'recovery') {
		redirect(303, '/forgot-password?error=invalid');
	}

	// Verify session is in recovery state
	const { data: { session }, error } = await supabase.auth.getSession();

	if (error || !session) {
		redirect(303, '/forgot-password?error=expired');
	}

	const form = await superValidate(zod4(resetPasswordSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(resetPasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { password } = form.data;

		const { error } = await supabase.auth.updateUser({
			password: password as string
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		redirect(303, '/login');
	}
};

