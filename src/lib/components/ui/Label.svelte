<script lang="ts">
	import { Label as LabelPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		for?: string;
		required?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { for: htmlFor, required = false, class: className = '', children }: Props = $props();

	const baseClasses = 'text-sm font-medium text-gray-900';
</script>

<LabelPrimitive.Root for={htmlFor} class="{baseClasses} {className}">
	{@render children?.()}
	{#if required}
		<span class="text-red-500">*</span>
	{/if}
</LabelPrimitive.Root>

