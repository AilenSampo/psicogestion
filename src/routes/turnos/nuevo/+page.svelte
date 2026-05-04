<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	onMount(() => {
		goto('/turnos?nuevo=1', { replaceState: true });
	});
</script>

<p class="px-5 pt-8 text-center text-sm" style="color: var(--color-ink-faint)">Redirigiendo...</p>
