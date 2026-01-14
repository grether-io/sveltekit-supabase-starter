<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { applyAction, enhance as svelteEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Button } from "$lib/components/ui/button";
	import { Card } from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Tabs from "$lib/components/ui/tabs";
	import {zod4Client} from "sveltekit-superforms/adapters";
	import {
		updateEmailSchema,
		updatePasswordSchema,
		updateProfileSchema,
		verifyTwoFactorSetupSchema
	} from '$lib/schemas/auth';

	let { data, form: actionResult } = $props();

	const { form: profileFormData, errors: profileErrors, enhance: profileEnhance, delayed: profileDelayed, message: profileMessage, tainted: profileTainted, constraints: profileConstraints, allErrors: profileAllErrors } = superForm(data.profileForm, {
		id: 'profile',
		resetForm: false,
		invalidateAll: false,
		validators: zod4Client(updateProfileSchema)
	});
	const { form: emailFormData, errors: emailErrors, enhance: emailEnhance, delayed: emailDelayed, message: emailMessage, tainted: emailTainted, constraints: emailConstraints, allErrors: emailAllErrors } = superForm(data.emailForm, {
		id: 'email',
		resetForm: false,
		invalidateAll: 'force',
		validators: zod4Client(updateEmailSchema)
	});
	const { form: passwordFormData, errors: passwordErrors, enhance: passwordEnhance, delayed: passwordDelayed, message: passwordMessage, tainted: passwordTainted, constraints: passwordConstraints, allErrors: passwordAllErrors } = superForm(data.passwordForm, {
		id: 'password',
		resetForm: true,
		invalidateAll: false,
		validators: zod4Client(updatePasswordSchema)
	});
	const { form: twoFactorFormData, errors: twoFactorErrors, enhance: twoFactorEnhance, delayed: twoFactorDelayed, message: twoFactorMessage, constraints: twoFactorConstraints, allErrors: twoFactorAllErrors } = superForm(data.twoFactorForm, {
		id: 'twoFactor',
		resetForm: false,
		invalidateAll: 'force',
		validators: zod4Client(verifyTwoFactorSetupSchema)
	});

	let activeTab = $state('profile');
	let mfaEnrollment = $state<any>(null);
	let isEnrolling = $state(false);

	// Show toast notifications for profile updates
	$effect(() => {
		if ($profileMessage) {
			if ($profileMessage.includes('success')) {
				toast.success($profileMessage);
			} else {
				toast.error($profileMessage);
			}
		}
	});

	// Show toast notifications for email updates
	$effect(() => {
		if ($emailMessage) {
			if ($emailMessage.includes('Check your')) {
				toast.success($emailMessage);
			} else {
				toast.error($emailMessage);
			}
		}
	});

	// Show toast notifications for password updates
	$effect(() => {
		if ($passwordMessage) {
			if ($passwordMessage.includes('success')) {
				toast.success($passwordMessage);
			} else {
				toast.error($passwordMessage);
			}
		}
	});

	// Show toast notifications for 2FA updates
	$effect(() => {
		if ($twoFactorMessage) {
			if ($twoFactorMessage.includes('success')) {
				toast.success($twoFactorMessage);
			} else {
				toast.error($twoFactorMessage);
			}
		}
	});

	// Handle MFA enrollment result
	$effect(() => {
		if (actionResult?.mfaEnrollment) {
			mfaEnrollment = actionResult.mfaEnrollment;
			isEnrolling = true;
		}
		if (actionResult?.mfaDisabled) {
			invalidateAll();
		}
	});
</script>

