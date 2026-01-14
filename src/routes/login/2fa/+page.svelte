<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import * as InputOTP from '$lib/components/ui/input-otp';
	import { Label } from '$lib/components/ui/label';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { twoFactorSchema } from '$lib/schemas/auth';

	let { data } = $props();

	const { form, errors, enhance, delayed, message, constraints, allErrors } = superForm(data.form, {
		validators: zod4Client(twoFactorSchema)
	});

	let otpValue = $state('');

	$effect(() => {
		$form.code = otpValue;
	});

	// Show toast notification when there's a message
	$effect(() => {
		if ($message) {
			toast.error($message);
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-gray-900">Two-Factor Authentication</h1>
			<p class="mt-2 text-sm text-gray-600">
				Enter the 6-digit code from your authenticator app
			</p>
		</div>

		<Card class="p-8">

			<form method="POST" use:enhance novalidate class="space-y-6">
				<div class="space-y-2">
					<Label for="code">Verification Code</Label>
					<InputOTP.Root bind:value={otpValue} maxlength={6} name="code" class="flex justify-center">
						{#snippet children({ cells })}
							<InputOTP.Group>
								{#each cells as cell (cell)}
									<InputOTP.Slot
										{cell}
										class="h-12 w-12 rounded-md border border-gray-300 text-center text-lg font-semibold"
									/>
								{/each}
							</InputOTP.Group>
						{/snippet}
					</InputOTP.Root>
					{#if $errors.code}
						<p class="text-sm text-destructive">{$errors.code[0]}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full" disabled={$delayed || $allErrors.length > 0}>
					Verify
				</Button>

				<div class="text-center text-sm">
					<a href="/login" class="text-gray-600 hover:text-gray-900">Back to login</a>
				</div>
			</form>
		</Card>
	</div>
</div>

