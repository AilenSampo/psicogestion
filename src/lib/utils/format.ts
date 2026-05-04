import { format, parseISO, differenceInYears, isValid, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export function fmtDate(iso: string | undefined, pattern = "d 'de' MMM yyyy"): string {
	if (!iso) return '';
	const d = parseISO(iso);
	if (!isValid(d)) return '';
	return format(d, pattern, { locale: es });
}

export function fmtDateTime(iso: string | undefined, pattern = "d MMM, HH:mm"): string {
	if (!iso) return '';
	const d = parseISO(iso);
	if (!isValid(d)) return '';
	return format(d, pattern, { locale: es });
}

export function fmtTime(iso: string | undefined): string {
	if (!iso) return '';
	const d = parseISO(iso);
	if (!isValid(d)) return '';
	return format(d, 'HH:mm');
}

export function fmtMoney(n: number | undefined, currency: 'ARS' | 'USD' = 'ARS'): string {
	if (n == null) return '';
	return new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0
	}).format(n);
}

export function edad(fechaNac: string | undefined): number | null {
	if (!fechaNac) return null;
	const d = parseISO(fechaNac);
	if (!isValid(d)) return null;
	return differenceInYears(new Date(), d);
}

export function iniciales(nombre = '', apellido = ''): string {
	const a = (nombre.trim()[0] ?? '').toUpperCase();
	const b = (apellido.trim()[0] ?? '').toUpperCase();
	return (a + b) || 'P';
}

export function lunesDe(d: Date = new Date()): string {
	const m = startOfWeek(d, { weekStartsOn: 1 });
	return format(m, 'yyyy-MM-dd');
}

export function avatarColorFromName(s: string): string {
	const palette = ['#2E6B5E', '#C17A3C', '#1A4F8A', '#1E6E3A', '#7B5EA8', '#A85E5E', '#5E8AA8'];
	let h = 0;
	for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
	return palette[h % palette.length];
}
