<script lang="ts">
	interface Props {
		type?: 'text' | 'email' | 'password' | 'number';
		name?: string;
		value?: string | number;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		error?: string;
		class?: string;
		oninput?: (e: Event) => void;
		onblur?: (e: FocusEvent) => void;
	}

	let {
		type = 'text',
		name,
		value = $bindable(''),
		placeholder,
		disabled = false,
		required = false,
		error,
		class: className = '',
		oninput,
		onblur
	}: Props = $props();

	const baseClasses =
		'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50';
	const errorClasses = 'border-red-500 focus:ring-red-500';
</script>

<input
	{type}
	{name}
	bind:value
	{placeholder}
	{disabled}
	{required}
	{oninput}
	{onblur}
	class="{baseClasses} {error ? errorClasses : ''} {className}"
/>

