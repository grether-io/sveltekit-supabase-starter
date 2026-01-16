import { redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { signupSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();

	// Redirect if already authenticated
	if (session) {
		redirect(303, '/dashboard');
	}

	const form = await superValidate(zod4(signupSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(signupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password, first_name, last_name } = form.data;

		const { error } = await supabase.auth.signUp({
			email: email as string,
			password: password as string,
			options: {
				data: {
					first_name,
					last_name,
					display_name: `${first_name} ${last_name}`
				}
			}
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		redirect(303, '/login');
	}
};

