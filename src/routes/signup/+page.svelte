<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	import { Card } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";

	let { data } = $props();

	const { form, errors, enhance, message } = $derived.by(() => superForm(data.form));

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
			<h1 class="text-3xl font-bold text-gray-900">Create an account</h1>
			<p class="mt-2 text-sm text-gray-600">
				Already have an account?
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
			</p>
		</div>

		<Card class="">

			<form method="POST" use:enhance class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="firstname">First name</Label>
						<Input
							id="firstname"
							name="firstname"
							bind:value={$form.firstname}
							required
						/>
						{#if $errors.firstname}
							<p class="text-sm text-destructive">{$errors.firstname[0]}</p>
						{/if}
					</div>
					<div class="space-y-2">
						<Label for="lastname">Last name</Label>
						<Input
							id="lastname"
							name="lastname"
							bind:value={$form.lastname}
							required
						/>
						{#if $errors.lastname}
							<p class="text-sm text-destructive">{$errors.lastname[0]}</p>
						{/if}
					</div>
				</div>


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

				<Button type="submit" class="w-full">
					Create account
				</Button>
			</form>
		</Card>
	</div>
</div>

