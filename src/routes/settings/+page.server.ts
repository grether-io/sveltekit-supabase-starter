import { redirect, fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import {
	updateProfileSchema,
	updateEmailSchema,
	updatePasswordSchema,
	verifyTwoFactorSetupSchema
} from '$lib/schemas/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
	const { session, user } = await safeGetSession();

	if (!session) {
		redirect(303, '/login');
	}

	// Load MFA status
	const { data: factors } = await supabase.auth.mfa.listFactors();
	const mfaEnabled = factors && factors.totp.length > 0;

	const profileForm = await superValidate(
		{
			firstname: user?.user_metadata?.firstname || '',
			lastname: user?.user_metadata?.lastname || ''
		},
		zod4(updateProfileSchema)
	);

	const emailForm = await superValidate(
		{
			email: user?.email || ''
		},
		zod4(updateEmailSchema)
	);

	const passwordForm = await superValidate(zod4(updatePasswordSchema));
	const twoFactorForm = await superValidate(zod4(verifyTwoFactorSetupSchema));

	return {
		user,
		mfaEnabled,
		profileForm,
		emailForm,
		passwordForm,
		twoFactorForm
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(updateProfileSchema));

		if (!form.valid) {
			return fail(400, { profileForm: form });
		}

		const { firstname, lastname } = form.data;

		const { error } = await supabase.auth.updateUser({
			data: {
				firstname,
				lastname,
				display_name: `${firstname} ${lastname}`
			}
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		return message(form, 'Profile updated successfully');
	},

	updateEmail: async ({ request, locals: { supabase }, url }) => {
		const form = await superValidate(request, zod4(updateEmailSchema));

		if (!form.valid) {
			return fail(400, { emailForm: form });
		}

		const { error } = await supabase.auth.updateUser(
			{ email: form.data.email },
			{
				emailRedirectTo: `${url.origin}/verify-email`
			}
		);

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		return message(form, 'Check your new email for verification link');
	},

	updatePassword: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(updatePasswordSchema));

		if (!form.valid) {
			return fail(400, { passwordForm: form });
		}

		// Verify current password by attempting to sign in
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user?.email) {
			return message(form, 'User not found', { status: 400 });
		}

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email: user.email,
			password: form.data.currentPassword as string
		});

		if (signInError) {
			return message(form, 'Current password is incorrect', { status: 400 });
		}

		const { error } = await supabase.auth.updateUser({
			password: form.data.newPassword as string
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		return message(form, 'Password updated successfully');
	},

	enrollMfa: async ({ locals: { supabase } }) => {
		const { data, error } = await supabase.auth.mfa.enroll({
			factorType: 'totp'
		});

		if (error) {
			return fail(400, { mfaError: error.message });
		}

		return {
			mfaEnrollment: {
				id: data.id,
				qr: data.totp.qr_code,
				secret: data.totp.secret,
				uri: data.totp.uri
			}
		};
	},

	verifyMfa: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(verifyTwoFactorSetupSchema));

		if (!form.valid) {
			return fail(400, { twoFactorForm: form });
		}

		const formData = await request.formData();
		const factorId = formData.get('factorId') as string;

		if (!factorId) {
			return message(form, 'Invalid factor ID', { status: 400 });
		}

		const { data, error } = await supabase.auth.mfa.challengeAndVerify({
			factorId,
			code: form.data.code as string
		});

		if (error) {
			return message(form, error.message, { status: 400 });
		}

		return message(form, '2FA enabled successfully');
	},

	disableMfa: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const factorId = formData.get('factorId') as string;

		if (!factorId) {
			return fail(400, { mfaError: 'Invalid factor ID' });
		}

		const { error } = await supabase.auth.mfa.unenroll({ factorId });

		if (error) {
			return fail(400, { mfaError: error.message });
		}

		return { mfaDisabled: true };
	}
};

