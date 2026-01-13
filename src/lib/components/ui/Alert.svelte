<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'info' | 'success' | 'warning' | 'error';
		class?: string;
		children?: Snippet;
	}

	let { variant = 'info', class: className = '', children }: Props = $props();

	const variantClasses = {
		info: 'bg-blue-50 border-blue-200 text-blue-900',
		success: 'bg-green-50 border-green-200 text-green-900',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
		error: 'bg-red-50 border-red-200 text-red-900'
	};

	const baseClasses = 'rounded-md border p-4 text-sm';
</script>

<div class="{baseClasses} {variantClasses[variant]} {className}">
	{@render children?.()}
</div>

