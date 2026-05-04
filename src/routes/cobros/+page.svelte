<script lang="ts">
	import PageHeader from '$components/PageHeader.svelte';
	import EmptyState from '$components/EmptyState.svelte';
	import StatCard from '$components/StatCard.svelte';
	import Sheet from '$components/Sheet.svelte';
	import { Plus, Wallet } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import {
		cobroRepo,
		pacienteRepo,
		consultorioRepo,
		profesionalRepo,
		todayISO
	} from '$db/repositories';
	import { fmtDate, fmtMoney } from '$utils/format';
	import type { Cobro, Paciente, MetodoCobro, EstadoCobro } from '$db/types';

	let cobros = $state<Cobro[]>([]);
	let pacientes = $state<Paciente[]>([]);
	let pacientesById = $state<Record<string, Paciente>>({});
	let cobradoMes = $state(0);
	let pendiente = $state(0);

	let openNuevo = $state(false);
	let saving = $state(false);
	let nuevo = $state({
		pacienteId: '',
		monto: 12000,
		metodo: 'efectivo' as MetodoCobro,
		estado: 'cobrado' as EstadoCobro,
		fecha: todayISO(),
		notas: ''
	});

	async function load() {
		cobros = await cobroRepo.list();
		pacientes = await pacienteRepo.list();
		pacientesById = Object.fromEntries(pacientes.map((p) => [p.id, p]));
		cobradoMes = await cobroRepo.sumMonth(todayISO().slice(0, 7));
		pendiente = await cobroRepo.sumByEstado('pendiente');
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
			const { cons } = await ensureContext();
			await cobroRepo.create({
				consultorioId: cons.id,
				pacienteId: nuevo.pacienteId,
				monto: nuevo.monto,
				metodo: nuevo.metodo,
				estado: nuevo.estado,
				fecha: nuevo.fecha,
				notas: nuevo.notas || undefined
			});
			openNuevo = false;
			nuevo = { ...nuevo, pacienteId: '', notas: '' };
			await load();
		} finally {
			saving = false;
		}
	}

	onMount(load);
</script>

<PageHeader title="Cobros" subtitle="Ingresos y pendientes">
	{#snippet actions()}
		<button class="btn btn-primary btn-sm" onclick={() => (openNuevo = true)}>
			<Plus class="h-4 w-4" /> <span class="hidden sm:inline">Registrar cobro</span>
		</button>
	{/snippet}
</PageHeader>

<div class="px-5 pt-4 pb-6 md:px-8 md:pb-8">
	<div class="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
		<StatCard label="Cobrado en el mes" value={fmtMoney(cobradoMes)} sub="ingresos confirmados" dotColor="#1E6E3A" />
		<StatCard label="Pendiente" value={fmtMoney(pendiente)} sub="por cobrar" dotColor="#C17A3C" />
		<StatCard label="Movimientos" value={cobros.length} sub="totales" />
	</div>

	<div class="card overflow-hidden">
		{#if cobros.length === 0}
			<EmptyState
				icon={Wallet}
				title="Sin movimientos"
				description="Registrá tu primer cobro para llevar la facturación."
			>
				{#snippet actions()}
					<button class="btn btn-primary btn-sm" onclick={() => (openNuevo = true)}>
						<Plus class="h-4 w-4" /> Registrar cobro
					</button>
				{/snippet}
			</EmptyState>
		{:else}
			<ul>
				{#each cobros as c (c.id)}
					{@const p = pacientesById[c.pacienteId]}
					<li
						class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 md:px-5"
						style:border-color="var(--color-border)"
					>
						<div class="min-w-0 flex-1">
							<div class="truncate text-[14px] font-medium">
								{p ? `${p.nombre} ${p.apellido}` : 'Paciente'}
							</div>
							<div class="truncate text-[12px]" style:color="var(--color-ink-faint)">
								{fmtDate(c.fecha)} · {c.metodo ?? '—'}
								{c.notas ? `· ${c.notas}` : ''}
							</div>
						</div>
						<div class="text-right">
							<div
								class="text-[15px] font-semibold"
								style:color={c.estado === 'cobrado' ? '#1E6E3A' : 'var(--color-warm)'}
							>
								{fmtMoney(c.monto)}
							</div>
							<span
								class="badge"
								class:badge-green={c.estado === 'cobrado'}
								class:badge-amber={c.estado === 'pendiente' || c.estado === 'parcial'}
								class:badge-red={c.estado === 'cancelado'}>{c.estado}</span
							>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<Sheet open={openNuevo} title="Registrar cobro" onClose={() => (openNuevo = false)}>
	<div class="space-y-4">
		<div>
			<label class="label" for="c-pac">Paciente</label>
			<select id="c-pac" class="input" bind:value={nuevo.pacienteId}>
				<option value="">— Elegir —</option>
				{#each pacientes as p (p.id)}
					<option value={p.id}>{p.nombre} {p.apellido}</option>
				{/each}
			</select>
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="label" for="c-monto">Monto (ARS)</label>
				<input id="c-monto" class="input" type="number" min="0" bind:value={nuevo.monto} />
			</div>
			<div>
				<label class="label" for="c-fecha">Fecha</label>
				<input id="c-fecha" class="input" type="date" bind:value={nuevo.fecha} />
			</div>
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="label" for="c-metodo">Método</label>
				<select id="c-metodo" class="input" bind:value={nuevo.metodo}>
					<option value="efectivo">Efectivo</option>
					<option value="transferencia">Transferencia</option>
					<option value="mercadopago">Mercado Pago</option>
					<option value="tarjeta">Tarjeta</option>
					<option value="otro">Otro</option>
				</select>
			</div>
			<div>
				<label class="label" for="c-estado">Estado</label>
				<select id="c-estado" class="input" bind:value={nuevo.estado}>
					<option value="cobrado">Cobrado</option>
					<option value="pendiente">Pendiente</option>
					<option value="parcial">Parcial</option>
					<option value="cancelado">Cancelado</option>
				</select>
			</div>
		</div>
		<div>
			<label class="label" for="c-notas">Notas</label>
			<input id="c-notas" class="input" bind:value={nuevo.notas} />
		</div>
	</div>
	{#snippet footer()}
		<button class="btn btn-outline" onclick={() => (openNuevo = false)}>Cancelar</button>
		<button class="btn btn-primary" onclick={crear} disabled={saving || !nuevo.pacienteId}>
			{saving ? 'Guardando...' : 'Registrar'}
		</button>
	{/snippet}
</Sheet>
