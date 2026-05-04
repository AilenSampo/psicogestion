import { pacienteRepo, turnoRepo, cobroRepo, consultorioRepo, profesionalRepo, clearAllData } from './repositories';
import { todayISO, nowISO } from '$utils/ids';

/**
 * Carga datos de ejemplo para que un profesional pueda explorar la app
 * antes de cargar sus datos reales. Se llama desde Configuración → "Cargar datos de ejemplo".
 */
export async function seedDemo(): Promise<void> {
	await clearAllData();

	const prof = await profesionalRepo.upsert({
		nombre: '[Tu Nombre]',
		email: 'demo@psicogestion.local',
		especialidad: 'Psicopedagogía clínica'
	});
	const cons = await consultorioRepo.upsert({
		ownerId: prof.id,
		nombre: 'Consultorio Psicopedagogía',
		direccion: 'Av. Demo 1234'
	});

	const baseFecha = new Date();
	const today = todayISO();

	const pacientes = await Promise.all(
		[
			{ nombre: 'Martina', apellido: 'Molina', edadAnios: 8, tutor: 'Sandra Molina', motivo: 'Dificultades de lectoescritura' },
			{ nombre: 'Tomás', apellido: 'García', edadAnios: 10, tutor: 'Roberto García', motivo: 'TDAH, trabajo en autorregulación' },
			{ nombre: 'Lucía', apellido: 'Herrera', edadAnios: 7, tutor: 'Mariana Herrera', motivo: 'Apoyo escolar' },
			{ nombre: 'Joaquín', apellido: 'Pérez', edadAnios: 9, tutor: 'Patricia Pérez', motivo: 'Dislexia' }
		].map(async (s) => {
			const fechaNac = new Date(baseFecha);
			fechaNac.setFullYear(fechaNac.getFullYear() - s.edadAnios);
			return pacienteRepo.create({
				consultorioId: cons.id,
				nombre: s.nombre,
				apellido: s.apellido,
				fechaNacimiento: fechaNac.toISOString().slice(0, 10),
				tutorNombre: s.tutor,
				tutorTelefono: '+54 11 5555-' + Math.floor(1000 + Math.random() * 8999),
				tutorEmail: s.tutor.split(' ')[0].toLowerCase() + '@email.com',
				motivoConsulta: s.motivo,
				estado: 'activo',
				escuela: 'Escuela Demo'
			});
		})
	);

	const horarios = ['09:00', '10:30', '14:00', '15:30', '17:00'];
	const turnosCreados = await Promise.all(
		pacientes.flatMap((p, i) => [
			turnoRepo.create({
				consultorioId: cons.id,
				profesionalId: prof.id,
				pacienteId: p.id,
				fechaHora: `${today}T${horarios[i % horarios.length]}`,
				duracionMin: 45,
				modalidad: 'presencial',
				estado: i === 0 ? 'realizado' : i === 1 ? 'confirmado' : 'pendiente',
				precio: 12000
			})
		])
	);

	await Promise.all(
		turnosCreados.slice(0, 2).map((t) =>
			cobroRepo.create({
				consultorioId: cons.id,
				pacienteId: t.pacienteId,
				turnoId: t.id,
				monto: t.precio ?? 12000,
				estado: 'cobrado',
				metodo: 'transferencia',
				fecha: today
			})
		)
	);
	await cobroRepo.create({
		consultorioId: cons.id,
		pacienteId: pacientes[2].id,
		monto: 12000,
		estado: 'pendiente',
		fecha: today
	});
}
