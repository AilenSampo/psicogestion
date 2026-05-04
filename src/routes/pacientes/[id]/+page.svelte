<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import PageHeader from '$components/PageHeader.svelte';
	import Avatar from '$components/Avatar.svelte';
	import Sheet from '$components/Sheet.svelte';
	import EmptyState from '$components/EmptyState.svelte';
	import { Calendar, Trash2, Pencil, Phone, Mail } from 'lucide-svelte';
	import { pacienteRepo, turnoRepo, notaRepo } from '$db/repositories';
	import { fmtDate, fmtDateTime, edad, fmtTime } from '$utils/format';
	import type { Paciente, Turno, NotaSesion } from '$db/types';

	const id = $derived(page.params.id);
	let paciente = $state<Paciente | null>(null);
	let turnos = $state<Turno[]>([]);
	let notas = $state<NotaSesion[]>([]);
	let openEdit = $state(false);
	let openDelete = $state(false);
	let edit = $state<Partial<Paciente>>({});

	async function load() {
		if (!id) return;
		const p = await pacienteRepo.get(id);
		paciente = p ?? null;
		if (!p) return;
		turnos = await turnoRepo.listByPaciente(id);
		notas = await notaRepo.listByPaciente(id);
	}

	async function guardar() {
		if (!id) return;
		await pacienteRepo.update(id, edit);
		openEdit = false;
		await load();
	}

	async function eliminar() {
		if (!id) return;
		await pacienteRepo.remove(id);
		goto('/pacientes', { replaceState: true });
	}

	function abrirEdicion() {
		if (!paciente) return;
		edit = { ...paciente };
		openEdit = true;
	}

	$effect(() => {
		if (id) load();
	});

	onMount(load);
</script>