<div class="min-h-screen bg-gray-50 px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-3xl font-bold text-gray-900">Settings</h1>
			<a href="/dashboard">
				<Button variant="outline">Back to Dashboard</Button>
			</a>
		</div>

		<Card class="p-8">
			<Tabs.Root bind:value={activeTab}>
				<Tabs.List class="mb-6 flex gap-4 border-b border-gray-200">
					<Tabs.Trigger
						value="profile"
						class="border-b-2 px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-600"
					>
						Profile
					</Tabs.Trigger>
					<Tabs.Trigger
						value="email"
						class="border-b-2 px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-600"
					>
						Email
					</Tabs.Trigger>
					<Tabs.Trigger
						value="password"
						class="border-b-2 px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-600"
					>
						Password
					</Tabs.Trigger>
					<Tabs.Trigger
						value="2fa"
						class="border-b-2 px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-600"
					>
						Two-Factor Auth
					</Tabs.Trigger>
				</Tabs.List>

				<!-- Profile Tab -->
				<Tabs.Content value="profile">

					<form
						method="POST"
						action="?/updateProfile"
						use:profileEnhance novalidate
						class="space-y-4"
					>
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="firstname">First name</Label>
								<Input
									id="firstname"
									name="firstname"
									bind:value={$profileFormData.firstname}
									{...$profileConstraints.firstname}
								/>
								{#if $profileErrors.firstname}
									<p class="text-sm text-destructive">{$profileErrors.firstname[0]}</p>
								{/if}
							</div>
							<div class="space-y-2">
								<Label for="lastname">Last name</Label>
								<Input
									id="lastname"
									name="lastname"
									bind:value={$profileFormData.lastname}
									{...$profileConstraints.lastname}
								/>
								{#if $profileErrors.lastname}
									<p class="text-sm text-destructive">{$profileErrors.lastname[0]}</p>
								{/if}
							</div>
						</div>

						<Button type="submit" disabled={$profileDelayed || !$profileTainted || $profileAllErrors.length > 0}>
							Update Profile
						</Button>
					</form>
				</Tabs.Content>

				<!-- Email Tab -->
				<Tabs.Content value="email">

					<form method="POST" action="?/updateEmail" use:emailEnhance novalidate class="space-y-4">
						<div class="space-y-2">
							<Label for="email">Email address</Label>
							<Input
								id="email"
								name="email"
								type="email"
								bind:value={$emailFormData.email}
								{...$emailConstraints.email}
							/>
							{#if $emailErrors.email}
								<p class="text-sm text-destructive">{$emailErrors.email[0]}</p>
							{/if}
						</div>

						<p class="text-sm text-gray-600">
							You'll receive a verification email at your new address.
						</p>

						<Button type="submit" disabled={$emailDelayed || !$emailTainted || $emailAllErrors.length > 0}>
							Update Email
						</Button>
					</form>
				</Tabs.Content>

				<!-- Password Tab -->
				<Tabs.Content value="password">

					<form method="POST" action="?/updatePassword" use:passwordEnhance novalidate class="space-y-4">
						<div class="space-y-2">
							<Label for="currentPassword">Current password</Label>
							<Input
								id="currentPassword"
								name="currentPassword"
								type="password"
								bind:value={$passwordFormData.currentPassword}
								{...$passwordConstraints.currentPassword}
							/>
							{#if $passwordErrors.currentPassword}
								<p class="text-sm text-destructive">{$passwordErrors.currentPassword[0]}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="newPassword">New password</Label>
							<Input
								id="newPassword"
								name="newPassword"
								type="password"
								bind:value={$passwordFormData.newPassword}
								{...$passwordConstraints.newPassword}
							/>
							{#if $passwordErrors.newPassword}
								<p class="text-sm text-destructive">{$passwordErrors.newPassword[0]}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="confirmPassword">Confirm new password</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								bind:value={$passwordFormData.confirmPassword}
								{...$passwordConstraints.confirmPassword}
							/>
							{#if $passwordErrors.confirmPassword}
								<p class="text-sm text-destructive">{$passwordErrors.confirmPassword[0]}</p>
							{/if}
						</div>

						<Button type="submit" disabled={$passwordDelayed || !$passwordTainted || $passwordAllErrors.length > 0}>
							Update Password
						</Button>
					</form>
				</Tabs.Content>

				<!-- 2FA Tab -->
				<Tabs.Content value="2fa">
					{#if data.mfaEnabled && !isEnrolling}
						<p>
							Two-factor authentication is enabled on your account.
						</p>

						<form
							method="POST"
							action="?/disableMfa"
							use:svelteEnhance={async ({ formData }) => {
								const { data: factors } = await data.user
									? { data: { totp: [{ id: '' }] } }
									: { data: null };
								if (factors?.totp?.[0]) {
									formData.append('factorId', factors.totp[0].id);
								}
								return async ({ result }) => {
									await applyAction(result);
									await invalidateAll();
								};
							}}
						>
							<Button type="submit" variant="destructive">
								Disable 2FA
							</Button>
						</form>
					{:else if isEnrolling && mfaEnrollment}

						<div class="space-y-4">
							<h3 class="text-lg font-semibold">Set up Two-Factor Authentication</h3>
							<p class="text-sm text-gray-600">
								Scan this QR code with your authenticator app, then enter the code to verify.
							</p>

							<div class="flex justify-center py-4">
								<div class="rounded-lg border border-gray-200 bg-white p-4">
									{@html mfaEnrollment.qr}
								</div>
							</div>

							<div class="rounded-lg bg-gray-50 p-4">
								<p class="text-xs font-medium text-gray-700">Manual Entry Code:</p>
								<code class="text-sm text-gray-900">{mfaEnrollment.secret}</code>
							</div>

							<form method="POST" action="?/verifyMfa" use:twoFactorEnhance novalidate class="space-y-4">
								<input type="hidden" name="factorId" value={mfaEnrollment.id} />

								<div class="space-y-2">
									<Label for="code">Verification code</Label>
									<Input
										id="code"
										name="code"
										bind:value={$twoFactorFormData.code}
										placeholder="000000"
										{...$twoFactorConstraints.code}
									/>
									{#if $twoFactorErrors.code}
										<p class="text-sm text-destructive">{$twoFactorErrors.code[0]}</p>
									{/if}
								</div>

								<div class="flex gap-2">
									<Button type="submit" disabled={$twoFactorDelayed || $twoFactorAllErrors.length > 0}>
										Verify & Enable
									</Button>
									<Button
										type="button"
										variant="outline"
										onclick={() => {
											isEnrolling = false;
											mfaEnrollment = null;
										}}
									>
										Cancel
									</Button>
								</div>
							</form>
						</div>
					{:else}
						<p>
							Two-factor authentication is not enabled. Add an extra layer of security to your account.
						</p>

						<form method="POST" action="?/enrollMfa" use:svelteEnhance>
							<Button type="submit">
								Enable 2FA
							</Button>
						</form>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		</Card>
	</div>
</div>

