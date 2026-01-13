<script lang="ts">
	import Label from './Label.svelte';
	import Input from './Input.svelte';

	interface Props {
		label: string;
		name: string;
		type?: 'text' | 'email' | 'password' | 'number';
		value?: string | number;
		placeholder?: string;
		required?: boolean;
		error?: string;
		disabled?: boolean;
	}

	let {
		label,
		name,
		type = 'text',
		value = $bindable(''),
		placeholder,
		required = false,
		error,
		disabled = false
	}: Props = $props();
</script>

<div class="space-y-2">
	<Label for={name} {required}>{label}</Label>
	<Input {type} {name} bind:value {placeholder} {required} {error} {disabled} />
	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}
</div>

