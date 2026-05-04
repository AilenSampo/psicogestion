<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from 'lucide-svelte';

	interface Props {
		open: boolean;
		title?: string;
		onClose: () => void;
		children: Snippet;
		footer?: Snippet;
	}
	let { open, title, onClose, children, footer }: Props = $props();

	function handleBackdrop(e: MouseEvent) {
		if (e.currentTarget === e.target) onClose();
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}
</script>

<svelte:window onkeydown={handleKey} />

{#if open}
	<div
		class="animate-fade-in fixed inset-0 z-40 flex items-end justify-center bg-black/35 md:items-center"
		onclick={handleBackdrop}
		role="presentation"
	>
		<div
			class="animate-sheet-up flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-2xl md:max-h-[88vh] md:w-[480px] md:rounded-2xl"
			role="dialog"
			aria-modal="true"
		>
			<div
				class="flex items-center justify-between gap-2 border-b px-5 py-4 md:px-6"
				style:border-color="var(--color-border)"
			>
				<h2 class="text-[15px] font-semibold">{title ?? ''}</h2>
				<button
					type="button"
					class="btn-ghost btn -mr-2"
					onclick={onClose}
					aria-label="Cerrar"
				>
					<X class="h-5 w-5" />
				</button>
			</div>
			<div class="flex-1 overflow-y-auto px-5 py-5 md:px-6">
				{@render children()}
			</div>
			{#if footer}
				<div
					class="flex justify-end gap-2 border-t px-5 py-4 md:px-6"
					style:border-color="var(--color-border)"
				>
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
