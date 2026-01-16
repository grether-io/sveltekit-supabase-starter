<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { applyAction, enhance as svelteEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Button } from "$lib/components/ui/button";
	import { Card } from "$lib/components/ui/card";
	import { Input } from "$lib/components/ui/input";
	import { Badge } from "$lib/components/ui/badge";
	import * as Field from "$lib/components/ui/field";
	import * as Tabs from "$lib/components/ui/tabs";
	import {zod4Client} from "sveltekit-superforms/adapters";
	import {
		updateEmailSchema,
		updatePasswordSchema,
		updateProfileSchema,
		verifyTwoFactorSetupSchema
	} from '$lib/schemas/auth';
	import { ROLE_BADGE_VARIANTS, getRoleDescription } from '$lib/constants/roles';

	let { data, form: actionResult } = $props();

	const { form: profileFormData, errors: profileErrors, enhance: profileEnhance, delayed: profileDelayed, message: profileMessage, tainted: profileTainted, constraints: profileConstraints, allErrors: profileAllErrors } = $derived.by(() =>
		superForm(data.profileForm, {
			id: 'profile',
			resetForm: false,
			invalidateAll: false,
			validators: zod4Client(updateProfileSchema)
		})
	);
	const { form: emailFormData, errors: emailErrors, enhance: emailEnhance, delayed: emailDelayed, message: emailMessage, tainted: emailTainted, constraints: emailConstraints, allErrors: emailAllErrors } = $derived.by(() =>
		superForm(data.emailForm, {
			id: 'email',
			resetForm: false,
			invalidateAll: 'force',
			validators: zod4Client(updateEmailSchema)
		})
	);
	const { form: passwordFormData, errors: passwordErrors, enhance: passwordEnhance, delayed: passwordDelayed, message: passwordMessage, tainted: passwordTainted, constraints: passwordConstraints, allErrors: passwordAllErrors } = $derived.by(() =>
		superForm(data.passwordForm, {
			id: 'password',
			resetForm: true,
			invalidateAll: false,
			validators: zod4Client(updatePasswordSchema)
		})
	);
	const { form: twoFactorFormData, errors: twoFactorErrors, enhance: twoFactorEnhance, delayed: twoFactorDelayed, message: twoFactorMessage, constraints: twoFactorConstraints, allErrors: twoFactorAllErrors } = $derived.by(() =>
		superForm(data.twoFactorForm, {
			id: 'twoFactor',
			resetForm: false,
			invalidateAll: 'force',
			validators: zod4Client(verifyTwoFactorSetupSchema)
		})
	);

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

