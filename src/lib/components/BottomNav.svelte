<script lang="ts">
	import { page } from '$app/state';
	import { Home, Calendar, Users, MoreHorizontal } from 'lucide-svelte';

	const items = [
		{ href: '/', label: 'Inicio', icon: Home, match: (p: string) => p === '/' },
		{
			href: '/agenda',
			label: 'Agenda',
			icon: Calendar,
			match: (p: string) => p.startsWith('/agenda') || p.startsWith('/turnos')
		},
		{
			href: '/pacientes',
			label: 'Pacientes',
			icon: Users,
			match: (p: string) => p.startsWith('/pacientes')
		},
		{
			href: '/mas',
			label: 'Más',
			icon: MoreHorizontal,
			match: (p: string) => p.startsWith('/mas') || p.startsWith('/configuracion') || p.startsWith('/informes') || p.startsWith('/cobros')
		}
	];

	const current = $derived(page.url.pathname);
</script>

<nav
	class="fixed right-0 bottom-0 left-0 z-30 grid grid-cols-4 border-t bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
	style:border-color="var(--color-border)"
>
	{#each items as item}
		{@const active = item.match(current)}
		<a
			href={item.href}
			class="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] transition"
			style:color={active ? 'var(--color-accent)' : 'var(--color-ink-faint)'}
		>
			<item.icon class="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
			<span class:font-semibold={active}>{item.label}</span>
		</a>
	{/each}
</nav>
