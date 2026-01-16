<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Card } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Field from "$lib/components/ui/field";
	import { forgotPasswordSchema } from '$lib/schemas/auth';

	let { data } = $props();

	const { form, errors, enhance, delayed, message, constraints, allErrors } = $derived.by(() =>
		superForm(data.form, {
			validators: zod4Client(forgotPasswordSchema)
		})
	);

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

<div class="flex items-center justify-center px-4 py-12" style="min-height: calc(100vh - 4rem);">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold">Forgot password?</h1>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				Enter your email and we'll send you a reset link
			</p>
		</div>

		<Card class="p-8">
			<form method="POST" use:enhance novalidate>
				<Field.Group>
					<Field.Set>
						<Field.Legend>Reset your password</Field.Legend>
						<Field.Description>
							Enter your email and we'll send you a reset link
						</Field.Description>
						<Field.Group>
							<Field.Field>
								<Field.Label for="forgot-email">Email</Field.Label>
								<Input
									id="forgot-email"
									name="email"
									type="email"
									placeholder="you@example.com"
									bind:value={$form.email}
									{...$constraints.email}
								/>
								<Field.Error errors={$errors.email?.map(msg => ({ message: msg }))} />
							</Field.Field>
						</Field.Group>
					</Field.Set>

					<Field.Field orientation="horizontal">
						<Button type="submit" class="w-full" disabled={$delayed || $allErrors.length > 0}>
							Send reset link
						</Button>
					</Field.Field>

					<Field.Separator />

					<div class="text-center text-sm">
						<a href="/login" class="text-gray-600 dark:text-gray-400">Back to login</a>
					</div>
				</Field.Group>
			</form>
		</Card>
	</div>
</div>

