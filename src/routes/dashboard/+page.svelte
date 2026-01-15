<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { createSupabaseClient } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { ROLE_LEVELS } from '$lib/constants/roles';

	let { data } = $props();

	const supabase = createSupabaseClient();

	async function handleSignOut() {
		await supabase.auth.signOut();
		await goto('/login');
	}

	// Check if user is admin or higher
	const isAdmin = $derived((data.user?.app_metadata?.role_level ?? 0) >= ROLE_LEVELS.ADMIN);

</script>

<div class="min-h-screen bg-gray-50 px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="mb-8 flex items-center justify-between">
			<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
			<div class="flex gap-4">
				{#if isAdmin}
					<a href="/admin/users">
						<Button variant="outline">Admin</Button>
					</a>
				{/if}
				<a href="/settings">
					<Button variant="outline">Settings</Button>
				</a>
				<Button variant="outline" onclick={handleSignOut}>Sign out</Button>
			</div>
		</div>

		<Card class="p-8">
			<h2 class="mb-4 text-xl font-semibold">Welcome back!</h2>
			<div class="space-y-2 text-sm text-gray-600">
				<p>
					<span class="font-medium">Email:</span>
					{data.user?.email}
				</p>
				<p>
					<span class="font-medium">Display Name:</span>
					{data.user?.user_metadata?.firstname && data.user?.user_metadata?.lastname
						? `${data.user.user_metadata.firstname} ${data.user.user_metadata.lastname}`
						: 'Not set'}
				</p>
				<p>
					<span class="font-medium">User ID:</span>
					{data.user?.id}
				</p>
			</div>
		</Card>
	</div>
</div>

