<script lang="ts">
	import PageHeader from '$components/PageHeader.svelte';
	import { FileText, Wallet, Settings, ChevronRight } from 'lucide-svelte';

	const items = [
		{ href: '/informes', label: 'Informes', icon: FileText, desc: 'Listado y creación de informes' },
		{ href: '/cobros', label: 'Cobros', icon: Wallet, desc: 'Movimientos y facturación' },
		{ href: '/configuracion', label: 'Configuración', icon: Settings, desc: 'Perfil, consultorio y datos' }
	];
</script>

<PageHeader title="Más" subtitle="Atajos a otras secciones" />

<div class="px-5 pt-4 pb-6">
	<div class="card overflow-hidden">
		{#each items as it}
			<a
				href={it.href}
				class="flex items-center gap-3 border-b px-4 py-4 last:border-b-0 hover:bg-stone-50"
				style:border-color="var(--color-border)"
			>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg"
					style:background="var(--color-accent-soft)"
				>
					<it.icon class="h-4 w-4" style="color: var(--color-accent)" />
				</div>
				<div class="min-w-0 flex-1">
					<div class="text-[14px] font-medium">{it.label}</div>
					<div class="text-[12px]" style:color="var(--color-ink-faint)">{it.desc}</div>
				</div>
				<ChevronRight class="h-4 w-4" style="color: var(--color-ink-faint)" />
			</a>
		{/each}
	</div>
</div>
