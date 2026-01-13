<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { createSupabaseClient } from '$lib/supabase';
	import { goto } from '$app/navigation';

	let { data } = $props();

	const supabase = createSupabaseClient();

	async function handleSignOut() {
		await supabase.auth.signOut();
		goto('/login');
	}
</script>

<div class="min-h-screen bg-gray-50 px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
			<div class="flex gap-4">
				<a href="/settings">
					<Button variant="outline">Settings</Button>
				</a>
				<Button variant="outline" onclick={handleSignOut}>Sign out</Button>
			</div>
		</div>

		<Card>
			<h2 class="mb-4 text-xl font-semibold">Welcome back!</h2>
			<div class="space-y-2 text-sm text-gray-600">
				<p>
					<span class="font-medium">Email:</span>
					{data.user?.email}
				</p>
				<p>
					<span class="font-medium">Display Name:</span>
					{data.user?.user_metadata?.displayname || 'Not set'}
				</p>
				<p>
					<span class="font-medium">User ID:</span>
					{data.user?.id}
				</p>
			</div>
		</Card>
	</div>
</div>

