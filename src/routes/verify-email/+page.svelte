<script lang="ts">
	import {Button} from "$lib/components/ui/button";
	import {Alert} from "$lib/components/ui/alert";
	import {Card} from "$lib/components/ui/card";

	let { data } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-gray-900">Email Verification</h1>
		</div>

		<Card>
			{#if data.success}
				<Alert variant="default" class="mb-4">
					Your email has been successfully verified!
				</Alert>
				<div class="text-center">
					<a href="/dashboard">
						<Button class="w-full">Go to Dashboard</Button>
					</a>
				</div>
			{:else if data.error}
				<Alert variant="destructive" class="mb-4">
					{data.error}
				</Alert>
				<div class="text-center">
					<a href="/login">
						<Button class="w-full">Go to Login</Button>
					</a>
				</div>
			{:else}
				<Alert variant="default">
					Verifying your email...
				</Alert>
			{/if}
		</Card>
	</div>
</div>

