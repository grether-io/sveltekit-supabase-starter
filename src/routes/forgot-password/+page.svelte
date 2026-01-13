<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Card } from "$lib/components/ui/card";
	import { Alert } from "$lib/components/ui/alert";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";

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
				<Alert variant={$message.includes('Check your email') ? 'default' : 'destructive'} class="mb-4">
					{$message}
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						bind:value={$form.email}
						placeholder="you@example.com"
						required
					/>
					{#if $errors.email}
						<p class="text-sm text-destructive">{$errors.email[0]}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full">
					Send reset link
				</Button>

				<div class="text-center text-sm">
					<a href="/login" class="text-gray-600 hover:text-gray-900">Back to login</a>
				</div>
			</form>
		</Card>
	</div>
</div>

