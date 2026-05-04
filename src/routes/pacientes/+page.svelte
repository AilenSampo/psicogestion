<script lang="ts">
	import PageHeader from '$components/PageHeader.svelte';
	import EmptyState from '$components/EmptyState.svelte';
	import Sheet from '$components/Sheet.svelte';
	import Avatar from '$components/Avatar.svelte';
	import { Plus, Search, Users } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { pacienteRepo, consultorioRepo, profesionalRepo } from '$db/repositories';
	import { edad } from '$utils/format';
	import type { Paciente } from '$db/types';

	let q = $state('');
	let pacientes = $state<Paciente[]>([]);
	let openNuevo = $state(false);
	let saving = $state(false);

	let nuevo = $state({
		nombre: '',
		apellido: '',
		fechaNacimiento: '',
		tutorNombre: '',
		tutorTelefono: '',
		tutorEmail: '',
		motivoConsulta: '',
		escuela: ''
	});

	const filtrados = $derived.by(() => {
		const term = q.trim().toLowerCase();
		if (!term) return pacientes;
		return pacientes.filter((p) => {
			const hay = `${p.nombre} ${p.apellido} ${p.dni ?? ''} ${p.tutorNombre ?? ''}`.toLowerCase();
			return hay.includes(term);
		});
	});

	async function load() {
		pacientes = await pacienteRepo.list();
	}

	async function ensureConsultorio() {
		let cons = await consultorioRepo.getCurrent();
		if (!cons) {
			let prof = await profesionalRepo.getCurrent();
			if (!prof) prof = await profesionalRepo.upsert({ nombre: '[Tu Nombre]', email: '' });
			cons = await consultorioRepo.upsert({ ownerId: prof.id, nombre: 'Consultorio' });
		}
		return cons;
	}

	async function guardar() {
		if (!nuevo.nombre.trim() || !nuevo.apellido.trim()) return;
		saving = true;
		try {
			const cons = await ensureConsultorio();
			await pacienteRepo.create({
				consultorioId: cons.id,
				nombre: nuevo.nombre.trim(),
				apellido: nuevo.apellido.trim(),
				fechaNacimiento: nuevo.fechaNacimiento || undefined,
				tutorNombre: nuevo.tutorNombre.trim() || undefined,
				tutorTelefono: nuevo.tutorTelefono.trim() || undefined,
				tutorEmail: nuevo.tutorEmail.trim() || undefined,
				motivoConsulta: nuevo.motivoConsulta.trim() || undefined,
				escuela: nuevo.escuela.trim() || undefined,
				estado: 'activo',
				primeraConsulta: new Date().toISOString().slice(0, 10)
			});
			await load();
			openNuevo = false;
			nuevo = {
				nombre: '',
				apellido: '',
				fechaNacimiento: '',
				tutorNombre: '',
				tutorTelefono: '',
				tutorEmail: '',
				motivoConsulta: '',
				escuela: ''
			};
		} finally {
			saving = false;
		}
	}

	onMount(load);
</script>

<PageHeader title="Pacientes" subtitle="{pacientes.length} en total">
	{#snippet actions()}
		<button class="btn btn-primary btn-sm" onclick={() => (openNuevo = true)}>
			<Plus class="h-4 w-4" /> <span class="hidden sm:inline">Nuevo paciente</span>
		</button>
	{/snippet}
</PageHeader>

<div class="px-5 pt-4 pb-6 md:px-8 md:pb-8">
	<div class="relative mb-4">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
			style="color: var(--color-ink-faint)"
		/>
		<input
			class="input pl-9"
			type="search"
			placeholder="Buscar por nombre, apellido o tutor..."
			bind:value={q}
		/>
	</div>

	<div class="card overflow-hidden">
		{#if filtrados.length === 0}
			<EmptyState
				icon={Users}
				title={pacientes.length === 0 ? 'Aún no hay pacientes' : 'Sin resultados'}
				description={pacientes.length === 0
					? 'Empezá agregando tu primer paciente.'
					: 'Probá con otro término de búsqueda.'}
			>
				{#snippet actions()}
					{#if pacientes.length === 0}
						<button class="btn btn-primary btn-sm" onclick={() => (openNuevo = true)}>
							<Plus class="h-4 w-4" /> Agregar paciente
						</button>
					{/if}
				{/snippet}
			</EmptyState>
		{:else}
			<ul>
				{#each filtrados as p (p.id)}
					{@const e = edad(p.fechaNacimiento)}
					<li>
						<a
							href="/pacientes/{p.id}"
							class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-stone-50 md:px-5"
							style:border-color="var(--color-border)"
						>
							<Avatar nombre={p.nombre} apellido={p.apellido} />
							<div class="min-w-0 flex-1">
								<div class="truncate text-[14px] font-medium">
									{p.nombre} {p.apellido}
								</div>
								<div class="truncate text-[12px]" style:color="var(--color-ink-faint)">
									{e != null ? `${e} años` : 'sin edad'}
									{p.tutorNombre ? `· tutor/a: ${p.tutorNombre}` : ''}
								</div>
							</div>
							<span
								class="badge"
								class:badge-green={p.estado === 'activo'}
								class:badge-gray={p.estado !== 'activo'}>{p.estado}</span
							>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<Sheet open={openNuevo} title="Nuevo paciente" onClose={() => (openNuevo = false)}>
	<div class="space-y-4">
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="label" for="np-nombre">Nombre</label>
				<input id="np-nombre" class="input" bind:value={nuevo.nombre} placeholder="Martina" />
			</div>
			<div>
				<label class="label" for="np-apellido">Apellido</label>
				<input id="np-apellido" class="input" bind:value={nuevo.apellido} placeholder="Molina" />
			</div>
		</div>
		<div>
			<label class="label" for="np-fnac">Fecha de nacimiento</label>
			<input id="np-fnac" class="input" type="date" bind:value={nuevo.fechaNacimiento} />
		</div>
		<div>
			<label class="label" for="np-tutor">Tutor / responsable</label>
			<input id="np-tutor" class="input" bind:value={nuevo.tutorNombre} placeholder="Nombre y apellido" />
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="label" for="np-tutel">Teléfono tutor</label>
				<input id="np-tutel" class="input" type="tel" bind:value={nuevo.tutorTelefono} />
			</div>
			<div>
				<label class="label" for="np-tuemail">Email tutor</label>
				<input id="np-tuemail" class="input" type="email" bind:value={nuevo.tutorEmail} />
			</div>
		</div>
		<div>
			<label class="label" for="np-escuela">Escuela</label>
			<input id="np-escuela" class="input" bind:value={nuevo.escuela} />
		</div>
		<div>
			<label class="label" for="np-motivo">Motivo de consulta</label>
			<textarea id="np-motivo" class="input min-h-[80px]" bind:value={nuevo.motivoConsulta}></textarea>
		</div>
	</div>
	{#snippet footer()}
		<button class="btn btn-outline" onclick={() => (openNuevo = false)}>Cancelar</button>
		<button class="btn btn-primary" onclick={guardar} disabled={saving || !nuevo.nombre || !nuevo.apellido}>
			{saving ? 'Guardando...' : 'Guardar paciente'}
		</button>
	{/snippet}
</Sheet>
