<script lang="ts">
	interface Props {
		label: string;
		value: string | number;
		sub?: string;
		dotColor?: string;
	}
	let { label, value, sub, dotColor }: Props = $props();
</script>

<div class="card p-4 md:p-5">
	<div
		class="text-[10.5px] font-medium tracking-wider uppercase"
		style:color="var(--color-ink-faint)"
	>
		{label}
	</div>
	<div class="mt-1.5 text-[24px] leading-none font-semibold md:text-[28px]">{value}</div>
	{#if sub}
		<div class="mt-1.5 flex items-center gap-1.5 text-[12px]" style:color="var(--color-ink-faint)">
			{#if dotColor}
				<span class="inline-block h-1.5 w-1.5 rounded-full" style:background={dotColor}></span>
			{/if}
			{sub}
		</div>
	{/if}
</div>
