/**
 * Repositorios. Una capa única para que el resto de la app no sepa si está hablando
 * con IndexedDB (Fase 1) o Supabase (Fase 2). Esto se cambia con un `if` cuando llegue
 * el momento, o mejor con dependency injection si crece.
 */
import { getDB } from './schema';
import type {
	Paciente,
	Turno,
	NotaSesion,
	Informe,
	Cobro,
	Profesional,
	Consultorio,
	ID,
	ISODate
} from './types';
import { uid, nowISO, todayISO } from '$utils/ids';

// ==================== PROFESIONAL & CONSULTORIO ====================

export const profesionalRepo = {
	async getCurrent(): Promise<Profesional | null> {
		const list = await getDB().profesionales.toArray();
		return list[0] ?? null;
	},
	async upsert(input: Partial<Profesional>): Promise<Profesional> {
		const existing = await this.getCurrent();
		const now = nowISO();
		const next: Profesional = {
			id: existing?.id ?? uid(),
			email: input.email ?? existing?.email ?? '',
			nombre: input.nombre ?? existing?.nombre ?? '',
			matricula: input.matricula ?? existing?.matricula,
			especialidad: input.especialidad ?? existing?.especialidad,
			telefono: input.telefono ?? existing?.telefono,
			avatarColor: input.avatarColor ?? existing?.avatarColor ?? '#2E6B5E',
			createdAt: existing?.createdAt ?? now,
			updatedAt: now
		};
		await getDB().profesionales.put(next);
		return next;
	}
};

export const consultorioRepo = {
	async getCurrent(): Promise<Consultorio | null> {
		const list = await getDB().consultorios.toArray();
		return list[0] ?? null;
	},
	async upsert(input: Partial<Consultorio> & { ownerId: ID }): Promise<Consultorio> {
		const existing = await this.getCurrent();
		const now = nowISO();
		const next: Consultorio = {
			id: existing?.id ?? uid(),
			ownerId: input.ownerId,
			nombre: input.nombre ?? existing?.nombre ?? 'Consultorio',
			direccion: input.direccion ?? existing?.direccion,
			telefono: input.telefono ?? existing?.telefono,
			createdAt: existing?.createdAt ?? now,
			updatedAt: now
		};
		await getDB().consultorios.put(next);
		return next;
	}
};

// ==================== PACIENTES ====================

