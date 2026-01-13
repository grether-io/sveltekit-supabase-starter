import { redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { forgotPasswordSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ locals: { safeGetSession }, url }) => {

	const { session } = await safeGetSession();
	// Redirect if already authenticated

	if (session) {
		redirect(303, '/dashboard');
	}

	const form = await superValidate(zod4(forgotPasswordSchema));
	return { form };
};
export const actions: Actions = {
	default: async ({ request, locals: { supabase }, url }) => {
		const form = await superValidate(request, zod4(forgotPasswordSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { email } = form.data;
		const redirectUrl = `${url.origin}/reset-password`;

		const { error } = await supabase.auth.resetPasswordForEmail(email as string, {
			redirectTo: redirectUrl
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		return message(form, 'Check your email for the password reset link');
	}
};
