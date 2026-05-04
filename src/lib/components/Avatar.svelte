<script lang="ts">
	import { iniciales, avatarColorFromName } from '$utils/format';

	interface Props {
		nombre?: string;
		apellido?: string;
		color?: string;
		size?: 'sm' | 'md' | 'lg';
	}
	let { nombre = '', apellido = '', color, size = 'md' }: Props = $props();

	const initials = $derived(iniciales(nombre, apellido));
	const bg = $derived(color ?? avatarColorFromName(`${nombre}${apellido}`));

	const sizeMap = {
		sm: 'h-7 w-7 text-[10px]',
		md: 'h-9 w-9 text-[12px]',
		lg: 'h-12 w-12 text-[16px]'
	};
</script>

<div
	class="inline-flex items-center justify-center rounded-full font-semibold text-white {sizeMap[size]}"
	style:background={bg}
>
	{initials}
</div>
