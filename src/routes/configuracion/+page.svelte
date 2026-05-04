<script lang="ts">
	import PageHeader from '$components/PageHeader.svelte';
	import { onMount } from 'svelte';
	import { profesionalRepo, consultorioRepo, exportAll, clearAllData } from '$db/repositories';
	import { seedDemo } from '$db/seed';
	import type { Profesional, Consultorio } from '$db/types';

	let prof = $state<Partial<Profesional>>({});
	let cons = $state<Partial<Consultorio>>({});
	let savedMsg = $state('');
	let busy = $state(false);

	async function load() {
		const p = await profesionalRepo.getCurrent();
		const c = await consultorioRepo.getCurrent();
		prof = p ?? { nombre: '', email: '' };
		cons = c ?? { nombre: 'Consultorio Psicopedagogía' };
	}

	async function guardar() {
		busy = true;
		try {
			const savedProf = await profesionalRepo.upsert(prof);
			await consultorioRepo.upsert({ ...cons, ownerId: savedProf.id });
			savedMsg = 'Cambios guardados';
			setTimeout(() => (savedMsg = ''), 2000);
			await load();
		} finally {
			busy = false;
		}
	}

	async function cargarDemo() {
		if (!confirm('Esto reemplaza todos los datos actuales con datos de ejemplo. ¿Continuar?')) return;
		busy = true;
		try {
			await seedDemo();
			await load();
			alert('Datos de demo cargados. Recargá la página para ver los cambios reflejados.');
		} finally {
			busy = false;
		}
	}

	async function borrarTodo() {
		if (!confirm('Esto borra TODOS los datos del navegador (pacientes, turnos, cobros, etc). No se puede deshacer.')) return;
		busy = true;
		try {
			await clearAllData();
			alert('Datos borrados.');
			await load();
		} finally {
			busy = false;
		}
	}

	async function exportar() {
		const data = await exportAll();
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `psicogestion-backup-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	onMount(load);
</script>

<PageHeader title="Configuración" subtitle="Perfil, consultorio y datos">
	{#snippet actions()}
		{#if savedMsg}
			<span class="text-[13px]" style:color="var(--color-accent)">{savedMsg}</span>
		{/if}
		<button class="btn btn-primary btn-sm" onclick={guardar} disabled={busy}>Guardar</button>
	{/snippet}
</PageHeader>

<div class="space-y-5 px-5 pt-4 pb-6 md:px-8 md:pb-8">
	<section class="card p-4 md:p-5">
		<h2 class="mb-3 text-[14px] font-semibold">Perfil profesional</h2>
		<div class="space-y-3">
			<div>
				<label class="label" for="cf-nombre">Nombre completo</label>
				<input id="cf-nombre" class="input" bind:value={prof.nombre} />
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label class="label" for="cf-mat">Matrícula</label>
					<input id="cf-mat" class="input" bind:value={prof.matricula} />
				</div>
				<div>
					<label class="label" for="cf-esp">Especialidad</label>
					<input id="cf-esp" class="input" bind:value={prof.especialidad} />
				</div>
			</div>
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label class="label" for="cf-email">Email</label>
					<input id="cf-email" class="input" type="email" bind:value={prof.email} />
				</div>
				<div>
					<label class="label" for="cf-tel">Teléfono</label>
					<input id="cf-tel" class="input" type="tel" bind:value={prof.telefono} />
				</div>
			</div>
		</div>
	</section>

	<section class="card p-4 md:p-5">
		<h2 class="mb-3 text-[14px] font-semibold">Consultorio</h2>
		<div class="space-y-3">
			<div>
				<label class="label" for="cf-cons">Nombre del consultorio</label>
				<input id="cf-cons" class="input" bind:value={cons.nombre} />
			</div>
			<div>
				<label class="label" for="cf-dir">Dirección</label>
				<input id="cf-dir" class="input" bind:value={cons.direccion} />
			</div>
			<div>
				<label class="label" for="cf-ctel">Teléfono</label>
				<input id="cf-ctel" class="input" type="tel" bind:value={cons.telefono} />
			</div>
		</div>
	</section>

	<section class="card p-4 md:p-5">
		<h2 class="mb-1 text-[14px] font-semibold">Datos del navegador</h2>
		<p class="mb-3 text-[12.5px]" style:color="var(--color-ink-faint)">
			Toda la información se guarda localmente en este dispositivo (IndexedDB). En la próxima fase
			migramos a Supabase para que puedas acceder desde cualquier dispositivo y tener backups
			automáticos.
		</p>
		<div class="flex flex-wrap gap-2">
			<button class="btn btn-outline btn-sm" onclick={exportar} disabled={busy}>
				Exportar backup (JSON)
			</button>
			<button class="btn btn-outline btn-sm" onclick={cargarDemo} disabled={busy}>
				Cargar datos de ejemplo
			</button>
			<button class="btn btn-danger btn-sm" onclick={borrarTodo} disabled={busy}>
				Borrar todos los datos
			</button>
		</div>
	</section>

	<section class="card p-4 md:p-5">
		<h2 class="mb-1 text-[14px] font-semibold">Acerca de</h2>
		<dl class="space-y-1 text-[13px]">
			<div class="flex justify-between">
				<dt style:color="var(--color-ink-faint)">Versión</dt>
				<dd>0.1.0 — Fase 1 (local-only)</dd>
			</div>
			<div class="flex justify-between">
				<dt style:color="var(--color-ink-faint)">Almacenamiento</dt>
				<dd>IndexedDB del navegador</dd>
			</div>
		</dl>
	</section>
</div>
