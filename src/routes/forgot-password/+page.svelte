<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Card } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { forgotPasswordSchema } from '$lib/schemas/auth';

	let { data } = $props();

	const { form, errors, enhance, delayed, message, constraints, allErrors } = superForm(data.form, {
		validators: zod4Client(forgotPasswordSchema)
	});

	// Show toast notification when there's a message
	$effect(() => {
		if ($message) {
			// Success message vs error message
			if ($message.includes('Check your email')) {
				toast.success($message);
			} else {
				toast.error($message);
			}
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-gray-900">Forgot password?</h1>
			<p class="mt-2 text-sm text-gray-600">
				Enter your email and we'll send you a reset link
			</p>
		</div>

		<Card>

			<form method="POST" use:enhance novalidate class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						bind:value={$form.email}
						placeholder="you@example.com"
						{...$constraints.email}
					/>
					{#if $errors.email}
						<p class="text-sm text-destructive">{$errors.email[0]}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full" disabled={$delayed || $allErrors.length > 0}>
					Send reset link
				</Button>

				<div class="text-center text-sm">
					<a href="/login" class="text-gray-600 hover:text-gray-900">Back to login</a>
				</div>
			</form>
		</Card>
	</div>
</div>

