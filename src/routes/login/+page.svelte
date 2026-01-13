<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { Card } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";

	let { data } = $props();

	const { form, errors, enhance, delayed, message } = superForm(data.form);

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

		<Card>

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

				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						name="password"
						type="password"
						bind:value={$form.password}
						placeholder="••••••••"
						required
					/>
					{#if $errors.password}
						<p class="text-sm text-destructive">{$errors.password[0]}</p>
					{/if}
				</div>

				<div class="flex items-center justify-between text-sm">
					<a href="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
						Forgot password?
					</a>
				</div>

				<Button type="submit" class="w-full">
					Sign in
				</Button>
			</form>
		</Card>
	</div>
</div>

