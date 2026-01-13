import { z } from 'zod';

export const signupSchema = z.object({
	email: z.email('Please enter a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	firstname: z.string().min(1, 'First name is required'),
	lastname: z.string().min(1, 'Last name is required')
});

export const loginSchema = z.object({
	email: z.email('Please enter a valid email address'),
	password: z.string().min(1, 'Password is required')
});

export const twoFactorSchema = z.object({
	code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits')
});

export const forgotPasswordSchema = z.object({
	email: z.email('Please enter a valid email address')
});

export const resetPasswordSchema = z
	.object({
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export const updateProfileSchema = z.object({
	firstname: z.string().min(1, 'First name is required'),
	lastname: z.string().min(1, 'Last name is required')
});

export const updateEmailSchema = z.object({
	email: z.email('Please enter a valid email address')
});

export const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string()
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export const verifyTwoFactorSetupSchema = z.object({
	code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits')
});

