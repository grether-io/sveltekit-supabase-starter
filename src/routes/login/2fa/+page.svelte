<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { PinInput } from 'bits-ui';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import Label from '$lib/components/ui/Label.svelte';

	let { data } = $props();

	const { form, errors, enhance, delayed, message } = superForm(data.form);

	let pinValue = $state(['', '', '', '', '', '']);

	$effect(() => {
		$form.code = pinValue.join('');
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-gray-900">Two-Factor Authentication</h1>
			<p class="mt-2 text-sm text-gray-600">
				Enter the 6-digit code from your authenticator app
			</p>
		</div>

		<Card>
			{#if $message}
				<Alert variant="error" class="mb-4">
					{$message}
				</Alert>
			{/if}

			<form method="POST" use:enhance class="space-y-6">
				<div class="space-y-2">
					<Label>Verification Code</Label>
					<PinInput.Root
						bind:value={pinValue}
						name="code"
						class="flex justify-center gap-2"
						type="number"
					>
						{#each { length: 6 } as _, i}
							<PinInput.Input
								index={i}
								class="h-12 w-12 rounded-md border border-gray-300 text-center text-lg font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						{/each}
					</PinInput.Root>
					{#if $errors.code}
						<p class="text-sm text-red-600">{$errors.code[0]}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full" loading={$delayed}>
					Verify
				</Button>

				<div class="text-center text-sm">
					<a href="/login" class="text-gray-600 hover:text-gray-900">Back to login</a>
				</div>
			</form>
		</Card>
	</div>
</div>

