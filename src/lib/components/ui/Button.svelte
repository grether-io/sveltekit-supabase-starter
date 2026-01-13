<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'button' | 'submit' | 'reset';
		variant?: 'default' | 'outline' | 'ghost' | 'destructive';
		size?: 'default' | 'sm' | 'lg';
		disabled?: boolean;
		loading?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	}

	let {
		type = 'button',
		variant = 'default',
		size = 'default',
		disabled = false,
		loading = false,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const variantClasses = {
		default: 'bg-blue-600 text-white hover:bg-blue-700',
		outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
		ghost: 'text-gray-900 hover:bg-gray-100',
		destructive: 'bg-red-600 text-white hover:bg-red-700'
	};

	const sizeClasses = {
		default: 'px-4 py-2 text-sm',
		sm: 'px-3 py-1.5 text-xs',
		lg: 'px-6 py-3 text-base'
	};

	const baseClasses =
		'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50';
</script>

<button
	{type}
	disabled={disabled || loading}
	{onclick}
	class="{baseClasses} {variantClasses[variant]} {sizeClasses[size]} {className}"
>
	{#if loading}
		<svg
			class="mr-2 h-4 w-4 animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{/if}
	{@render children?.()}
</button>

