import Dexie, { type Table } from 'dexie';
import type {
	Profesional,
	Consultorio,
	Paciente,
	Turno,
	NotaSesion,
	Informe,
	Cobro,
	Recordatorio,
	AuditLog
} from './types';

export class PsicoDB extends Dexie {
	profesionales!: Table<Profesional, string>;
	consultorios!: Table<Consultorio, string>;
	pacientes!: Table<Paciente, string>;
	turnos!: Table<Turno, string>;
	notas!: Table<NotaSesion, string>;
	informes!: Table<Informe, string>;
	cobros!: Table<Cobro, string>;
	recordatorios!: Table<Recordatorio, string>;
	audit!: Table<AuditLog, string>;

	constructor() {
		super('psicogestion');

		this.version(1).stores({
			profesionales: 'id, email',
			consultorios: 'id, ownerId',
			pacientes: 'id, consultorioId, estado, apellido, nombre, [consultorioId+estado]',
			turnos: 'id, consultorioId, profesionalId, pacienteId, fechaHora, estado, [consultorioId+fechaHora], [profesionalId+fechaHora]',
			notas: 'id, turnoId, pacienteId, createdAt',
			informes: 'id, pacienteId, profesionalId, fecha',
			cobros: 'id, consultorioId, pacienteId, turnoId, estado, fecha',
			recordatorios: 'id, turnoId, status, scheduledAt',
			audit: 'id, profesionalId, timestamp, recursoTipo'
		});
	}
}

let dbInstance: PsicoDB | null = null;

export function getDB(): PsicoDB {
	if (!dbInstance) {
		if (typeof window === 'undefined') {
			throw new Error('La base de datos solo está disponible en el navegador');
		}
		dbInstance = new PsicoDB();
	}
	return dbInstance;
}
