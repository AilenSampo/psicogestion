<script lang="ts">
	import PageHeader from '$components/PageHeader.svelte';
	import EmptyState from '$components/EmptyState.svelte';
	import Sheet from '$components/Sheet.svelte';
	import Avatar from '$components/Avatar.svelte';
	import { Plus, Clock, Check, X as XIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { turnoRepo, pacienteRepo, consultorioRepo, profesionalRepo, todayISO } from '$db/repositories';
	import { fmtTime } from '$utils/format';
	import type { Turno, Paciente } from '$db/types';

	let turnos = $state<Turno[]>([]);
	let pacientesById = $state<Record<string, Paciente>>({});
	let pacientes = $state<Paciente[]>([]);

	let openNuevo = $state(false);
	let saving = $state(false);
	let nuevo = $state({
		pacienteId: '',
		fecha: todayISO(),
		hora: '09:00',
		duracionMin: 45,
		modalidad: 'presencial' as 'presencial' | 'virtual',
		precio: 12000,
		notasBreves: ''
	});

	async function load() {
		turnos = await turnoRepo.listByDay(todayISO());
		pacientes = await pacienteRepo.list();
		pacientesById = Object.fromEntries(pacientes.map((p) => [p.id, p]));
	}

	async function ensureContext() {
		let prof = await profesionalRepo.getCurrent();
		if (!prof) prof = await profesionalRepo.upsert({ nombre: '[Tu Nombre]', email: '' });
		let cons = await consultorioRepo.getCurrent();
		if (!cons) cons = await consultorioRepo.upsert({ ownerId: prof.id, nombre: 'Consultorio' });
		return { prof, cons };
	}

	async function crear() {
		if (!nuevo.pacienteId) return;
		saving = true;
		try {
			const { prof, cons } = await ensureContext();
			await turnoRepo.create({
				consultorioId: cons.id,
				profesionalId: prof.id,
				pacienteId: nuevo.pacienteId,
				fechaHora: `${nuevo.fecha}T${nuevo.hora}`,
				duracionMin: nuevo.duracionMin,
				modalidad: nuevo.modalidad,
				estado: 'pendiente',
				precio: nuevo.precio,
				notasBreves: nuevo.notasBreves || undefined
			});
			openNuevo = false;
			nuevo = { ...nuevo, pacienteId: '', notasBreves: '' };
			await load();
		} finally {
			saving = false;
		}
	}

	async function setEstado(t: Turno, estado: Turno['estado']) {
		await turnoRepo.update(t.id, { estado });
		await load();
	}

	$effect(() => {
		const pacienteParam = page.url.searchParams.get('paciente');
		if (pacienteParam) {
			nuevo.pacienteId = pacienteParam;
			openNuevo = true;
		}
	});

	onMount(load);
</script>

<PageHeader title="Turnos de hoy" subtitle="{turnos.length} turnos · {todayISO()}">
	{#snippet actions()}
		<button class="btn btn-primary btn-sm" onclick={() => (openNuevo = true)}>
			<Plus class="h-4 w-4" /> <span class="hidden sm:inline">Nuevo</span>
		</button>
	{/snippet}
</PageHeader>

<div class="px-5 pt-4 pb-6 md:px-8 md:pb-8">
	<div class="card overflow-hidden">
		{#if turnos.length === 0}
			<EmptyState
				icon={Clock}
				title="Sin turnos para hoy"
				description="Agendá tu primer turno para empezar."
			>
				{#snippet actions()}
					<button class="btn btn-primary btn-sm" onclick={() => (openNuevo = true)}>
						<Plus class="h-4 w-4" /> Nuevo turno
					</button>
				{/snippet}
			</EmptyState>
		{:else}
			<ul>
				{#each turnos as t (t.id)}
					{@const p = pacientesById[t.pacienteId]}
					<li
						class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 md:px-5"
						style:border-color="var(--color-border)"
					>
						<div class="w-12 shrink-0 text-[13px] font-semibold">{fmtTime(t.fechaHora)}</div>
						<Avatar nombre={p?.nombre} apellido={p?.apellido} />
						<div class="min-w-0 flex-1">
							<a
								href={p ? `/pacientes/${p.id}` : '#'}
								class="block truncate text-[14px] font-medium hover:underline"
							>
								{p ? `${p.nombre} ${p.apellido}` : 'Paciente'}
							</a>
							<div class="truncate text-[12px]" style:color="var(--color-ink-faint)">
								{t.duracionMin} min · {t.modalidad}
								{t.notasBreves ? `· ${t.notasBreves}` : ''}
							</div>
						</div>
						<span
							class="badge hidden sm:inline-flex"
							class:badge-green={t.estado === 'realizado' || t.estado === 'confirmado'}
							class:badge-amber={t.estado === 'pendiente'}
							class:badge-red={t.estado === 'cancelado' || t.estado === 'ausente'}>{t.estado}</span
						>
						<div class="flex gap-1">
							<button
								class="btn btn-ghost btn-sm"
								title="Marcar realizado"
								onclick={() => setEstado(t, 'realizado')}
							>
								<Check class="h-4 w-4" />
							</button>
							<button
								class="btn btn-ghost btn-sm"
								title="Cancelar"
								onclick={() => setEstado(t, 'cancelado')}
							>
								<XIcon class="h-4 w-4" />
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<Sheet open={openNuevo} title="Nuevo turno" onClose={() => (openNuevo = false)}>
	<div class="space-y-4">
		<div>
			<label class="label" for="t-pac">Paciente</label>
			<select id="t-pac" class="input" bind:value={nuevo.pacienteId}>
				<option value="">— Elegir paciente —</option>
				{#each pacientes as p (p.id)}
					<option value={p.id}>{p.nombre} {p.apellido}</option>
				{/each}
			</select>
			{#if pacientes.length === 0}
				<p class="mt-2 text-[12px]" style:color="var(--color-warm)">
					No hay pacientes cargados. <a class="underline" href="/pacientes">Agregar uno</a>.
				</p>
			{/if}
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="label" for="t-fecha">Fecha</label>
				<input id="t-fecha" class="input" type="date" bind:value={nuevo.fecha} />
			</div>
			<div>
				<label class="label" for="t-hora">Hora</label>
				<input id="t-hora" class="input" type="time" bind:value={nuevo.hora} />
			</div>
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="label" for="t-dur">Duración (min)</label>
				<input
					id="t-dur"
					class="input"
					type="number"
					min="15"
					step="15"
					bind:value={nuevo.duracionMin}
				/>
			</div>
			<div>
				<label class="label" for="t-mod">Modalidad</label>
				<select id="t-mod" class="input" bind:value={nuevo.modalidad}>
					<option value="presencial">Presencial</option>
					<option value="virtual">Virtual</option>
				</select>
			</div>
		</div>
		<div>
			<label class="label" for="t-precio">Precio</label>
			<input id="t-precio" class="input" type="number" min="0" bind:value={nuevo.precio} />
		</div>
		<div>
			<label class="label" for="t-notas">Notas breves</label>
			<input id="t-notas" class="input" bind:value={nuevo.notasBreves} placeholder="opcional" />
		</div>
	</div>
	{#snippet footer()}
		<button class="btn btn-outline" onclick={() => (openNuevo = false)}>Cancelar</button>
		<button class="btn btn-primary" onclick={crear} disabled={saving || !nuevo.pacienteId}>
			{saving ? 'Guardando...' : 'Crear turno'}
		</button>
	{/snippet}
</Sheet>