{#if !paciente}
	<div class="px-5 pt-8 md:px-8">
		<a href="/pacientes" class="text-[13px]" style:color="var(--color-accent)">← Volver</a>
		<p class="mt-6 text-center text-sm" style:color="var(--color-ink-faint)">Cargando...</p>
	</div>
{:else}
	<PageHeader title="{paciente.nombre} {paciente.apellido}" subtitle="Ficha del paciente">
		{#snippet actions()}
			<button class="btn btn-outline btn-sm" onclick={abrirEdicion}>
				<Pencil class="h-4 w-4" /> <span class="hidden sm:inline">Editar</span>
			</button>
			<button class="btn btn-danger btn-sm" onclick={() => (openDelete = true)}>
				<Trash2 class="h-4 w-4" />
			</button>
		{/snippet}
	</PageHeader>

	<div class="px-5 pt-4 pb-6 md:px-8 md:pb-8">
		<a href="/pacientes" class="mb-3 inline-block text-[13px]" style:color="var(--color-accent)">
			← Listado
		</a>

		<div class="card mb-4 flex items-center gap-4 p-4 md:p-5">
			<Avatar nombre={paciente.nombre} apellido={paciente.apellido} size="lg" />
			<div class="min-w-0 flex-1">
				<div class="text-[16px] font-semibold">{paciente.nombre} {paciente.apellido}</div>
				<div class="mt-0.5 text-[13px]" style:color="var(--color-ink-faint)">
					{#if edad(paciente.fechaNacimiento) != null}
						{edad(paciente.fechaNacimiento)} años ·
					{/if}
					{paciente.escuela ?? 'sin escuela'}
				</div>
			</div>
			<span
				class="badge"
				class:badge-green={paciente.estado === 'activo'}
				class:badge-gray={paciente.estado !== 'activo'}>{paciente.estado}</span
			>
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<div class="card p-4 md:p-5">
				<h3
					class="mb-3 text-[10.5px] font-semibold tracking-wider uppercase"
					style:color="var(--color-ink-faint)"
				>
					Datos del tutor
				</h3>
				<dl class="space-y-2 text-[13.5px]">
					<div class="flex justify-between gap-3">
						<dt style:color="var(--color-ink-faint)">Nombre</dt>
						<dd class="text-right font-medium">{paciente.tutorNombre || '—'}</dd>
					</div>
					<div class="flex justify-between gap-3">
						<dt style:color="var(--color-ink-faint)">Teléfono</dt>
						<dd class="text-right font-medium">
							{#if paciente.tutorTelefono}
								<a class="inline-flex items-center gap-1" href="tel:{paciente.tutorTelefono}">
									<Phone class="h-3.5 w-3.5" /> {paciente.tutorTelefono}
								</a>
							{:else}—{/if}
						</dd>
					</div>
					<div class="flex justify-between gap-3">
						<dt style:color="var(--color-ink-faint)">Email</dt>
						<dd class="truncate text-right font-medium">
							{#if paciente.tutorEmail}
								<a class="inline-flex items-center gap-1" href="mailto:{paciente.tutorEmail}">
									<Mail class="h-3.5 w-3.5" /> {paciente.tutorEmail}
								</a>
							{:else}—{/if}
						</dd>
					</div>
				</dl>
			</div>

			<div class="card p-4 md:p-5">
				<h3
					class="mb-3 text-[10.5px] font-semibold tracking-wider uppercase"
					style:color="var(--color-ink-faint)"
				>
					Información clínica
				</h3>
				<dl class="space-y-2 text-[13.5px]">
					<div class="flex justify-between gap-3">
						<dt style:color="var(--color-ink-faint)">Primera consulta</dt>
						<dd class="text-right font-medium">{fmtDate(paciente.primeraConsulta) || '—'}</dd>
					</div>
					<div>
						<dt style:color="var(--color-ink-faint)" class="mb-1">Motivo de consulta</dt>
						<dd>{paciente.motivoConsulta || '—'}</dd>
					</div>
				</dl>
			</div>
		</div>

		<section class="mt-6">
			<div class="mb-3 flex items-center justify-between">
				<h2 class="text-[15px] font-semibold">Turnos</h2>
				<a href="/turnos?paciente={paciente.id}" class="text-[13px]" style:color="var(--color-accent)"
					>+ Nuevo turno</a
				>
			</div>
			<div class="card overflow-hidden">
				{#if turnos.length === 0}
					<EmptyState icon={Calendar} title="Sin turnos registrados" />
				{:else}
					<ul>
						{#each turnos as t (t.id)}
							<li
								class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 md:px-5"
								style:border-color="var(--color-border)"
							>
								<div class="text-[13px] font-medium">{fmtDateTime(t.fechaHora)}</div>
								<div class="flex-1 text-[12px]" style:color="var(--color-ink-faint)">
									{t.duracionMin} min · {t.modalidad}
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
	</div>
{/if}

<Sheet open={openEdit} title="Editar paciente" onClose={() => (openEdit = false)}>
	<div class="space-y-4">
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="label" for="ed-nombre">Nombre</label>
				<input id="ed-nombre" class="input" bind:value={edit.nombre} />
			</div>
			<div>
				<label class="label" for="ed-apellido">Apellido</label>
				<input id="ed-apellido" class="input" bind:value={edit.apellido} />
			</div>
		</div>
		<div>
			<label class="label" for="ed-fnac">Fecha de nacimiento</label>
			<input id="ed-fnac" class="input" type="date" bind:value={edit.fechaNacimiento} />
		</div>
		<div>
			<label class="label" for="ed-tutor">Tutor / responsable</label>
			<input id="ed-tutor" class="input" bind:value={edit.tutorNombre} />
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label class="label" for="ed-tutel">Teléfono tutor</label>
				<input id="ed-tutel" class="input" type="tel" bind:value={edit.tutorTelefono} />
			</div>
			<div>
				<label class="label" for="ed-tuemail">Email tutor</label>
				<input id="ed-tuemail" class="input" type="email" bind:value={edit.tutorEmail} />
			</div>
		</div>
		<div>
			<label class="label" for="ed-escuela">Escuela</label>
			<input id="ed-escuela" class="input" bind:value={edit.escuela} />
		</div>
		<div>
			<label class="label" for="ed-motivo">Motivo de consulta</label>
			<textarea id="ed-motivo" class="input min-h-[80px]" bind:value={edit.motivoConsulta}></textarea>
		</div>
		<div>
			<label class="label" for="ed-estado">Estado</label>
			<select id="ed-estado" class="input" bind:value={edit.estado}>
				<option value="activo">Activo</option>
				<option value="inactivo">Inactivo</option>
				<option value="alta">Alta</option>
			</select>
		</div>
	</div>
	{#snippet footer()}
		<button class="btn btn-outline" onclick={() => (openEdit = false)}>Cancelar</button>
		<button class="btn btn-primary" onclick={guardar}>Guardar cambios</button>
	{/snippet}
</Sheet>

<Sheet open={openDelete} title="Eliminar paciente" onClose={() => (openDelete = false)}>
	<p class="text-[14px]">
		¿Eliminar a <strong>{paciente?.nombre} {paciente?.apellido}</strong>? Esta acción no se puede deshacer.
		Los turnos asociados quedarán huérfanos.
	</p>
	{#snippet footer()}
		<button class="btn btn-outline" onclick={() => (openDelete = false)}>Cancelar</button>
		<button class="btn btn-danger" onclick={eliminar}>Sí, eliminar</button>
	{/snippet}
</Sheet>
