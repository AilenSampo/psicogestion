<script lang="ts">
	import PageHeader from '$components/PageHeader.svelte';
	import EmptyState from '$components/EmptyState.svelte';
	import { Calendar as CalIcon, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { format, addDays, startOfWeek, parseISO, isSameDay } from 'date-fns';
	import { es } from 'date-fns/locale';
	import { turnoRepo, pacienteRepo } from '$db/repositories';
	import { fmtTime } from '$utils/format';
	import type { Turno, Paciente } from '$db/types';

	let baseDate = $state(new Date());
	const lunes = $derived(startOfWeek(baseDate, { weekStartsOn: 1 }));
	const dias = $derived(Array.from({ length: 7 }, (_, i) => addDays(lunes, i)));

	let turnos = $state<Turno[]>([]);
	let pacientesById = $state<Record<string, Paciente>>({});

	async function load() {
		const ymd = format(lunes, 'yyyy-MM-dd');
		turnos = await turnoRepo.listWeek(ymd);
		const pacs = await pacienteRepo.list();
		pacientesById = Object.fromEntries(pacs.map((p) => [p.id, p]));
	}

	$effect(() => {
		// Re-cargar cuando cambia la semana
		const _ = lunes.getTime();
		load();
	});

	function turnosDe(d: Date): Turno[] {
		return turnos
			.filter((t) => isSameDay(parseISO(t.fechaHora), d))
			.sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
	}

	function semanaTxt(): string {
		const fin = addDays(lunes, 6);
		return `${format(lunes, 'd MMM', { locale: es })} – ${format(fin, 'd MMM yyyy', { locale: es })}`;
	}

	onMount(load);
</script>

<PageHeader title="Agenda" subtitle={semanaTxt()}>
	{#snippet actions()}
		<button class="btn btn-outline btn-sm" onclick={() => (baseDate = addDays(baseDate, -7))}>
			<ChevronLeft class="h-4 w-4" />
		</button>
		<button class="btn btn-outline btn-sm" onclick={() => (baseDate = new Date())}>Hoy</button>
		<button class="btn btn-outline btn-sm" onclick={() => (baseDate = addDays(baseDate, 7))}>
			<ChevronRight class="h-4 w-4" />
		</button>
	{/snippet}
</PageHeader>

<div class="px-5 pt-4 pb-6 md:px-8 md:pb-8">
	<div class="space-y-3">
		{#each dias as d}
			{@const items = turnosDe(d)}
			{@const isToday = isSameDay(d, new Date())}
			<section class="card overflow-hidden">
				<header
					class="flex items-center justify-between border-b px-4 py-2.5 md:px-5"
					style:border-color="var(--color-border)"
					style:background={isToday ? 'var(--color-accent-soft)' : 'var(--color-surface-2)'}
				>
					<div class="flex items-baseline gap-2">
						<div
							class="text-[13px] font-semibold capitalize"
							style:color={isToday ? 'var(--color-accent)' : 'var(--color-ink)'}
						>
							{format(d, 'EEEE', { locale: es })}
						</div>
						<div class="text-[12px]" style:color="var(--color-ink-faint)">
							{format(d, "d 'de' MMM", { locale: es })}
						</div>
					</div>
					<span class="text-[12px]" style:color="var(--color-ink-faint)">
						{items.length} turno{items.length === 1 ? '' : 's'}
					</span>
				</header>
				{#if items.length === 0}
					<div class="px-5 py-4 text-center text-[12.5px]" style:color="var(--color-ink-faint)">
						—
					</div>
				{:else}
					<ul>
						{#each items as t (t.id)}
							{@const p = pacientesById[t.pacienteId]}
							<li
								class="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0 md:px-5"
								style:border-color="var(--color-border)"
							>
								<div class="w-12 shrink-0 text-[13px] font-semibold">{fmtTime(t.fechaHora)}</div>
								<a
									href="/pacientes/{p?.id ?? ''}"
									class="min-w-0 flex-1 truncate text-[13.5px] font-medium hover:underline"
								>
									{p ? `${p.nombre} ${p.apellido}` : 'Paciente'}
								</a>
								<span
									class="badge"
									class:badge-green={t.estado === 'realizado' || t.estado === 'confirmado'}
									class:badge-amber={t.estado === 'pendiente'}
									class:badge-red={t.estado === 'cancelado' || t.estado === 'ausente'}
								>
									{t.estado}
								</span>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/each}
	</div>
</div>
