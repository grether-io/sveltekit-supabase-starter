<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
</script>

<div class="flex items-center justify-center bg-linear-to-br" style="min-height: calc(100vh - 4rem);">
	<div class="max-w-md w-full space-y-8 p-8">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
				Welcome to SvelteKit
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
				Get started by logging in or creating a new account
			</p>
		</div>

		{#if data.user}
			<div class="space-y-4">
				<p class="text-center text-gray-700 dark:text-gray-200">
					You're already logged in as <strong>{data.user.email}</strong>
				</p>
				<div class="flex gap-4 justify-center">
					<Button href="/dashboard" size="lg" class="w-full">
						Go to Dashboard
					</Button>
				</div>
			</div>
		{:else}
			<div class="space-y-4">
				<Button href="/login" size="lg" class="w-full">
					Log In
				</Button>
				<Button href="/signup" variant="outline" size="lg" class="w-full">
					Sign Up
				</Button>
			</div>
		{/if}

		<div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
			<p class="text-center text-sm text-gray-500 dark:text-gray-400">
				Built with SvelteKit and Supabase
			</p>
		</div>
	</div>
</div>

