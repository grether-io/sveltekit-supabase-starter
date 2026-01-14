<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { Card } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Form from "$lib/components/ui/form";
	import { loginSchema } from '$lib/schemas/auth';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(loginSchema)
	});

	const { enhance, delayed, message, constraints , allErrors } = form;

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
			<form method="POST" use:enhance novalidate class="space-y-4">
				<Form.ElementField {form} name="email">
					<Form.Control>
						<Form.Label>Email</Form.Label>
						<Input
							type="email"
							placeholder="you@example.com"
							{...constraints}
						/>
						<Form.FieldErrors />
					</Form.Control>
				</Form.ElementField>

				<Form.ElementField {form} name="password">
					<Form.Control>
						<Form.Label>Password</Form.Label>
						<Input
							type="password"
							placeholder="••••••••"
							{...constraints}
						/>
						<Form.FieldErrors />
					</Form.Control>
				</Form.ElementField>

				<div class="flex items-center justify-between text-sm">
					<a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
						Forgot password?
					</a>
				</div>

				<Button type="submit" class="w-full" disabled={$delayed || $allErrors.length > 0}>
					Sign in
				</Button>
			</form>
		</Card>
	</div>
</div>

