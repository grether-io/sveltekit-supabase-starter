<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Card } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { resetPasswordSchema } from '$lib/schemas/auth';

	let { data } = $props();

	const { form, errors, enhance, delayed, message, constraints, allErrors } = superForm(data.form, {
		validators: zod4Client(resetPasswordSchema)
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
			<h1 class="text-3xl font-bold text-gray-900">Reset password</h1>
			<p class="mt-2 text-sm text-gray-600">
				Enter your new password below
			</p>
		</div>

		<Card>

			<form method="POST" use:enhance novalidate class="space-y-4">
				<div class="space-y-2">
					<Label for="password">New password</Label>
					<Input
						id="password"
						name="password"
						type="password"
						bind:value={$form.password}
						placeholder="••••••••"
						{...$constraints.password}
					/>
					{#if $errors.password}
						<p class="text-sm text-destructive">{$errors.password[0]}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="confirmPassword">Confirm password</Label>
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						bind:value={$form.confirmPassword}
						placeholder="••••••••"
						{...$constraints.confirmPassword}
					/>
					{#if $errors.confirmPassword}
						<p class="text-sm text-destructive">{$errors.confirmPassword[0]}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full" disabled={$delayed || $allErrors.length > 0}>
					Reset password
				</Button>
			</form>
		</Card>
	</div>
</div>

