<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		subtitle?: string;
		actions?: Snippet;
	}
	let { title, subtitle, actions }: Props = $props();
</script>

<header class="px-5 pt-5 md:px-8 md:pt-6">
	<div class="flex items-end justify-between gap-3">
		<div class="min-w-0">
			<h1 class="font-serif text-[22px] leading-tight md:text-[26px]">{title}</h1>
			{#if subtitle}
				<p class="mt-1 truncate text-[13px]" style:color="var(--color-ink-faint)">{subtitle}</p>
			{/if}
		</div>
		{#if actions}
			<div class="flex shrink-0 items-center gap-2">
				{@render actions()}
			</div>
		{/if}
	</div>
</header>
