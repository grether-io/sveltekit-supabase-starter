<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from '$lib/components/app-sidebar.svelte';

	let { data, children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar user={data.user} userRole={data.userRole} />

	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 px-4">
			<Sidebar.Trigger />
		</header>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>