<div class="min-h-screen px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Settings</h1>
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
						value="role"
						class="border-b-2 px-4 py-2 text-sm font-medium transition-colors data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-600"
					>
						Role
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
					>
						<Field.Group>
							<Field.Set>
								<Field.Legend>Update your profile</Field.Legend>
								<Field.Description>
									Change your profile information
								</Field.Description>
								<Field.Group>
									<div class="grid grid-cols-2 gap-4">
										<Field.Field>
											<Field.Label for="settings-firstname">First name</Field.Label>
											<Input
												id="settings-firstname"
												name="firstname"
												bind:value={$profileFormData.firstname}
												{...$profileConstraints.firstname}
											/>
											<Field.Error errors={$profileErrors.firstname?.map(msg => ({ message: msg }))} />
										</Field.Field>

										<Field.Field>
											<Field.Label for="settings-lastname">Last name</Field.Label>
											<Input
												id="settings-lastname"
												name="lastname"
												bind:value={$profileFormData.lastname}
												{...$profileConstraints.lastname}
											/>
											<Field.Error errors={$profileErrors.lastname?.map(msg => ({ message: msg }))} />
										</Field.Field>
									</div>
								</Field.Group>
							</Field.Set>

							<Field.Field orientation="horizontal">
								<Button type="submit" disabled={$profileDelayed || !$profileTainted || $profileAllErrors.length > 0}>
									Update Profile
								</Button>
							</Field.Field>
						</Field.Group>
					</form>
				</Tabs.Content>

				<!-- Email Tab -->
				<Tabs.Content value="email">
					<form method="POST" action="?/updateEmail" use:emailEnhance novalidate>
						<Field.Group>
							<Field.Set>
								<Field.Legend>Update your email</Field.Legend>
								<Field.Description>
									You'll receive a verification email at your new address
								</Field.Description>
								<Field.Group>
									<Field.Field>
										<Field.Label for="settings-email">Email address</Field.Label>
										<Input
											id="settings-email"
											name="email"
											type="email"
											bind:value={$emailFormData.email}
											{...$emailConstraints.email}
										/>
										<Field.Error errors={$emailErrors.email?.map(msg => ({ message: msg }))} />
									</Field.Field>
								</Field.Group>
							</Field.Set>

							<Field.Field orientation="horizontal">
								<Button type="submit" disabled={$emailDelayed || !$emailTainted || $emailAllErrors.length > 0}>
									Update Email
								</Button>
							</Field.Field>
						</Field.Group>
					</form>
				</Tabs.Content>

				<!-- Role Tab -->
				<Tabs.Content value="role">
					<div class="space-y-6">
						<div>
							<h3 class="text-lg font-medium">Your Role</h3>
							<p class="text-sm text-muted-foreground mt-1">
								Your current role and permissions in the system.
							</p>
						</div>

						{#if data.userRole}
							<div class="flex items-center gap-3">
								<Badge variant={ROLE_BADGE_VARIANTS[data.userRole.level]} class="text-base px-4 py-2">
									{data.userRole.name}
								</Badge>
							</div>
							<p class="text-sm text-muted-foreground">
								{getRoleDescription(data.userRole.level)}
							</p>
						{:else}
							<p class="text-sm text-muted-foreground">No role assigned.</p>
						{/if}
					</div>
				</Tabs.Content>

				<!-- Two-Factor Auth Tab -->
				<Tabs.Content value="password">
					<form method="POST" action="?/updatePassword" use:passwordEnhance novalidate>
						<Field.Group>
							<Field.Set>
								<Field.Legend>Change your password</Field.Legend>
								<Field.Description>
									Enter your current password and choose a new one
								</Field.Description>
								<Field.Group>
									<Field.Field>
										<Field.Label for="settings-currentPassword">Current password</Field.Label>
										<Input
											id="settings-currentPassword"
											name="currentPassword"
											type="password"
											bind:value={$passwordFormData.currentPassword}
											{...$passwordConstraints.currentPassword}
										/>
										<Field.Error errors={$passwordErrors.currentPassword?.map(msg => ({ message: msg }))} />
									</Field.Field>

									<Field.Field>
										<Field.Label for="settings-newPassword">New password</Field.Label>
										<Input
											id="settings-newPassword"
											name="newPassword"
											type="password"
											bind:value={$passwordFormData.newPassword}
											{...$passwordConstraints.newPassword}
										/>
										<Field.Error errors={$passwordErrors.newPassword?.map(msg => ({ message: msg }))} />
										<Field.Description>
											Password must be at least 8 characters
										</Field.Description>
									</Field.Field>

									<Field.Field>
										<Field.Label for="settings-confirmPassword">Confirm new password</Field.Label>
										<Input
											id="settings-confirmPassword"
											name="confirmPassword"
											type="password"
											bind:value={$passwordFormData.confirmPassword}
											{...$passwordConstraints.confirmPassword}
										/>
										<Field.Error errors={$passwordErrors.confirmPassword?.map(msg => ({ message: msg }))} />
									</Field.Field>
								</Field.Group>
							</Field.Set>

							<Field.Field orientation="horizontal">
								<Button type="submit" disabled={$passwordDelayed || !$passwordTainted || $passwordAllErrors.length > 0}>
									Update Password
								</Button>
							</Field.Field>
						</Field.Group>
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

							<form method="POST" action="?/verifyMfa" use:twoFactorEnhance novalidate>
								<input type="hidden" name="factorId" value={mfaEnrollment.id} />

								<Field.Group>
									<Field.Set>
										<Field.Legend>Verify your code</Field.Legend>
										<Field.Description>
											Enter the 6-digit code from your authenticator app to complete setup
										</Field.Description>
										<Field.Group>
											<Field.Field>
												<Field.Label for="settings-2fa-code">Verification code</Field.Label>
												<Input
													id="settings-2fa-code"
													name="code"
													bind:value={$twoFactorFormData.code}
													placeholder="000000"
													{...$twoFactorConstraints.code}
												/>
												<Field.Error errors={$twoFactorErrors.code?.map(msg => ({ message: msg }))} />
											</Field.Field>
										</Field.Group>
									</Field.Set>

									<Field.Field orientation="horizontal">
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
									</Field.Field>
								</Field.Group>
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

