<script lang="ts">
	import PageHeader from '$components/PageHeader.svelte';
	import EmptyState from '$components/EmptyState.svelte';
	import Sheet from '$components/Sheet.svelte';
	import { Plus, FileText } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { informeRepo, pacienteRepo, profesionalRepo, todayISO } from '$db/repositories';
	import { fmtDate } from '$utils/format';
	import type { Informe, Paciente } from '$db/types';

	let informes = $state<Informe[]>([]);
	let pacientes = $state<Paciente[]>([]);
	let pacientesById = $state<Record<string, Paciente>>({});

	let openNuevo = $state(false);
	let saving = $state(false);
	let nuevo = $state({
		pacienteId: '',
		titulo: 'Informe pedagógico',
		contenido: '',
		fecha: todayISO()
	});

	async function load() {
		informes = await informeRepo.list();
		pacientes = await pacienteRepo.list();
		pacientesById = Object.fromEntries(pacientes.map((p) => [p.id, p]));
	}

	async function crear() {
		if (!nuevo.pacienteId || !nuevo.titulo) return;
		saving = true;
		try {
			let prof = await profesionalRepo.getCurrent();
			if (!prof) prof = await profesionalRepo.upsert({ nombre: '[Tu Nombre]', email: '' });
			await informeRepo.create({
				pacienteId: nuevo.pacienteId,
				profesionalId: prof.id,
				titulo: nuevo.titulo,
				contenido: nuevo.contenido,
				fecha: nuevo.fecha,
				firmadoBool: false
			});
			openNuevo = false;
			nuevo = { ...nuevo, pacienteId: '', contenido: '' };
			await load();
		} finally {
			saving = false;
		}
	}

	onMount(load);
</script>

<PageHeader title="Informes" subtitle="{informes.length} informe{informes.length === 1 ? '' : 's'}">
	{#snippet actions()}
		<button class="btn btn-primary btn-sm" onclick={() => (openNuevo = true)}>
			<Plus class="h-4 w-4" /> <span class="hidden sm:inline">Nuevo</span>
		</button>
	{/snippet}
</PageHeader>

<div class="px-5 pt-4 pb-6 md:px-8 md:pb-8">
	<div class="card overflow-hidden">
		{#if informes.length === 0}
			<EmptyState
				icon={FileText}
				title="Sin informes"
				description="Cuando armes un informe para un paciente, lo vas a ver acá."
			>
				{#snippet actions()}
					<button class="btn btn-primary btn-sm" onclick={() => (openNuevo = true)}>
						<Plus class="h-4 w-4" /> Crear informe
					</button>
				{/snippet}
			</EmptyState>
		{:else}
			<ul>
				{#each informes as i (i.id)}
					{@const p = pacientesById[i.pacienteId]}
					<li
						class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 md:px-5"
						style:border-color="var(--color-border)"
					>
						<div class="min-w-0 flex-1">
							<div class="truncate text-[14px] font-medium">{i.titulo}</div>
							<div class="truncate text-[12px]" style:color="var(--color-ink-faint)">
								{p ? `${p.nombre} ${p.apellido}` : 'Paciente'} · {fmtDate(i.fecha)}
							</div>
						</div>
						<span
							class="badge"
							class:badge-green={i.firmadoBool}
							class:badge-amber={!i.firmadoBool}>{i.firmadoBool ? 'firmado' : 'borrador'}</span
						>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<p class="mt-6 text-[12px]" style:color="var(--color-ink-faint)">
		La exportación a PDF y la firma digital llegan en Fase 3.
	</p>
</div>

<Sheet open={openNuevo} title="Nuevo informe" onClose={() => (openNuevo = false)}>
	<div class="space-y-4">
		<div>
			<label class="label" for="i-pac">Paciente</label>
			<select id="i-pac" class="input" bind:value={nuevo.pacienteId}>
				<option value="">— Elegir —</option>
				{#each pacientes as p (p.id)}
					<option value={p.id}>{p.nombre} {p.apellido}</option>
				{/each}
			</select>
		</div>
		<div>
			<label class="label" for="i-tit">Título</label>
			<input id="i-tit" class="input" bind:value={nuevo.titulo} />
		</div>
		<div>
			<label class="label" for="i-fecha">Fecha</label>
			<input id="i-fecha" class="input" type="date" bind:value={nuevo.fecha} />
		</div>
		<div>
			<label class="label" for="i-cont">Contenido</label>
			<textarea id="i-cont" class="input min-h-[160px]" bind:value={nuevo.contenido}></textarea>
		</div>
	</div>
	{#snippet footer()}
		<button class="btn btn-outline" onclick={() => (openNuevo = false)}>Cancelar</button>
		<button class="btn btn-primary" onclick={crear} disabled={saving || !nuevo.pacienteId}>
			{saving ? 'Guardando...' : 'Guardar'}
		</button>
	{/snippet}
</Sheet>
