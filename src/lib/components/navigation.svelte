<script lang="ts">
	import * as NavigationMenu from '$lib/components/ui/navigation-menu';
	import { Button } from '$lib/components/ui/button';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';

	let { user = undefined }: { user?: any } = $props();
</script>

<nav class="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-3 items-center h-16">
			<!-- Logo -->
			<div class="shrink-0 justify-self-start">
				<a href="/" class="flex items-center space-x-2">
					<span class="text-xl font-bold">SvelteKit</span>
				</a>
			</div>

			<!-- Navigation Menu (centered) -->
			<NavigationMenu.Root class="justify-self-center">
				<NavigationMenu.List class="">
					<NavigationMenu.Item>
						<NavigationMenu.Link href="/">Home</NavigationMenu.Link>
					</NavigationMenu.Item>
					<NavigationMenu.Item>
						<NavigationMenu.Trigger>Coming Soon</NavigationMenu.Trigger>
						<NavigationMenu.Content>
							<div class="w-50 p-4">
								<p class="text-sm text-muted-foreground pb-4">More features coming soon!</p>
							</div>
						</NavigationMenu.Content>
					</NavigationMenu.Item>
				</NavigationMenu.List>
			</NavigationMenu.Root>

			<!-- Auth Buttons -->
			<div class="flex items-center space-x-2 justify-self-end">
				<ThemeToggle />
				{#if user}
					<Button href="/dashboard" variant="outline">Dashboard</Button>
				{:else}
					<Button href="/login" variant="ghost">Log In</Button>
					<Button href="/signup">Sign Up</Button>
				{/if}
			</div>
		</div>
	</div>
</nav>

