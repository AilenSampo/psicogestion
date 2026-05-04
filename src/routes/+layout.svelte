<script lang="ts">
	import '../app.css';
	import Sidebar from '$components/Sidebar.svelte';
	import BottomNav from '$components/BottomNav.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-dvh">
	<Sidebar />
	<main class="md:ml-60">
		<div class="pb-24 md:pb-8">
			{@render children()}
		</div>
	</main>
	<BottomNav />
</div>
