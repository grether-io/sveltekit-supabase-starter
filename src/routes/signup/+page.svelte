<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Card } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Field from "$lib/components/ui/field";
	import { signupSchema } from '$lib/schemas/auth';

	let { data } = $props();

	const { form, errors, enhance, delayed, message, constraints, allErrors } = $derived.by(() => superForm(data.form, {
		validators: zod4Client(signupSchema)
	}));

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
			<h1 class="text-3xl font-bold">Create an account</h1>
			<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
				Already have an account?
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
			</p>
		</div>

		<Card class="p-8">
			<form method="POST" use:enhance novalidate>
				<Field.Group>
					<Field.Set>
						<Field.Legend>Create your account</Field.Legend>
						<Field.Description>
							Fill in your details to get started
						</Field.Description>
						<Field.Group>
							<div class="grid grid-cols-2 gap-4">
								<Field.Field>
									<Field.Label for="signup-first_name">First name</Field.Label>
									<Input
										id="signup-first_name"
										name="first_name"
										bind:value={$form.first_name}
										{...$constraints.first_name}
									/>
									<Field.Error errors={$errors.first_name?.map(msg => ({ message: msg }))} />
								</Field.Field>

								<Field.Field>
									<Field.Label for="signup-last_name">Last name</Field.Label>
									<Input
										id="signup-last_name"
										name="last_name"
										bind:value={$form.last_name}
										{...$constraints.last_name}
									/>
									<Field.Error errors={$errors.last_name?.map(msg => ({ message: msg }))} />
								</Field.Field>
							</div>

							<Field.Field>
								<Field.Label for="signup-email">Email</Field.Label>
								<Input
									id="signup-email"
									name="email"
									type="email"
									placeholder="you@example.com"
									bind:value={$form.email}
									{...$constraints.email}
								/>
								<Field.Error errors={$errors.email?.map(msg => ({ message: msg }))} />
							</Field.Field>

							<Field.Field>
								<Field.Label for="signup-password">Password</Field.Label>
								<Input
									id="signup-password"
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
						</Field.Group>
					</Field.Set>

					<Field.Field orientation="horizontal">
						<Button type="submit" class="w-full" disabled={$delayed || $allErrors.length > 0}>
							Create account
						</Button>
					</Field.Field>
				</Field.Group>
			</form>
		</Card>
	</div>
</div>

