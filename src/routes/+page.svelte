<script lang="ts">
	import PageHeader from '$components/PageHeader.svelte';
	import StatCard from '$components/StatCard.svelte';
	import EmptyState from '$components/EmptyState.svelte';
	import { Calendar, Plus, Users } from 'lucide-svelte';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';
	import { onMount } from 'svelte';
	import { pacienteRepo, turnoRepo, cobroRepo, todayISO } from '$db/repositories';
	import { fmtTime, fmtMoney, iniciales, avatarColorFromName } from '$utils/format';
	import type { Turno, Paciente } from '$db/types';
	import Avatar from '$components/Avatar.svelte';

	let pacientesActivos = $state(0);
	let turnosHoy = $state<Turno[]>([]);
	let pacientesById = $state<Record<string, Paciente>>({});
	let cobradoMesActual = $state(0);
	let pendienteMonto = $state(0);

	const hoy = new Date();
	const saludo = $derived(getSaludo());
	const fechaHoyTxt = format(hoy, "EEEE d 'de' MMMM", { locale: es });

	function getSaludo(): string {
		const h = new Date().getHours();
		if (h < 12) return 'Buenos días';
		if (h < 19) return 'Buenas tardes';
		return 'Buenas noches';
	}

	async function load() {
		pacientesActivos = await pacienteRepo.countByEstado('activo');
		turnosHoy = await turnoRepo.listByDay(todayISO());
		const pacs = await pacienteRepo.list();
		pacientesById = Object.fromEntries(pacs.map((p) => [p.id, p]));
		const ym = todayISO().slice(0, 7);
		cobradoMesActual = await cobroRepo.sumMonth(ym);
		pendienteMonto = await cobroRepo.sumByEstado('pendiente');
	}

	onMount(load);
</script>

<PageHeader title={saludo} subtitle="{fechaHoyTxt} · {turnosHoy.length} turnos hoy">
	{#snippet actions()}
		<a href="/turnos/nuevo" class="btn btn-primary btn-sm">
			<Plus class="h-4 w-4" /> <span class="hidden sm:inline">Nuevo turno</span>
		</a>
	{/snippet}
</PageHeader>

<div class="px-5 pt-5 pb-6 md:px-8 md:pb-8">
	<div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
		<StatCard
			label="Turnos hoy"
			value={turnosHoy.length}
			sub={turnosHoy.filter((t) => t.estado === 'realizado').length + ' realizados'}
			dotColor="#1E6E3A"
		/>
		<StatCard
			label="Pacientes activos"
			value={pacientesActivos}
			sub="en seguimiento"
			dotColor="#1A4F8A"
		/>
		<StatCard
			label="Cobrado en el mes"
			value={fmtMoney(cobradoMesActual)}
			sub={format(hoy, 'MMMM yyyy', { locale: es })}
			dotColor="#1E6E3A"
		/>
		<StatCard
			label="Pendiente"
			value={fmtMoney(pendienteMonto)}
			sub={pendienteMonto > 0 ? 'a cobrar' : 'al día'}
			dotColor="#C17A3C"
		/>
	</div>

	<section class="mt-6 md:mt-8">
		<div class="mb-3 flex items-center justify-between">
			<h2 class="text-[15px] font-semibold">Turnos de hoy</h2>
			<a href="/agenda" class="text-[13px] hover:underline" style:color="var(--color-accent)"
				>Ver agenda</a
			>
		</div>

		<div class="card overflow-hidden">
			{#if turnosHoy.length === 0}
				<EmptyState
					icon={Calendar}
					title="Sin turnos para hoy"
					description="Cuando agregues turnos, los vas a ver acá."
				>
					{#snippet actions()}
						<a href="/turnos/nuevo" class="btn btn-primary btn-sm">
							<Plus class="h-4 w-4" /> Agendar turno
						</a>
					{/snippet}
				</EmptyState>
			{:else}
				<ul>
					{#each turnosHoy as t (t.id)}
						{@const p = pacientesById[t.pacienteId]}
						<li
							class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 md:px-5"
							style:border-color="var(--color-border)"
						>
							<div class="w-12 shrink-0 text-[13px] font-semibold">{fmtTime(t.fechaHora)}</div>
							<Avatar nombre={p?.nombre} apellido={p?.apellido} />
							<div class="min-w-0 flex-1">
								<div class="truncate text-[14px] font-medium">
									{p ? `${p.nombre} ${p.apellido}` : 'Paciente'}
								</div>
								<div class="truncate text-[12px]" style:color="var(--color-ink-faint)">
									{t.duracionMin} min · {t.modalidad}
								</div>
							</div>
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
		</div>
	</section>

	<section class="mt-6 md:mt-8">
		<div class="mb-3 flex items-center justify-between">
			<h2 class="text-[15px] font-semibold">Accesos rápidos</h2>
		</div>
		<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
			<a href="/pacientes/nuevo" class="card flex items-center gap-3 px-4 py-4 hover:bg-stone-50">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg"
					style:background="var(--color-accent-soft)"
				>
					<Users class="h-4 w-4" style="color: var(--color-accent)" />
				</div>
				<div class="text-[13.5px] font-medium">Nuevo paciente</div>
			</a>
			<a href="/turnos/nuevo" class="card flex items-center gap-3 px-4 py-4 hover:bg-stone-50">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg"
					style:background="var(--color-accent-soft)"
				>
					<Calendar class="h-4 w-4" style="color: var(--color-accent)" />
				</div>
				<div class="text-[13.5px] font-medium">Nuevo turno</div>
			</a>
			<a href="/informes" class="card flex items-center gap-3 px-4 py-4 hover:bg-stone-50">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg"
					style:background="var(--color-accent-soft)"
				>
					<Users class="h-4 w-4" style="color: var(--color-accent)" />
				</div>
				<div class="text-[13.5px] font-medium">Ver informes</div>
			</a>
			<a href="/cobros" class="card flex items-center gap-3 px-4 py-4 hover:bg-stone-50">
				<div
					class="flex h-9 w-9 items-center justify-center rounded-lg"
					style:background="var(--color-accent-soft)"
				>
					<Users class="h-4 w-4" style="color: var(--color-accent)" />
				</div>
				<div class="text-[13.5px] font-medium">Registrar cobro</div>
			</a>
		</div>
	</section>
</div>
