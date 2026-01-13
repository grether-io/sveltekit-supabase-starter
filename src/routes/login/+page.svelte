<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import Card from '$lib/components/ui/Card.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	let { data } = $props();

	const { form, errors, enhance, delayed, message } = superForm(data.form);
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

		<Card>
			{#if $message}
				<Alert variant="error" class="mb-4">
					{$message}
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<FormField
					label="Email"
					name="email"
					type="email"
					bind:value={$form.email}
					error={$errors.email?.[0]}
					placeholder="you@example.com"
					required
				/>

				<FormField
					label="Password"
					name="password"
					type="password"
					bind:value={$form.password}
					error={$errors.password?.[0]}
					placeholder="••••••••"
					required
				/>

				<div class="flex items-center justify-between text-sm">
					<a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
						Forgot password?
					</a>
				</div>

				<Button type="submit" class="w-full" loading={$delayed}>
					Sign in
				</Button>
			</form>
		</Card>
	</div>
</div>

