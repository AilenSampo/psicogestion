<script lang="ts">
	import { page } from '$app/state';
	import {
		LayoutGrid,
		Calendar,
		Clock,
		Users,
		FileText,
		Wallet,
		Settings
	} from 'lucide-svelte';

	interface NavItem {
		href: string;
		label: string;
		icon: typeof LayoutGrid;
		section?: string;
	}

	const items: NavItem[] = [
		{ href: '/', label: 'Inicio', icon: LayoutGrid, section: 'Principal' },
		{ href: '/agenda', label: 'Agenda', icon: Calendar },
		{ href: '/turnos', label: 'Turnos de hoy', icon: Clock },
		{ href: '/pacientes', label: 'Pacientes', icon: Users, section: 'Pacientes' },
		{ href: '/informes', label: 'Informes', icon: FileText },
		{ href: '/cobros', label: 'Cobros', icon: Wallet, section: 'Administración' },
		{ href: '/configuracion', label: 'Configuración', icon: Settings }
	];

	const current = $derived(page.url.pathname);
	function isActive(href: string): boolean {
		if (href === '/') return current === '/';
		return current === href || current.startsWith(href + '/');
	}
</script>

<aside
	class="fixed top-0 bottom-0 left-0 hidden w-60 flex-col border-r bg-white md:flex"
	style:border-color="var(--color-border)"
>
	<div class="border-b p-5" style:border-color="var(--color-border)">
		<a href="/" class="flex items-center gap-2.5">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg" style:background="var(--color-accent)">
				<img src="/icons/icon.svg" alt="" class="h-5 w-5" />
			</div>
			<div class="leading-tight">
				<div class="font-serif text-[17px]">PsicoGestión</div>
				<div class="text-[11px]" style:color="var(--color-ink-faint)">sistema de consultorios</div>
			</div>
		</a>
	</div>

	<nav class="flex-1 overflow-y-auto py-3">
		{#each items as item, i}
			{#if item.section}
				<div
					class="px-5 pt-4 pb-1.5 text-[10px] font-semibold tracking-wider uppercase"
					style:color="var(--color-ink-faint)"
				>
					{item.section}
				</div>
			{/if}
			<a
				href={item.href}
				class="flex items-center gap-2.5 px-5 py-2.5 text-[13.5px] transition"
				class:active={isActive(item.href)}
				style:color={isActive(item.href) ? 'var(--color-accent)' : 'var(--color-ink-muted)'}
				style:background={isActive(item.href) ? 'var(--color-accent-soft)' : 'transparent'}
				style:font-weight={isActive(item.href) ? '500' : '400'}
			>
				<item.icon class="h-4 w-4" strokeWidth={1.6} />
				{item.label}
			</a>
		{/each}
	</nav>

	<div class="border-t p-4" style:border-color="var(--color-border)">
		<a href="/configuracion" class="flex items-center gap-2.5">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold text-white"
				style:background="var(--color-accent)"
			>
				U
			</div>
			<div class="leading-tight">
				<div class="text-[13px] font-medium">Mi cuenta</div>
				<div class="text-[11px]" style:color="var(--color-ink-faint)">Local · sin cuenta</div>
			</div>
		</a>
	</div>
</aside>
