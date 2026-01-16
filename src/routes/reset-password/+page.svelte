<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Card } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Field from "$lib/components/ui/field";
	import { resetPasswordSchema } from '$lib/schemas/auth';

	let { data } = $props();

	const { form, errors, enhance, delayed, message, constraints, allErrors } = $derived.by(() =>
		superForm(data.form, {
			validators: zod4Client(resetPasswordSchema)
		})
	);

	// Show toast notification when there's a message
	$effect(() => {
		if ($message) {
			toast.error($message);
		}
	});
</script>

<div class="flex items-center justify-center px-4 py-12" style="min-height: calc(100vh - 4rem);">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold">Reset password</h1>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				Enter your new password below
			</p>
		</div>

		<Card class="p-8">
			<form method="POST" use:enhance novalidate>
				<Field.Group>
					<Field.Set>
						<Field.Legend>Set new password</Field.Legend>
						<Field.Description>
							Enter your new password below
						</Field.Description>
						<Field.Group>
							<Field.Field>
								<Field.Label for="reset-password">New password</Field.Label>
								<Input
									id="reset-password"
									name="password"
									type="password"
									placeholder="••••••••"
									bind:value={$form.password}
									{...$constraints.password}
								/>
								<Field.Error errors={$errors.password?.map(msg => ({ message: msg }))} />
								<Field.Description>
									Password must be at least 8 characters
								</Field.Description>
							</Field.Field>

							<Field.Field>
								<Field.Label for="reset-confirmPassword">Confirm password</Field.Label>
								<Input
									id="reset-confirmPassword"
									name="confirmPassword"
									type="password"
									placeholder="••••••••"
									bind:value={$form.confirmPassword}
									{...$constraints.confirmPassword}
								/>
								<Field.Error errors={$errors.confirmPassword?.map(msg => ({ message: msg }))} />
							</Field.Field>
						</Field.Group>
					</Field.Set>

					<Field.Field orientation="horizontal">
						<Button type="submit" class="w-full" disabled={$delayed || $allErrors.length > 0}>
							Reset password
						</Button>
					</Field.Field>
				</Field.Group>
			</form>
		</Card>
	</div>
</div>

