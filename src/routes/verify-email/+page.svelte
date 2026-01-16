<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from "$lib/components/ui/button";
	import { Card } from "$lib/components/ui/card";

	let { data } = $props();

	// Show toast notification based on verification status
	$effect(() => {
		if (data.success) {
			toast.success('Your email has been successfully verified!');
		} else if (data.error) {
			toast.error(data.error);
		}
	});
</script>

<div class="flex items-center justify-center px-4 py-12" style="min-height: calc(100vh - 4rem);">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold">Email Verification</h1>
		</div>

		<Card class="p-8">
			{#if data.success}
				<div class="text-center">
					<a href="/dashboard">
						<Button class="w-full">Go to Dashboard</Button>
					</a>
				</div>
			{:else if data.error}
				<div class="text-center">
					<a href="/login">
						<Button class="w-full">Go to Login</Button>
					</a>
				</div>
			{:else}
				<div class="text-center text-gray-600 dark:text-gray-400">
					Verifying your email...
				</div>
			{/if}
		</Card>
	</div>
</div>

