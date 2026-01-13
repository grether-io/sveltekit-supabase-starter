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
			<h1 class="text-3xl font-bold text-gray-900">Reset password</h1>
			<p class="mt-2 text-sm text-gray-600">
				Enter your new password below
			</p>
		</div>

		<Card>
			{#if $message}
				<Alert variant="destructive" class="mb-4">
					{$message}
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="password">New password</Label>
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

				<div class="space-y-2">
					<Label for="confirmPassword">Confirm password</Label>
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						bind:value={$form.confirmPassword}
						placeholder="••••••••"
						required
					/>
					{#if $errors.confirmPassword}
						<p class="text-sm text-destructive">{$errors.confirmPassword[0]}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full">
					Reset password
				</Button>
			</form>
		</Card>
	</div>
</div>

