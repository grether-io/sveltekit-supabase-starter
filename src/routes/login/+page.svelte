<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Card } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Field from "$lib/components/ui/field";
	import { loginSchema } from '$lib/schemas/auth';

	let { data } = $props();

	const { form, enhance, delayed, message, constraints, errors, allErrors } = $derived.by(() =>
		superForm(data.form, {
			validators: zod4Client(loginSchema)
		})
	);


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
			<h1 class="text-3xl font-bold text-gray-900">Sign in</h1>
			<p class="mt-2 text-sm text-gray-600">
				Don't have an account?
				<a href="/signup" class="font-medium text-blue-600 hover:text-blue-500">Sign up</a>
			</p>
		</div>

		<Card class="p-8">
			<form method="POST" use:enhance novalidate>
				<Field.Group>
					<Field.Set>
						<Field.Legend>Sign in to your account</Field.Legend>
						<Field.Description>
							Enter your credentials to access your account
						</Field.Description>
						<Field.Group>
							<Field.Field>
								<Field.Label for="login-email">Email</Field.Label>
								<Input
									id="login-email"
									name="email"
									type="email"
									placeholder="you@example.com"
									bind:value={$form.email}
									{...$constraints.email}
								/>
								<Field.Error errors={$errors.email?.map(msg => ({ message: msg }))} />
							</Field.Field>

							<Field.Field>
								<Field.Label for="login-password">Password</Field.Label>
								<Input
									id="login-password"
									name="password"
									type="password"
									placeholder="••••••••"
									bind:value={$form.password}
									{...$constraints.password}
								/>
								<Field.Error errors={$errors.password?.map(msg => ({ message: msg }))} />
								<Field.Description>
									<a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
										Forgot password?
									</a>
								</Field.Description>
							</Field.Field>
						</Field.Group>
					</Field.Set>

					<Field.Field orientation="horizontal">
						<Button type="submit" class="w-full" disabled={$delayed || $allErrors.length > 0}>
							Sign in
						</Button>
					</Field.Field>
				</Field.Group>
			</form>
		</Card>
	</div>
</div>

