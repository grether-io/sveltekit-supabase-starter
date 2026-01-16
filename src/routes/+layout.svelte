<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toaster } from '$lib/components/ui/sonner';
	import Navigation from '$lib/components/navigation.svelte';
	import { page } from '$app/stores';
	import { ModeWatcher } from 'mode-watcher';

	let { children, data } = $props();

	// Check if we're on an authenticated route (dashboard, settings, admin, etc.)
	const isAuthenticatedRoute = $derived($page.url.pathname.startsWith('/dashboard') ||
		$page.url.pathname.startsWith('/settings') ||
		$page.url.pathname.startsWith('/admin'));
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher defaultMode="system" />

{#if !isAuthenticatedRoute}
	<Navigation user={data.user} />
{/if}

{@render children()}
<Toaster />
