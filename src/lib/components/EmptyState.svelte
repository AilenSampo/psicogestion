<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		// Cualquier componente de icono (lucide-svelte exporta clases legacy, Svelte 5 acepta funcionales)
		icon?: any;
		title: string;
		description?: string;
		actions?: Snippet;
	}
	let { icon: Icon, title, description, actions }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center px-6 py-12 text-center">
	{#if Icon}
		<div
			class="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
			style:background="var(--color-surface-2)"
		>
			<Icon class="h-6 w-6" style="color: var(--color-ink-faint)" strokeWidth={1.6} />
		</div>
	{/if}
	<h3 class="text-[15px] font-medium">{title}</h3>
	{#if description}
		<p class="mt-1 max-w-sm text-[13px]" style:color="var(--color-ink-faint)">{description}</p>
	{/if}
	{#if actions}
		<div class="mt-4">{@render actions()}</div>
	{/if}
</div>