export const pacienteRepo = {
	async list(opts: { estado?: Paciente['estado']; q?: string } = {}): Promise<Paciente[]> {
		let coll = getDB().pacientes.orderBy('apellido');
		const all = await coll.toArray();
		const filtered = all.filter((p) => {
			if (opts.estado && p.estado !== opts.estado) return false;
			if (opts.q) {
				const q = opts.q.toLowerCase();
				const hay = `${p.nombre} ${p.apellido} ${p.dni ?? ''} ${p.tutorNombre ?? ''}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			return true;
		});
		return filtered;
	},
	async get(id: ID): Promise<Paciente | undefined> {
		return getDB().pacientes.get(id);
	},
	async create(input: Omit<Paciente, 'id' | 'createdAt' | 'updatedAt'>): Promise<Paciente> {
		const now = nowISO();
		const p: Paciente = { ...input, id: uid(), createdAt: now, updatedAt: now };
		await getDB().pacientes.add(p);
		return p;
	},
	async update(id: ID, patch: Partial<Paciente>): Promise<Paciente> {
		const existing = await this.get(id);
		if (!existing) throw new Error(`Paciente ${id} no encontrado`);
		const next: Paciente = { ...existing, ...patch, id, updatedAt: nowISO() };
		await getDB().pacientes.put(next);
		return next;
	},
	async remove(id: ID): Promise<void> {
		await getDB().pacientes.delete(id);
	},
	async count(): Promise<number> {
		return getDB().pacientes.count();
	},
	async countByEstado(estado: Paciente['estado']): Promise<number> {
		return getDB().pacientes.where('estado').equals(estado).count();
	}
};

// ==================== TURNOS ====================

export const turnoRepo = {
	async list(opts: { from?: string; to?: string; estado?: Turno['estado'] } = {}): Promise<Turno[]> {
		const all = await getDB().turnos.orderBy('fechaHora').toArray();
		return all.filter((t) => {
			if (opts.from && t.fechaHora < opts.from) return false;
			if (opts.to && t.fechaHora > opts.to) return false;
			if (opts.estado && t.estado !== opts.estado) return false;
			return true;
		});
	},
	async listByPaciente(pacienteId: ID): Promise<Turno[]> {
		return getDB().turnos.where('pacienteId').equals(pacienteId).reverse().sortBy('fechaHora');
	},
	async listByDay(day: ISODate): Promise<Turno[]> {
		return this.list({ from: `${day}T00:00`, to: `${day}T23:59` });
	},
	async listWeek(mondayISO: ISODate): Promise<Turno[]> {
		const start = `${mondayISO}T00:00`;
		const endDate = new Date(mondayISO);
		endDate.setDate(endDate.getDate() + 6);
		const end = `${endDate.toISOString().slice(0, 10)}T23:59`;
		return this.list({ from: start, to: end });
	},
	async get(id: ID): Promise<Turno | undefined> {
		return getDB().turnos.get(id);
	},
	async create(input: Omit<Turno, 'id' | 'createdAt' | 'updatedAt'>): Promise<Turno> {
		const now = nowISO();
		const t: Turno = { ...input, id: uid(), createdAt: now, updatedAt: now };
		await getDB().turnos.add(t);
		return t;
	},
	async update(id: ID, patch: Partial<Turno>): Promise<Turno> {
		const existing = await this.get(id);
		if (!existing) throw new Error(`Turno ${id} no encontrado`);
		const next: Turno = { ...existing, ...patch, id, updatedAt: nowISO() };
		await getDB().turnos.put(next);
		return next;
	},
	async remove(id: ID): Promise<void> {
		await getDB().turnos.delete(id);
	}
};

// ==================== NOTAS ====================

export const notaRepo = {
	async listByPaciente(pacienteId: ID): Promise<NotaSesion[]> {
		return getDB().notas.where('pacienteId').equals(pacienteId).reverse().sortBy('createdAt');
	},
	async getByTurno(turnoId: ID): Promise<NotaSesion | undefined> {
		const r = await getDB().notas.where('turnoId').equals(turnoId).toArray();
		return r[0];
	},
	async upsert(input: Omit<NotaSesion, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID }): Promise<NotaSesion> {
		const now = nowISO();
		if (input.id) {
			const existing = await getDB().notas.get(input.id);
			if (existing) {
				const next: NotaSesion = { ...existing, ...input, id: input.id, updatedAt: now };
				await getDB().notas.put(next);
				return next;
			}
		}
		const n: NotaSesion = { ...input, id: input.id ?? uid(), createdAt: now, updatedAt: now };
		await getDB().notas.put(n);
		return n;
	},
	async remove(id: ID): Promise<void> {
		await getDB().notas.delete(id);
	}
};

// ==================== INFORMES ====================

export const informeRepo = {
	async list(): Promise<Informe[]> {
		return getDB().informes.orderBy('fecha').reverse().toArray();
	},
	async listByPaciente(pacienteId: ID): Promise<Informe[]> {
		return getDB().informes.where('pacienteId').equals(pacienteId).reverse().sortBy('fecha');
	},
	async get(id: ID): Promise<Informe | undefined> {
		return getDB().informes.get(id);
	},
	async create(input: Omit<Informe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Informe> {
		const now = nowISO();
		const i: Informe = { ...input, id: uid(), createdAt: now, updatedAt: now };
		await getDB().informes.add(i);
		return i;
	},
	async update(id: ID, patch: Partial<Informe>): Promise<Informe> {
		const existing = await this.get(id);
		if (!existing) throw new Error(`Informe ${id} no encontrado`);
		const next: Informe = { ...existing, ...patch, id, updatedAt: nowISO() };
		await getDB().informes.put(next);
		return next;
	},
	async remove(id: ID): Promise<void> {
		await getDB().informes.delete(id);
	}
};

// ==================== COBROS ====================

export const cobroRepo = {
	async list(opts: { estado?: Cobro['estado']; from?: ISODate; to?: ISODate } = {}): Promise<Cobro[]> {
		const all = await getDB().cobros.orderBy('fecha').reverse().toArray();
		return all.filter((c) => {
			if (opts.estado && c.estado !== opts.estado) return false;
			if (opts.from && c.fecha < opts.from) return false;
			if (opts.to && c.fecha > opts.to) return false;
			return true;
		});
	},
	async sumByEstado(estado: Cobro['estado']): Promise<number> {
		const list = await getDB().cobros.where('estado').equals(estado).toArray();
		return list.reduce((acc, c) => acc + (c.monto ?? 0), 0);
	},
	async sumMonth(yearMonth: string): Promise<number> {
		const list = await getDB().cobros.toArray();
		return list
			.filter((c) => c.fecha.startsWith(yearMonth) && c.estado === 'cobrado')
			.reduce((acc, c) => acc + c.monto, 0);
	},
	async get(id: ID): Promise<Cobro | undefined> {
		return getDB().cobros.get(id);
	},
	async create(input: Omit<Cobro, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cobro> {
		const now = nowISO();
		const c: Cobro = { ...input, id: uid(), createdAt: now, updatedAt: now };
		await getDB().cobros.add(c);
		return c;
	},
	async update(id: ID, patch: Partial<Cobro>): Promise<Cobro> {
		const existing = await this.get(id);
		if (!existing) throw new Error(`Cobro ${id} no encontrado`);
		const next: Cobro = { ...existing, ...patch, id, updatedAt: nowISO() };
		await getDB().cobros.put(next);
		return next;
	},
	async remove(id: ID): Promise<void> {
		await getDB().cobros.delete(id);
	}
};

// ==================== UTILIDADES ====================

export async function clearAllData(): Promise<void> {
	const db = getDB();
	await Promise.all([
		db.pacientes.clear(),
		db.turnos.clear(),
		db.notas.clear(),
		db.informes.clear(),
		db.cobros.clear(),
		db.recordatorios.clear(),
		db.audit.clear()
	]);
}

export async function exportAll(): Promise<Record<string, unknown[]>> {
	const db = getDB();
	const [
		profesionales,
		consultorios,
		pacientes,
		turnos,
		notas,
		informes,
		cobros,
		recordatorios
	] = await Promise.all([
		db.profesionales.toArray(),
		db.consultorios.toArray(),
		db.pacientes.toArray(),
		db.turnos.toArray(),
		db.notas.toArray(),
		db.informes.toArray(),
		db.cobros.toArray(),
		db.recordatorios.toArray()
	]);
	return {
		profesionales,
		consultorios,
		pacientes,
		turnos,
		notas,
		informes,
		cobros,
		recordatorios
	};
}

export { todayISO, nowISO, uid };
