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
			<h1 class="text-3xl font-bold text-gray-900">Forgot password?</h1>
			<p class="mt-2 text-sm text-gray-600">
				Enter your email and we'll send you a reset link
			</p>
		</div>

		<Card>
			{#if $message}
				<Alert variant={$message.includes('Check your email') ? 'success' : 'error'} class="mb-4">
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

				<Button type="submit" class="w-full" loading={$delayed}>
					Send reset link
				</Button>

				<div class="text-center text-sm">
					<a href="/login" class="text-gray-600 hover:text-gray-900">Back to login</a>
				</div>
			</form>
		</Card>
	</div>
</div>

