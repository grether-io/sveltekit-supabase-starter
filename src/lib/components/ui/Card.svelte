<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className = '', children }: Props = $props();

	const baseClasses = 'rounded-lg border border-gray-200 bg-white p-6 shadow-sm';
</script>

<div class="{baseClasses} {className}">
	{@render children?.()}
</div>

