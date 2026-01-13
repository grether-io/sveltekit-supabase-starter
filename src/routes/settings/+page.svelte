<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Tabs } from 'bits-ui';
	import Card from '$lib/components/ui/Card.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { applyAction, enhance as svelteEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form: actionResult } = $props();

	const profileForm = superForm(data.profileForm, { id: 'profile' });
	const emailForm = superForm(data.emailForm, { id: 'email' });
	const passwordForm = superForm(data.passwordForm, { id: 'password' });
	const twoFactorForm = superForm(data.twoFactorForm, { id: 'twoFactor' });

	let activeTab = $state('profile');
	let mfaEnrollment = $state<any>(null);
	let isEnrolling = $state(false);

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

		<Card>
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
					{#if profileForm.message}
						<Alert
							variant={$profileForm.message.includes('success') ? 'success' : 'error'}
							class="mb-4"
						>
							{$profileForm.message}
						</Alert>
					{/if}

					<form
						method="POST"
						action="?/updateProfile"
						use:profileForm.enhance
						class="space-y-4"
					>
						<div class="grid grid-cols-2 gap-4">
							<FormField
								label="First name"
								name="firstname"
								bind:value={$profileForm.form.firstname}
								error={$profileForm.errors.firstname?.[0]}
								required
							/>
							<FormField
								label="Last name"
								name="lastname"
								bind:value={$profileForm.form.lastname}
								error={$profileForm.errors.lastname?.[0]}
								required
							/>
						</div>

						<FormField
							label="Display name"
							name="displayname"
							bind:value={$profileForm.form.displayname}
							error={$profileForm.errors.displayname?.[0]}
							required
						/>

						<Button type="submit" loading={$profileForm.delayed}>
							Update Profile
						</Button>
					</form>
				</Tabs.Content>

				<!-- Email Tab -->
				<Tabs.Content value="email">
					{#if emailForm.message}
						<Alert
							variant={$emailForm.message.includes('Check your') ? 'success' : 'error'}
							class="mb-4"
						>
							{$emailForm.message}
						</Alert>
					{/if}

					<form method="POST" action="?/updateEmail" use:emailForm.enhance class="space-y-4">
						<FormField
							label="Email address"
							name="email"
							type="email"
							bind:value={$emailForm.form.email}
							error={$emailForm.errors.email?.[0]}
							required
						/>

						<p class="text-sm text-gray-600">
							You'll receive a verification email at your new address.
						</p>

						<Button type="submit" loading={$emailForm.delayed}>
							Update Email
						</Button>
					</form>
				</Tabs.Content>

				<!-- Password Tab -->
				<Tabs.Content value="password">
					{#if passwordForm.message}
						<Alert
							variant={$passwordForm.message.includes('success') ? 'success' : 'error'}
							class="mb-4"
						>
							{$passwordForm.message}
						</Alert>
					{/if}

					<form method="POST" action="?/updatePassword" use:passwordForm.enhance class="space-y-4">
						<FormField
							label="Current password"
							name="currentPassword"
							type="password"
							bind:value={$passwordForm.form.currentPassword}
							error={$passwordForm.errors.currentPassword?.[0]}
							required
						/>

						<FormField
							label="New password"
							name="newPassword"
							type="password"
							bind:value={$passwordForm.form.newPassword}
							error={$passwordForm.errors.newPassword?.[0]}
							required
						/>

						<FormField
							label="Confirm new password"
							name="confirmPassword"
							type="password"
							bind:value={$passwordForm.form.confirmPassword}
							error={$passwordForm.errors.confirmPassword?.[0]}
							required
						/>

						<Button type="submit" loading={$passwordForm.delayed}>
							Update Password
						</Button>
					</form>
				</Tabs.Content>

				<!-- 2FA Tab -->
				<Tabs.Content value="2fa">
					{#if data.mfaEnabled && !isEnrolling}
						<Alert variant="success" class="mb-4">
							Two-factor authentication is enabled on your account.
						</Alert>

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
						{#if twoFactorForm.message}
							<Alert
								variant={$twoFactorForm.message.includes('success') ? 'success' : 'error'}
								class="mb-4"
							>
								{$twoFactorForm.message}
							</Alert>
						{/if}

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

							<form method="POST" action="?/verifyMfa" use:twoFactorForm.enhance class="space-y-4">
								<input type="hidden" name="factorId" value={mfaEnrollment.id} />

								<FormField
									label="Verification code"
									name="code"
									bind:value={$twoFactorForm.form.code}
									error={$twoFactorForm.errors.code?.[0]}
									placeholder="000000"
									required
								/>

								<div class="flex gap-2">
									<Button type="submit" loading={$twoFactorForm.delayed}>
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
						<Alert variant="info" class="mb-4">
							Two-factor authentication is not enabled. Add an extra layer of security to your
							account.
						</Alert>

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

