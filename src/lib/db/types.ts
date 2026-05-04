/**
 * Tipos del dominio. Diseñados para sobrevivir a la migración de IndexedDB → Supabase.
 *
 * Convenciones:
 * - IDs string (UUID v4 generados client-side). Compatibles con Postgres uuid.
 * - Fechas ISO 8601 string (YYYY-MM-DD para fechas, YYYY-MM-DDTHH:mm para datetimes).
 * - `consultorio_id` está presente desde el día 1 aunque hoy haya 1 solo, para no migrar después.
 */

export type ID = string;
export type ISODate = string;
export type ISODateTime = string;

export type EstadoTurno = 'pendiente' | 'confirmado' | 'realizado' | 'cancelado' | 'ausente';
export type ModalidadTurno = 'presencial' | 'virtual';
export type EstadoCobro = 'pendiente' | 'cobrado' | 'parcial' | 'cancelado';
export type MetodoCobro = 'efectivo' | 'transferencia' | 'mercadopago' | 'tarjeta' | 'otro';
export type CanalRecordatorio = 'whatsapp' | 'email' | 'sms' | 'push';

export interface Profesional {
	id: ID;
	email: string;
	nombre: string;
	matricula?: string;
	especialidad?: string;
	telefono?: string;
	avatarColor?: string;
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

export interface Consultorio {
	id: ID;
	ownerId: ID;
	nombre: string;
	direccion?: string;
	telefono?: string;
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

export interface Paciente {
	id: ID;
	consultorioId: ID;
	nombre: string;
	apellido: string;
	fechaNacimiento?: ISODate;
	dni?: string;
	genero?: 'M' | 'F' | 'X' | 'otro';
	tutorNombre?: string;
	tutorTelefono?: string;
	tutorEmail?: string;
	tutorParentesco?: string;
	escuela?: string;
	grado?: string;
	derivadoPor?: string;
	motivoConsulta?: string;
	obraSocial?: string;
	planObraSocial?: string;
	numeroAfiliado?: string;
	notasGenerales?: string;
	estado: 'activo' | 'inactivo' | 'alta';
	primeraConsulta?: ISODate;
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

export interface Turno {
	id: ID;
	consultorioId: ID;
	profesionalId: ID;
	pacienteId: ID;
	fechaHora: ISODateTime;
	duracionMin: number;
	modalidad: ModalidadTurno;
	estado: EstadoTurno;
	precio?: number;
	notasBreves?: string;
	linkVirtual?: string;
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

export interface NotaSesion {
	id: ID;
	turnoId: ID;
	pacienteId: ID;
	contenido: string;
	objetivos?: string;
	tareasParaCasa?: string;
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

export interface Informe {
	id: ID;
	pacienteId: ID;
	profesionalId: ID;
	titulo: string;
	contenido: string;
	fecha: ISODate;
	firmadoBool: boolean;
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

export interface Cobro {
	id: ID;
	turnoId?: ID;
	pacienteId: ID;
	consultorioId: ID;
	monto: number;
	metodo?: MetodoCobro;
	estado: EstadoCobro;
	fecha: ISODate;
	notas?: string;
	mpPaymentId?: string;
	createdAt: ISODateTime;
	updatedAt: ISODateTime;
}

export interface Recordatorio {
	id: ID;
	turnoId: ID;
	canal: CanalRecordatorio;
	scheduledAt: ISODateTime;
	sentAt?: ISODateTime;
	status: 'pendiente' | 'enviado' | 'fallido';
	error?: string;
	createdAt: ISODateTime;
}

export interface AuditLog {
	id: ID;
	profesionalId: ID;
	accion: string;
	recursoTipo: string;
	recursoId?: ID;
	timestamp: ISODateTime;
}
