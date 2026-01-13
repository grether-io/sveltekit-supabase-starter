import { redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();

	// Redirect if already authenticated
	if (session) {
		redirect(303, '/dashboard');
	}

	const form = await superValidate(zod4(loginSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase }, cookies }) => {
		const form = await superValidate(request, zod4(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password } = form.data;

		const { data, error } = await supabase.auth.signInWithPassword({
			email: email as string,
			password: password as string
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		// Check if MFA is required
		if (data.user && !data.session) {
			// Store user ID temporarily for 2FA verification
			cookies.set('pending_mfa_user', data.user.id, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 10 // 10 minutes
			});
			redirect(303, '/login/2fa');
		}

		redirect(303, '/dashboard');
	}
};

