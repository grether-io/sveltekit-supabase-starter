<script lang="ts">
	import { Card } from '$lib/components/ui/card';

	let { data } = $props();
</script>

<div class="min-h-screen px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="mb-8">
			<h1 class="text-3xl font-bold">Dashboard</h1>
		</div>

		<Card class="p-8">
			<h2 class="mb-4 text-xl font-semibold">Welcome back!</h2>
			<div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
				<p>
					<span class="font-medium">Email:</span>
					{data.user?.email}
				</p>
			<p>
				<span class="font-medium">Display Name:</span>
				{data.user?.user_metadata?.first_name && data.user?.user_metadata?.last_name
					? `${data.user.user_metadata.first_name} ${data.user.user_metadata.last_name}`
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

