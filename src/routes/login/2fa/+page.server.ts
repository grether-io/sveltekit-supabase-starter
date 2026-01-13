import { redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { twoFactorSchema } from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
	const { session } = await safeGetSession();

	// Redirect if already authenticated
	if (session) {
		redirect(303, '/dashboard');
	}

	// Check if user is in pending MFA state
	const pendingUserId = cookies.get('pending_mfa_user');
	if (!pendingUserId) {
		redirect(303, '/login');
	}

	const form = await superValidate(zod4(twoFactorSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase }, cookies }) => {
		const form = await superValidate(request, zod4(twoFactorSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { code } = form.data;
		const pendingUserId = cookies.get('pending_mfa_user');

		if (!pendingUserId) {
			return message(form, 'Session expired. Please log in again.', { status: 400 });
		}

		// Get the challenge ID - in real implementation, this should be stored with the user ID
		const { data: factors } = await supabase.auth.mfa.listFactors();

		if (!factors || factors.totp.length === 0) {
			return message(form, '2FA not set up for this account', { status: 400 });
		}

		const factorId = factors.totp[0].id;

		const challenge = await supabase.auth.mfa.challenge({ factorId });

		if (challenge.error) {
			return message(form, challenge.error.message, { status: 400 });
		}

		const { error } = await supabase.auth.mfa.verify({
			factorId,
			challengeId: challenge.data.id,
			code: code as string
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		// Clear the pending MFA cookie
		cookies.delete('pending_mfa_user', { path: '/' });

		redirect(303, '/dashboard');
	}
};

