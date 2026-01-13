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
			<h1 class="text-3xl font-bold text-gray-900">Create an account</h1>
			<p class="mt-2 text-sm text-gray-600">
				Already have an account?
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
			</p>
		</div>

		<Card>
			{#if $message}
				<Alert variant="error" class="mb-4">
					{$message}
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<FormField
						label="First name"
						name="firstname"
						bind:value={$form.firstname}
						error={$errors.firstname?.[0]}
						required
					/>
					<FormField
						label="Last name"
						name="lastname"
						bind:value={$form.lastname}
						error={$errors.lastname?.[0]}
						required
					/>
				</div>

				<FormField
					label="Display name"
					name="displayname"
					bind:value={$form.displayname}
					error={$errors.displayname?.[0]}
					required
				/>

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

				<Button type="submit" class="w-full" loading={$delayed}>
					Create account
				</Button>
			</form>
		</Card>
	</div>
</div>

